export type GithubRepo = {
  name: string
  description: string | null
  language: string | null
  url: string
  updatedAt: string | null
}

export type GithubProfile = {
  login: string
  name: string | null
  location: string | null
  profileUrl: string
  publicRepos: number
  followers: number
  repos: GithubRepo[]
}

export async function fetchGithubProfile(username = 'GenZerg'): Promise<GithubProfile | null> {
  try {
    const [user, repos] = await Promise.all([
      $fetch<{
        login: string
        name: string | null
        location: string | null
        html_url: string
        public_repos: number
        followers: number
      }>(`https://api.github.com/users/${username}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'GenZergWeb',
        },
      }),
      $fetch<Array<{
        name: string
        description: string | null
        language: string | null
        html_url: string
        updated_at: string
        fork: boolean
      }>>(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'GenZergWeb',
        },
      }),
    ])

    return {
      login: user.login,
      name: user.name,
      location: user.location,
      profileUrl: user.html_url,
      publicRepos: user.public_repos,
      followers: user.followers,
      repos: repos
        .filter((repo) => !repo.fork)
        .map((repo) => ({
          name: repo.name,
          description: repo.description,
          language: repo.language,
          url: repo.html_url,
          updatedAt: repo.updated_at,
        })),
    }
  }
  catch {
    return null
  }
}
