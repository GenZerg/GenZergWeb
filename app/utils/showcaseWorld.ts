import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  FogExp2,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import type { MusicActivityPoint, ShowcaseItem, ShowcaseZone } from '../../shared/types/showcase'

export type ShowcaseSelection = ShowcaseItem | null

export type ShowcaseWorldHandle = {
  dispose: () => void
  setItems: (items: ShowcaseItem[]) => void
  setActivity: (points: MusicActivityPoint[]) => void
  focusZone: (zone: ShowcaseZone) => void
}

type WorldOptions = {
  reducedMotion?: boolean
  onSelect?: (item: ShowcaseSelection) => void
  onHover?: (item: ShowcaseSelection) => void
}

type PanelUserData = {
  item: ShowcaseItem
  baseScale: number
  phase: number
}

function makeLeafTexture(hex: string) {
  const size = 8
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(1, 1, 3, 3)
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fillRect(4, 4, 3, 3)
  const tex = new CanvasTexture(canvas)
  tex.magFilter = NearestFilter
  tex.minFilter = NearestFilter
  tex.needsUpdate = true
  return tex
}

function makeBarkTexture() {
  const size = 8
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  ctx.fillStyle = '#3a2818'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = '#2a1c10'
  ctx.fillRect(2, 0, 1, size)
  ctx.fillRect(5, 0, 1, size)
  const tex = new CanvasTexture(canvas)
  tex.magFilter = NearestFilter
  tex.minFilter = NearestFilter
  tex.needsUpdate = true
  return tex
}

function makeFallbackPoster(item: ShowcaseItem) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 192
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = false
  const colors = {
    anime: '#1f6b2c',
    film: '#245a3a',
    track: '#3a7a28',
  }
  ctx.fillStyle = colors[item.kind]
  ctx.fillRect(0, 0, 128, 192)
  ctx.fillStyle = '#0f2a16'
  ctx.fillRect(8, 8, 112, 176)
  ctx.fillStyle = '#d8f5c8'
  ctx.font = 'bold 42px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(item.title.slice(0, 1).toUpperCase(), 64, 100)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.magFilter = NearestFilter
  tex.minFilter = NearestFilter
  tex.needsUpdate = true
  return tex
}

function zoneAnchor(kind: ShowcaseItem['kind']): { yaw: number, pitch: number } {
  if (kind === 'anime') return { yaw: -0.85, pitch: 0.42 }
  if (kind === 'film') return { yaw: 0.15, pitch: 0.38 }
  return { yaw: 0.95, pitch: 0.34 }
}

function placeOnDome(index: number, total: number, kind: ShowcaseItem['kind'], radius = 16) {
  const anchor = zoneAnchor(kind)
  const cols = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(total))))
  const row = Math.floor(index / cols)
  const col = index % cols
  const rows = Math.ceil(total / cols)
  const yaw = anchor.yaw + (col - (cols - 1) / 2) * 0.22
  const pitch = anchor.pitch + ((rows - 1) / 2 - row) * 0.18
  const x = Math.sin(yaw) * Math.cos(pitch) * radius
  const y = 6 + Math.sin(pitch) * radius
  const z = -Math.cos(yaw) * Math.cos(pitch) * radius
  return new Vector3(x, y, z)
}

