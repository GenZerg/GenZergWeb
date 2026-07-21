export type LastfmRecentTrack = {
  id: string
  name: string
  artist: string
  album: string | null
  url: string
  image: string | null
  playedAt: string | null
  nowPlaying: boolean
}

export type LastfmTopTrack = {
  id: string
  name: string
  artist: string
  url: string
  image: string | null
  playcount: number
  rank: number
}

export type LastfmDayBucket = {
  date: string
  label: string
  count: number
}

export type MusicResponse = {
  user: string
  profileUrl: string
  configured: boolean
  message?: string
  recent: LastfmRecentTrack[]
  topWeekly: LastfmTopTrack[]
  topMonthly: LastfmTopTrack[]
  weeklyActivity: LastfmDayBucket[]
  monthlyActivity: LastfmDayBucket[]
}
