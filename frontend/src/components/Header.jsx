import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="header-brand">
          <h1>FOSSEE Workshops</h1>
        </div>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/stats" className="nav-link">Workshop Statistics</Link>
        </nav>
      </div>
    </header>
  )
}