export function createShowcaseWorld(
  canvas: HTMLCanvasElement,
  options: WorldOptions = {},
): ShowcaseWorldHandle {
  const reduced = Boolean(options.reducedMotion)
  const scene = new Scene()
  scene.background = new Color('#87c4e8')
  scene.fog = new FogExp2('#9fd0ef', 0.014)

  const camera = new PerspectiveCamera(68, 1, 0.1, 220)
  camera.position.set(0, 3.4, 0.2)

  const lookTarget = new Vector3(0, 18, -8)
  const lookDesired = lookTarget.clone()
  camera.lookAt(lookTarget)

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    powerPreference: 'high-performance',
    alpha: false,
  })
  renderer.setClearColor('#87c4e8', 1)
  renderer.setPixelRatio(1)

  const ambient = new AmbientLight('#cfe9ff', 1.2)
  const sun = new DirectionalLight('#fff4d6', 1.25)
  sun.position.set(10, 36, 6)
  scene.add(ambient, sun)

  const leafGreens = ['#2f8f3a', '#3cb04a', '#1f6b2c', '#58c45f', '#247a32']
  const leafMats = leafGreens.map(
    (hex) =>
      new MeshLambertMaterial({
        map: makeLeafTexture(hex),
        color: hex,
      }),
  )
  const barkMat = new MeshLambertMaterial({
    map: makeBarkTexture(),
    color: '#4a3220',
  })

  const forest = new Group()
  scene.add(forest)

  const trunkGeo = new CylinderGeometry(0.35, 0.55, 18, 6)
  const leafGeo = new BoxGeometry(1, 1, 1)
  const matrix = new Matrix4()
  const dummyPos = new Vector3()

  for (let ring = 0; ring < 7; ring++) {
    const radius = 4 + ring * 3.2
    const count = 6 + ring * 3
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + ring * 0.35
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 1.2
      const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 1.2

      const trunk = new Mesh(trunkGeo, barkMat)
      trunk.position.set(x, 6, z)
      forest.add(trunk)

      const leafCount = 24 + Math.floor(Math.random() * 14)
      const canopy = new InstancedMesh(
        leafGeo,
        leafMats[Math.floor(Math.random() * leafMats.length)],
        leafCount,
      )
      for (let l = 0; l < leafCount; l++) {
        const ly = 14 + Math.random() * 10
        const spread = 1.2 + Math.random() * 3.5
        dummyPos.set(
          x + (Math.random() - 0.5) * spread * 2,
          ly,
          z + (Math.random() - 0.5) * spread * 2,
        )
        const s = 0.55 + Math.random() * 1.1
        matrix.makeScale(s, s * (0.6 + Math.random() * 0.8), s)
        matrix.setPosition(dummyPos)
        canopy.setMatrixAt(l, matrix)
      }
      canopy.instanceMatrix.needsUpdate = true
      forest.add(canopy)
    }
  }

  const gallery = new Group()
  scene.add(gallery)

  const activityGroup = new Group()
  scene.add(activityGroup)

  const loader = new TextureLoader()
  loader.setCrossOrigin('anonymous')

  const panels: Mesh[] = []
  const activityBars: Mesh[] = []
  const pointer = new Vector2(0, 0)
  const raycaster = new Raycaster()
  let hovered: Mesh | null = null
  let selected: Mesh | null = null
  let wind = 0
  let raf = 0
  let disposed = false
  let activeZone: ShowcaseZone = 'all'
  const PIXEL = 4

  const zoneLook: Record<Exclude<ShowcaseZone, 'all'>, Vector3> = {
    anime: new Vector3(-10, 16, -10),
    films: new Vector3(2, 15, -14),
    music: new Vector3(11, 14, -8),
  }

  function clearGroup(group: Group) {
    while (group.children.length) {
      const child = group.children[0]!
      group.remove(child)
      if (child instanceof Mesh) {
        child.geometry.dispose()
        const material = child.material
        if (Array.isArray(material)) material.forEach((m) => m.dispose())
        else {
          if (material.map) material.map.dispose()
          material.dispose()
        }
      }
    }
  }

  function stylePanel(mesh: Mesh, active: boolean) {
    const data = mesh.userData as PanelUserData
    const scale = data.baseScale * (active ? 1.18 : 1)
    mesh.scale.set(scale, scale, 1)
  }

  function setItems(items: ShowcaseItem[]) {
    clearGroup(gallery)
    panels.length = 0

    const byKind = {
      anime: items.filter((i) => i.kind === 'anime').slice(0, 18),
      film: items.filter((i) => i.kind === 'film').slice(0, 18),
      track: items.filter((i) => i.kind === 'track').slice(0, 12),
    }

    const all = [...byKind.anime, ...byKind.film, ...byKind.track]

    for (const [index, item] of all.entries()) {
      const kindItems = byKind[item.kind]
      const localIndex = kindItems.indexOf(item)
      const position = placeOnDome(localIndex, kindItems.length, item.kind)
      const geo = new PlaneGeometry(item.kind === 'track' ? 1.6 : 1.8, item.kind === 'track' ? 1.6 : 2.7)
      const material = new MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.98,
      })
      const mesh = new Mesh(geo, material)
      mesh.position.copy(position)
      mesh.lookAt(camera.position)
      const data: PanelUserData = {
        item,
        baseScale: 1,
        phase: index * 0.37,
      }
      mesh.userData = data
      gallery.add(mesh)
      panels.push(mesh)

      const fallback = makeFallbackPoster(item)
      material.map = fallback
      material.needsUpdate = true

      if (item.image) {
        loader.load(
          item.image,
          (texture) => {
            if (disposed) {
              texture.dispose()
              return
            }
            texture.colorSpace = SRGBColorSpace
            texture.magFilter = NearestFilter
            texture.minFilter = NearestFilter
            fallback.dispose()
            material.map = texture
            material.needsUpdate = true
          },
          undefined,
          () => {
            // keep fallback
          },
        )
      }
    }
  }

  function setActivity(points: MusicActivityPoint[]) {
    clearGroup(activityGroup)
    activityBars.length = 0
    if (!points.length) return

    const max = Math.max(1, ...points.map((p) => p.count))
    const origin = new Vector3(10, 8, -6)

    points.slice(-14).forEach((point, index) => {
      const h = 0.4 + (point.count / max) * 4.5
      const geo = new BoxGeometry(0.55, h, 0.55)
      const mat = new MeshLambertMaterial({ color: '#3cb04a' })
      const mesh = new Mesh(geo, mat)
      mesh.position.set(origin.x + index * 0.7 - 4, origin.y + h / 2, origin.z)
      mesh.userData = { label: point.label, count: point.count }
      activityGroup.add(mesh)
      activityBars.push(mesh)
    })
  }

  function focusZone(zone: ShowcaseZone) {
    activeZone = zone
    if (zone === 'all') lookDesired.set(0, 18, -8)
    else lookDesired.copy(zoneLook[zone])
  }

  function pick(clientX: number, clientY: number): Mesh | null {
    const rect = canvas.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1)
    raycaster.setFromCamera(new Vector2(x, y), camera)
    const hits = raycaster.intersectObjects(panels, false)
    return (hits[0]?.object as Mesh | undefined) ?? null
  }

  function resize() {
    const parent = canvas.parentElement
    const w = parent?.clientWidth || window.innerWidth
    const h = parent?.clientHeight || window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(Math.max(1, Math.floor(w / PIXEL)), Math.max(1, Math.floor(h / PIXEL)), false)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    canvas.style.imageRendering = 'pixelated'
  }

  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

    const hit = pick(e.clientX, e.clientY)
    if (hovered && hovered !== hit && hovered !== selected) stylePanel(hovered, false)
    hovered = hit
    if (hovered) stylePanel(hovered, true)
    options.onHover?.(hovered ? (hovered.userData as PanelUserData).item : null)
    canvas.style.cursor = hit ? 'pointer' : 'crosshair'
  }

  const onClick = (e: PointerEvent) => {
    wind += 1.4
    const hit = pick(e.clientX, e.clientY)
    if (selected && selected !== hit) stylePanel(selected, false)
    selected = hit
    if (selected) stylePanel(selected, true)
    options.onSelect?.(selected ? (selected.userData as PanelUserData).item : null)
  }

  const animate = () => {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    const t = performance.now() * 0.001

    if (!reduced) {
      wind *= 0.96
      if (activeZone === 'all') {
        lookDesired.x = pointer.x * 10
        lookDesired.y = 16 + pointer.y * 5
        lookDesired.z = -8 + pointer.y * -4
      }
      lookTarget.lerp(lookDesired, 0.05)
      camera.lookAt(lookTarget)

      forest.rotation.y = Math.sin(t * 0.08) * 0.03 + pointer.x * 0.02
      for (const panel of panels) {
        const data = panel.userData as PanelUserData
        panel.position.y += Math.sin(t * 0.9 + data.phase) * 0.002
        panel.lookAt(camera.position)
        if (activeZone !== 'all') {
          const visible =
            (activeZone === 'anime' && data.item.kind === 'anime')
            || (activeZone === 'films' && data.item.kind === 'film')
            || (activeZone === 'music' && data.item.kind === 'track')
          panel.visible = visible
        } else {
          panel.visible = true
        }
      }
      activityBars.forEach((bar, i) => {
        bar.visible = activeZone === 'all' || activeZone === 'music'
        bar.scale.y = 1 + Math.sin(t * 2 + i) * 0.04 * (1 + wind * 0.1)
      })
    } else {
      camera.lookAt(lookTarget)
    }

    renderer.render(scene, camera)
  }

  resize()
  window.addEventListener('resize', resize)
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('click', onClick)
  animate()

  return {
    setItems,
    setActivity,
    focusZone,
    dispose: () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('click', onClick)
      clearGroup(gallery)
      clearGroup(activityGroup)
      renderer.dispose()
      trunkGeo.dispose()
      leafGeo.dispose()
      leafMats.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
      barkMat.map?.dispose()
      barkMat.dispose()
    },
  }
}
