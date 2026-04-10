import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Statistics.css'
import Header from '../components/Header'

// Chart.js lazy loaded to improve initial load performance
let Chart = null
let ChartJS = null

async function loadChart() {
  if (!Chart) {
    const chartModule = await import('chart.js/auto')
    Chart = chartModule.default
    ChartJS = chartModule
  }
  return Chart
}

const states = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'
]

const sortOptions = [
  { value: 'date', label: 'Date (Newest)' },
  { value: '-date', label: 'Date (Oldest)' },
  { value: 'workshop_type__name', label: 'Workshop Type' },
  { value: 'coordinator__first_name', label: 'Coordinator Name' },
]

export default function Statistics() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [chartData, setChartData] = useState({ states: [], state_counts: [], types: [], type_counts: [] })
  const [workshopTypes, setWorkshopTypes] = useState([])
  const [pagination, setPagination] = useState({ current: 1, total: 1, has_next: false, has_prev: false })
  const [showChart, setShowChart] = useState(null) // 'state' | 'type' | null
  const chartRef = useRef(null)
  const chartInstance = useRef(null)

  // Filters
  const [filters, setFilters] = useState({
    from_date: '',
    to_date: '',
    workshop_type: '',
    state: '',
    sort: 'date',
    show_workshops: 'my', // 'my' | 'all'
  })

  // Load workshop types on mount
  useEffect(() => {
    loadWorkshopTypes()
  }, [])

  const loadWorkshopTypes = async () => {
    try {
      const response = await fetch('/workshop/api/workshop-types/', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setWorkshopTypes(data.workshop_types || [])
      }
    } catch (err) {
      console.error('Failed to load workshop types:', err)
    }
  }

  // Load statistics data
  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/statistics/api/public/?${params.toString()}`, {
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      setData(data.workshops || [])
      setPagination(data.pagination || { current: 1, total: 1, has_next: false, has_prev: false })
      
      // Store chart data for later use
      setChartData(data.chart_data || { states: [], state_counts: [], types: [], type_counts: [] })
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      from_date: '',
      to_date: '',
      workshop_type: '',
      state: '',
      sort: 'date',
      show_workshops: 'my',
    })
  }

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      params.append('download', 'download')

      const response = await fetch(`/statistics/api/public/?${params.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'statistics.csv'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

  const showStateChart = async () => {
    const Chart = await loadChart()
    setShowChart('state')
    
    const labels = chartData.states || []
    const data = chartData.state_counts || []

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current?.getContext('2d')
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'State wise workshops',
            data,
            backgroundColor: 'rgba(17, 17, 17, 0.8)',
            borderColor: 'rgba(17, 17, 17, 1)',
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              }
            }
          }
        }
      })
    }
  }

  const showTypeChart = async () => {
    const Chart = await loadChart()
    setShowChart('type')
    
    const labels = chartData.types || []
    const data = chartData.type_counts || []

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current?.getContext('2d')
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Type wise workshops',
            data,
            backgroundColor: 'rgba(17, 17, 17, 0.8)',
            borderColor: 'rgba(17, 17, 17, 1)',
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              }
            }
          }
        }
      })
    }
  }

  const closeChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
      chartInstance.current = null
    }
    setShowChart(null)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="stats-page">
      <Header />

      <main className="stats-main">
        <div className="stats-container">
          {/* Page Header */}
          <div className="stats-header">
            <div className="stats-badge">
              <span className="stats-badge-dot"></span>
              Analytics
            </div>
            <h1 className="stats-title">Workshop Statistics</h1>
            <p className="stats-description">
              View workshop analytics, track participation, and explore trends across institutes.
            </p>
          </div>

          {/* Filters Card */}
          <div className="stats-filters-card">
            <div className="filters-header">
              <h2 className="filters-title">Filters</h2>
              <button className="clear-filters-btn" onClick={clearFilters} title="Clear all filters">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Clear
              </button>
            </div>

            <div className="filters-grid">
              <div className="filter-field">
                <label htmlFor="from_date">From Date</label>
                <input
                  id="from_date"
                  type="date"
                  value={filters.from_date}
                  onChange={(e) => handleFilterChange('from_date', e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label htmlFor="to_date">To Date</label>
                <input
                  id="to_date"
                  type="date"
                  value={filters.to_date}
                  onChange={(e) => handleFilterChange('to_date', e.target.value)}
                />
              </div>

              <div className="filter-field">
                <label htmlFor="workshop_type">Workshop Type</label>
                <select
                  id="workshop_type"
                  value={filters.workshop_type}
                  onChange={(e) => handleFilterChange('workshop_type', e.target.value)}
                >
                  <option value="">All types</option>
                  {workshopTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  value={filters.state}
                  onChange={(e) => handleFilterChange('state', e.target.value)}
                >
                  <option value="">All states</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="sort">Sort By</label>
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.show_workshops === 'my'}
                    onChange={(e) => handleFilterChange('show_workshops', e.target.checked ? 'my' : 'all')}
                  />
                  <span className="checkbox-text">Show my workshops only</span>
                </label>
              </div>
            </div>

            <div className="filters-actions">
              <button className="btn-download" onClick={handleDownload}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download CSV
              </button>
            </div>
          </div>

          {/* Chart Buttons */}
          <div className="stats-charts-row">
            <button className="chart-btn" onClick={showStateChart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              State Chart
            </button>
            <button className="chart-btn" onClick={showTypeChart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
              Workshops Chart
            </button>
          </div>

          {/* Data Table Card */}
          <div className="stats-table-card">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading workshop data...</p>
              </div>
            ) : data.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <h3>No workshops found</h3>
                <p>Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>Sr No.</th>
                        <th>Coordinator Name</th>
                        <th>Institute Name</th>
                        <th>Instructor Name</th>
                        <th>Workshop Name</th>
                        <th>Workshop Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((workshop, index) => (
                        <tr key={workshop.id}>
                          <td>{index + 1}</td>
                          <td>{workshop.coordinator_name}</td>
                          <td>{workshop.institute}</td>
                          <td>{workshop.instructor_name}</td>
                          <td>{workshop.workshop_type}</td>
                          <td>{formatDate(workshop.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      disabled={!pagination.has_prev}
                      onClick={() => {
                        // TODO: Implement pagination
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                      Previous
                    </button>
                    <span className="page-info">
                      Page {pagination.current} of {pagination.total}
                    </span>
                    <button
                      className="page-btn"
                      disabled={!pagination.has_next}
                      onClick={() => {
                        // TODO: Implement pagination
                      }}
                    >
                      Next
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Chart Modal */}
      {showChart && (
        <div className="chart-modal" onClick={closeChart}>
          <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="chart-modal-header">
              <h3>{showChart === 'state' ? 'State wise workshops' : 'Type wise workshops'}</h3>
              <button className="chart-close" onClick={closeChart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="chart-modal-body">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
