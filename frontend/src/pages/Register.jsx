import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Register.css'
import Header from '../components/Header'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    title: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    institute: '',
    department: '',
    location: '',
    state: '',
    how_did_you_hear_about_us: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [activeSection, setActiveSection] = useState(0)

  useEffect(() => {
    fetch('/workshop/api/csrf/', { credentials: 'include' })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateSection = (sectionIndex) => {
    const sections = [
      ['username', 'email', 'password', 'confirm_password'],
      ['title', 'first_name', 'last_name', 'phone_number'],
      ['institute', 'department', 'location', 'state', 'how_did_you_hear_about_us']
    ]
    
    const fields = sections[sectionIndex]
    const errors = {}
    
    fields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required'
      }
    })

    if (sectionIndex === 0) {
      if (formData.password && formData.password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match'
      }
      if (formData.username && !/^[a-zA-Z0-9._]+$/.test(formData.username)) {
        errors.username = 'Only letters, digits, period, underscore allowed'
      }
    }

    if (sectionIndex === 1) {
      if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
        errors.phone_number = 'Enter a valid 10-digit phone number'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateAll = () => {
    const allErrors = {}
    
    // Validate section 0
    const section0Fields = ['username', 'email', 'password', 'confirm_password']
    section0Fields.forEach(field => {
      if (!formData[field]) allErrors[field] = 'This field is required'
    })
    if (formData.password && formData.password !== formData.confirm_password) {
      allErrors.confirm_password = 'Passwords do not match'
    }
    if (formData.username && !/^[a-zA-Z0-9._]+$/.test(formData.username)) {
      allErrors.username = 'Only letters, digits, period, underscore allowed'
    }

    // Validate section 1
    const section1Fields = ['title', 'first_name', 'last_name', 'phone_number']
    section1Fields.forEach(field => {
      if (!formData[field]) allErrors[field] = 'This field is required'
    })
    if (formData.phone_number && !/^\d{10}$/.test(formData.phone_number)) {
      allErrors.phone_number = 'Enter a valid 10-digit phone number'
    }

    // Validate section 2
    const section2Fields = ['institute', 'department', 'location', 'state', 'how_did_you_hear_about_us']
    section2Fields.forEach(field => {
      if (!formData[field]) allErrors[field] = 'This field is required'
    })

    setFieldErrors(allErrors)
    return Object.keys(allErrors).length === 0
  }

  const handleNext = () => {
    if (validateSection(activeSection)) {
      setActiveSection(prev => Math.min(prev + 1, 2))
    }
  }

  const handlePrevious = () => {
    setActiveSection(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateAll()) {
      return
    }

    setError('')
    setFieldErrors({})
    setLoading(true)

    try {
      const res = await fetch('/workshop/register/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData)
      })

      if (res.ok) {
        // Django returns HTML (activation page) on success
        window.location.href = '/workshop/activate_user/'
      } else {
        // Try to parse JSON error response, fallback to text
        const contentType = res.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json()
          if (data.errors) {
            setFieldErrors(data.errors)
          } else {
            setError(data.error || 'Registration failed')
          }
        } else {
          setError('Registration failed. Please try again.')
        }
      }
    } catch {
      setError('Server error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Header />

      <main className="register-main">
        <div className="register-container">
          <div className="register-header">
            <div className="register-badge">
              <span className="register-badge-dot"></span>
              Coordinator Registration
            </div>
            <h1 className="register-title">Create your account</h1>
            <p className="register-description">
              Join as a coordinator to manage workshops, track progress, and support students.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="progress-bar">
            <div className="progress-steps">
              <div className={`step ${activeSection >= 0 ? 'active' : ''}`}>
                <div className="step-number"><span>1</span></div>
                <span className="step-label">Account</span>
              </div>
              <div className={`step-line ${activeSection > 0 ? 'completed' : ''}`}></div>
              <div className={`step ${activeSection >= 1 ? 'active' : ''}`}>
                <div className="step-number"><span>2</span></div>
                <span className="step-label">Personal</span>
              </div>
              <div className={`step-line ${activeSection > 1 ? 'completed' : ''}`}></div>
              <div className={`step ${activeSection >= 2 ? 'active' : ''}`}>
                <div className="step-number"><span>3</span></div>
                <span className="step-label">Institute</span>
              </div>
            </div>
          </div>

          <div className="register-card">
            <form onSubmit={handleSubmit} className="register-form">
              {error && <div className="alert error" role="alert">{error}</div>}

              {/* Section 1: Account Details */}
              <div className={`form-section ${activeSection === 0 ? 'active' : ''}`}>
                <h2 className="section-title">Account Details</h2>
              
              <div className="field">
                <label htmlFor="username">Username <span className="required" aria-hidden="true">*</span></label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  placeholder="e.g., john_doe123"
                  className={fieldErrors.username ? 'input-error' : ''}
                  aria-invalid={!!fieldErrors.username}
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                />
                {fieldErrors.username && <span className="field-error" id="username-error" role="alert">{fieldErrors.username}</span>}
                <span className="field-hint">Letters, digits, period, underscore only</span>
              </div>

              <div className="field">
                <label htmlFor="email">Email <span className="required" aria-hidden="true">*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  autoComplete="email"
                  placeholder="your.email@example.com"
                  className={fieldErrors.email ? 'input-error' : ''}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && <span className="field-error" id="email-error" role="alert">{fieldErrors.email}</span>}
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="password">Password <span className="required" aria-hidden="true">*</span></label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    autoComplete="new-password"
                    placeholder="Min 6 characters"
                    className={fieldErrors.password ? 'input-error' : ''}
                    aria-invalid={!!fieldErrors.password}
                  />
                  {fieldErrors.password && <span className="field-error" role="alert">{fieldErrors.password}</span>}
                </div>

                <div className="field">
                  <label htmlFor="confirm_password">Confirm <span className="required" aria-hidden="true">*</span></label>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className={fieldErrors.confirm_password ? 'input-error' : ''}
                    aria-invalid={!!fieldErrors.confirm_password}
                  />
                  {fieldErrors.confirm_password && <span className="field-error" role="alert">{fieldErrors.confirm_password}</span>}
                </div>
              </div>

              <div className="btn-row">
                <button type="button" className="btn-next" onClick={handleNext}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className={`form-section ${activeSection === 1 ? 'active' : ''}`}>
              <h2 className="section-title">Personal Information</h2>
              
              <div className="field">
                <label htmlFor="title">Title <span className="required" aria-hidden="true">*</span></label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  aria-required="true"
                >
                  <option value="">Select title</option>
                  <option value="Mr">Mr</option>
                  <option value="Ms">Ms</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                </select>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="first_name">First Name <span className="required" aria-hidden="true">*</span></label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    placeholder="First name"
                  />
                </div>

                <div className="field">
                  <label htmlFor="last_name">Last Name <span className="required" aria-hidden="true">*</span></label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="phone_number">Phone Number <span className="required" aria-hidden="true">*</span></label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  placeholder="10-digit mobile number"
                  className={fieldErrors.phone_number ? 'input-error' : ''}
                  aria-invalid={!!fieldErrors.phone_number}
                  aria-describedby={fieldErrors.phone_number ? 'phone-error' : undefined}
                />
                {fieldErrors.phone_number && <span className="field-error" id="phone-error" role="alert">{fieldErrors.phone_number}</span>}
              </div>

              <div className="btn-row">
                <button type="button" className="btn-prev" onClick={handlePrevious}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back
                </button>
                <button type="button" className="btn-next" onClick={handleNext}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Section 3: Institute Details */}
            <div className={`form-section ${activeSection === 2 ? 'active' : ''}`}>
              <h2 className="section-title">Institute/Organization</h2>
              
              <div className="field">
                <label htmlFor="institute">Institute/Organization <span className="required" aria-hidden="true">*</span></label>
                <input
                  id="institute"
                  name="institute"
                  type="text"
                  value={formData.institute}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  placeholder="Full name of your Institute/Organization"
                />
              </div>

              <div className="field">
                <label htmlFor="department">Department <span className="required" aria-hidden="true">*</span></label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  aria-required="true"
                >
                  <option value="">Select department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Chemical">Chemical</option>
                  <option value="Aerospace">Aerospace</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="location">City <span className="required" aria-hidden="true">*</span></label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    placeholder="Your city"
                  />
                </div>

                <div className="field">
                  <label htmlFor="state">State <span className="required" aria-hidden="true">*</span></label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  >
                    <option value="">Select state</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="how_did_you_hear_about_us">How did you hear about us? <span className="required" aria-hidden="true">*</span></label>
                <select
                  id="how_did_you_hear_about_us"
                  name="how_did_you_hear_about_us"
                  value={formData.how_did_you_hear_about_us}
                  onChange={handleChange}
                  required
                  aria-required="true"
                >
                  <option value="">Select an option</option>
                  <option value="Search Engine">Search Engine</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Friend/Colleague">Friend/Colleague</option>
                  <option value="Institute/Organization">Institute/Organization</option>
                  <option value="Workshop/Event">Workshop/Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="btn-row">
                <button type="button" className="btn-prev" onClick={handlePrevious}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="register-footer">
            <p className="register-footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
      </main>
    </div>
  )
}
