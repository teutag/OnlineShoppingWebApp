import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart3, TrendingUp } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <BarChart3 size={28} />
        <span>School Analytics</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/students" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <Users size={20} />
          Nxënësit
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <BarChart3 size={20} />
          Analiza
        </NavLink>
        <NavLink to="/prediction" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <TrendingUp size={20} />
          Parashikimi
        </NavLink>
      </div>
    </nav>
  );
}
