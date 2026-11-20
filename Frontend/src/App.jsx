
import { useState } from 'react'
import axios from 'axios'

import {
  Search,
  Users,
  BookOpen,
  Star,
  GitFork,
  MapPin,
  Link as LinkIcon,
  GitBranch,
  Activity,
  Code2,
  GitCompareArrows,
  ExternalLink,
} from 'lucide-react'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const API = 'http://127.0.0.1:8000'

const COLORS = [
  '#58a6ff',
  '#3fb950',
  '#d29922',
  '#bc8cff',
  '#f778ba',
  '#ff7b72',
  '#79c0ff',
]

function formatNumber(value) {
  return Number(value || 0).toLocaleString()
}

function App() {
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState(null)
  const [repos, setRepos] = useState([])
  const [activity, setActivity] = useState([])
  const [sortBy, setSortBy] = useState('stars')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [compareUser, setCompareUser] = useState('')
  const [comparison, setComparison] = useState(null)
  const [compareLoading, setCompareLoading] = useState(false)

  async function searchUser(event) {
    event.preventDefault()

    if (!username.trim()) {
      setError('Please enter a GitHub username.')
      return
    }

    setLoading(true)
    setError('')
    setComparison(null)

    try {
      const user = username.trim()

      const [profileRes, statsRes, reposRes, activityRes] =
        await Promise.all([
          axios.get(`${API}/api/profile/${user}`),
          axios.get(`${API}/api/stats/${user}`),
          axios.get(`${API}/api/repos/${user}?sort_by=${sortBy}`),
          axios.get(`${API}/api/activity/${user}`),
        ])

      setProfile(profileRes.data.profile || profileRes.data)
      setStats(statsRes.data.stats || statsRes.data)
      setRepos(
        Array.isArray(reposRes.data)
          ? reposRes.data
          : reposRes.data.repositories || reposRes.data.repos || []
      )
      setActivity(
        Array.isArray(activityRes.data)
          ? activityRes.data
          : activityRes.data.activity || activityRes.data.events || []
      )
    } catch (err) {
      setProfile(null)
      setStats(null)
      setRepos([])
      setActivity([])

      setError(
        err.response?.data?.detail ||
        'Unable to fetch GitHub profile. Check the username or backend server.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function sortRepositories(value) {
    setSortBy(value)

    if (!profile?.login && !profile?.username) return

    try {
      const user = profile.login || profile.username
      const response = await axios.get(
        `${API}/api/repos/${user}?sort_by=${value}`
      )

      setRepos(
        Array.isArray(response.data)
          ? response.data
          : response.data.repositories || response.data.repos || []
      )
    } catch (err) {
      setError('Unable to sort repositories.')
    }
  }

  async function compareDevelopers(event) {
    event.preventDefault()

    const firstUser = profile?.login || profile?.username

    if (!firstUser || !compareUser.trim()) {
      setError('Search for a profile and enter another username to compare.')
      return
    }

    setCompareLoading(true)
    setError('')

    try {
      const response = await axios.get(
        `${API}/api/compare`,
        {
          params: {
            user1: firstUser,
            user2: compareUser.trim(),
          },
        }
      )

      setComparison(response.data)
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Unable to compare these developers.'
      )
      setComparison(null)
    } finally {
      setCompareLoading(false)
    }
  }

  const languages =
    stats?.language_distribution ||
    stats?.languages ||
    stats?.language_stats ||
    {}

  const languageData = Array.isArray(languages)
    ? languages.map((item) => ({
        name: item.language || item.name,
        value: item.count || item.percentage || item.value || 0,
      }))
    : Object.entries(languages).map(([name, value]) => ({
        name,
        value: typeof value === 'object' ? value.count || 0 : value,
      }))

  const displayName = profile?.name || profile?.login || profile?.username
  const repoCount = profile?.public_repos ?? stats?.total_repos ?? repos.length
  const followerCount = profile?.followers ?? stats?.followers ?? 0
  const followingCount = profile?.following ?? stats?.following ?? 0

  const totalStars =
    stats?.total_stars ??
    stats?.stars ??
    repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0)

  const totalForks =
    stats?.total_forks ??
    stats?.forks ??
    repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0)

  return (
    <div className="dashboard">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">⌘</span>
          <span>GitHub Explorer</span>
        </div>

        <span className="topbar-label">Developer Analytics Dashboard</span>
      </header>

      <main className="main-content">
        <section className="hero">
          <div className="hero-tag">
            <Code2 size={15} />
            <span>Explore developers. Discover code.</span>
          </div>

          <h1>
            GitHub Profile <span>Explorer</span>
          </h1>

          <p>
            Search GitHub developers, explore repositories, analyze statistics,
            and compare developer profiles.
          </p>

          <form className="search-box" onSubmit={searchUser}>
            <Search size={20} />

            <input
              type="text"
              placeholder="Enter GitHub username (e.g. torvalds)"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Explore Profile'}
            </button>
          </form>

          <div className="suggestions">
            Try:
            <button onClick={() => setUsername('torvalds')} type="button">
              torvalds
            </button>
            <button onClick={() => setUsername('octocat')} type="button">
              octocat
            </button>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-message">
            <Activity size={20} />
            Fetching GitHub developer data...
          </div>
        )}

        {profile && !loading && (
          <>
            <section className="profile panel">
              <div className="profile-main">
                <img
                  className="avatar"
                  src={profile.avatar_url}
                  alt={displayName || 'GitHub avatar'}
                />

                <div className="profile-details">
                  <h2>{displayName}</h2>
                  <p className="username">@{profile.login || profile.username}</p>

                  {profile.bio && <p className="bio">{profile.bio}</p>}

                  <div className="profile-meta">
                    {profile.location && (
                      <span>
                        <MapPin size={15} /> {profile.location}
                      </span>
                    )}

                    {profile.blog && (
                      <a
                        href={
                          profile.blog.startsWith('http')
                            ? profile.blog
                            : `https://${profile.blog}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkIcon size={15} /> Website
                      </a>
                    )}

                    {profile.html_url && (
                      <a
                        href={profile.html_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={15} /> GitHub Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="stats-grid">
              <StatCard
                icon={<BookOpen />}
                title="Repositories"
                value={repoCount}
              />
              <StatCard
                icon={<Users />}
                title="Followers"
                value={followerCount}
              />
              <StatCard
                icon={<Users />}
                title="Following"
                value={followingCount}
              />
              <StatCard
                icon={<Star />}
                title="Total Stars"
                value={totalStars}
              />
              <StatCard
                icon={<GitFork />}
                title="Total Forks"
                value={totalForks}
              />
            </section>

            <section className="content-grid">
              <div className="panel repositories-panel">
                <div className="section-heading">
                  <div>
                    <h2>
                      <BookOpen size={19} /> Repositories
                    </h2>
                    <p>Explore public projects</p>
                  </div>

                  <select
                    value={sortBy}
                    onChange={(event) => sortRepositories(event.target.value)}
                  >
                    <option value="stars">Most Stars</option>
                    <option value="forks">Most Forks</option>
                    <option value="updated">Recently Updated</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                {repos.length === 0 ? (
                  <p className="empty-message">No repositories found.</p>
                ) : (
                  <div className="repo-list">
                    {repos.map((repo) => (
                      <div className="repo-item" key={repo.id || repo.name}>
                        <div className="repo-title">
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {repo.name}
                          </a>

                          {repo.private && (
                            <span className="private-tag">Private</span>
                          )}
                        </div>

                        <p>{repo.description || 'No description available.'}</p>

                        <div className="repo-meta">
                          {repo.language && (
                            <span>
                              <span className="language-dot" />
                              {repo.language}
                            </span>
                          )}

                          <span>
                            <Star size={14} />
                            {formatNumber(repo.stargazers_count)}
                          </span>

                          <span>
                            <GitFork size={14} />
                            {formatNumber(repo.forks_count)}
                          </span>

                          {repo.updated_at && (
                            <span>
                              Updated{' '}
                              {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="panel language-panel">
                <div className="section-heading">
                  <div>
                    <h2>
                      <Code2 size={19} /> Languages
                    </h2>
                    <p>Repository language distribution</p>
                  </div>
                </div>

                {languageData.length > 0 ? (
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={languageData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {languageData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="empty-message">
                    No language statistics available.
                  </p>
                )}
              </div>
            </section>

            <section className="panel activity-panel">
              <div className="section-heading">
                <div>
                  <h2>
                    <Activity size={19} /> Recent Activity
                  </h2>
                  <p>Latest public GitHub events</p>
                </div>
              </div>

              {activity.length === 0 ? (
                <p className="empty-message">No recent public activity found.</p>
              ) : (
                <div className="activity-list">
                  {activity.slice(0, 10).map((event, index) => (
                    <div className="activity-item" key={event.id || index}>
                      <div className="activity-icon">
                        <GitBranch size={17} />
                      </div>

                      <div>
                        <strong>
                          {event.type?.replace('Event', '') || 'Activity'}
                        </strong>

                        <p>
                          {event.repo?.name || 'GitHub repository'}
                        </p>

                        <span>
                          {event.created_at
                            ? new Date(event.created_at).toLocaleString()
                            : 'Date unavailable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="panel compare-section">
              <div className="section-heading">
                <div>
                  <h2>
                    <GitCompareArrows size={20} /> Developer Comparison
                  </h2>
                  <p>Compare this developer with another GitHub user</p>
                </div>
              </div>

              <form className="compare-form" onSubmit={compareDevelopers}>
                <input
                  value={compareUser}
                  onChange={(event) => setCompareUser(event.target.value)}
                  placeholder="Enter another GitHub username"
                />

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={compareLoading}
                >
                  {compareLoading ? 'Comparing...' : 'Compare Developers'}
                </button>
              </form>

              {comparison && (
                <ComparisonResult data={comparison} />
              )}
            </section>
          </>
        )}

        {!profile && !loading && (
          <section className="welcome-panel panel">
            <div className="welcome-icon">
              <Code2 size={34} />
            </div>
            <h2>Start exploring GitHub</h2>
            <p>
              Enter a GitHub username above to view real profile information,
              repositories, developer statistics, and activity.
            </p>
          </section>
        )}

        <footer className="footer">
          Built with React, FastAPI and the GitHub REST API
        </footer>
      </main>
    </div>
  )
}

function StatCard({ icon, title, value }) {
  return (
    <div className="stat-card panel">
      <div className="stat-icon">{icon}</div>
      <p>{title}</p>
      <h3>{formatNumber(value)}</h3>
    </div>
  )
}

function ComparisonResult({ data }) {
  const first = data.user1 || data.developer1 || data.first_user
  const second = data.user2 || data.developer2 || data.second_user

  if (!first || !second) {
    return (
      <p className="empty-message">
        Comparison response received, but its format needs to be mapped.
      </p>
    )
  }

  const firstProfile = first.profile || first
  const secondProfile = second.profile || second
  const firstStats = first.stats || first
  const secondStats = second.stats || second

  const rows = [
    ['Repositories', firstProfile.public_repos ?? firstStats.total_repos, secondProfile.public_repos ?? secondStats.total_repos],
    ['Followers', firstProfile.followers ?? firstStats.followers, secondProfile.followers ?? secondStats.followers],
    ['Stars', firstStats.total_stars ?? firstStats.stars, secondStats.total_stars ?? secondStats.stars],
    ['Forks', firstStats.total_forks ?? firstStats.forks, secondStats.total_forks ?? secondStats.forks],
  ]

  return (
    <div className="comparison-result">
      <div className="comparison-users">
        <h3>{firstProfile.login || firstProfile.username || 'Developer 1'}</h3>
        <span>VS</span>
        <h3>{secondProfile.login || secondProfile.username || 'Developer 2'}</h3>
      </div>

      {rows.map(([label, a, b]) => (
        <div className="comparison-row" key={label}>
          <strong>{formatNumber(a)}</strong>
          <span>{label}</span>
          <strong>{formatNumber(b)}</strong>
        </div>
      ))}
    </div>
  )
}

export default App

