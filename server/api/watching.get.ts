const ANILIST_USER = 'GenZerg'

export default defineEventHandler(async () => {
  const watching = await fetchCurrentlyWatching(ANILIST_USER)

  return {
    user: ANILIST_USER,
    profileUrl: `https://anilist.co/user/${ANILIST_USER}/`,
    count: watching.length,
    watching,
  }
})
