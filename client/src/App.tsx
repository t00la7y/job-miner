import { useState } from 'react'
import './App.css'

type Job = {
  title: string
  company: string
  location: string
  description: string
  url: string
  salary: string | number
  source: string
}

function App() {
  const [what, setWhat] = useState('software developer')
  const [where, setWhere] = useState('south africa')
  const [page, setPage] = useState(1)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const params = new URLSearchParams({
        what: what.trim() || 'developer',
        where: where.trim() || 'south africa',
        page: String(page)
      })
      const resp = await fetch(`/api/jobs?${params.toString()}`)
      if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`)
      const data = await resp.json()
      setJobs(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(err)
      setError(message || 'Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-container">
      <h1>Job Miner</h1>

      <form className="search-form" onSubmit={search}>
        <label>
          What:
          <input value={what} onChange={e => setWhat(e.target.value)} placeholder="software developer" />
        </label>
        <label>
          Where:
          <input value={where} onChange={e => setWhere(e.target.value)} placeholder="south africa" />
        </label>
        <label>
          Page:
          <input type="number" min={1} value={page} onChange={e => setPage(Number(e.target.value) || 1)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <section>
        <h2>Results ({jobs.length})</h2>
        {jobs.length === 0 ? (
          <p>No jobs yet. Click "Search Jobs" to load listings.</p>
        ) : (
          <ul className="jobs-list">
            {jobs.map((job, idx) => (
              <li key={`${job.url}-${idx}`} className="job-item">
                <h3>{job.title}</h3>
                <p>{job.company} • {job.location}</p>
                <p>{job.description?.slice(0, 180)}...</p>
                <p>Salary: {job.salary || 'N/A'} • Source: {job.source}</p>
                <a href={job.url} target="_blank" rel="noreferrer">Apply</a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
