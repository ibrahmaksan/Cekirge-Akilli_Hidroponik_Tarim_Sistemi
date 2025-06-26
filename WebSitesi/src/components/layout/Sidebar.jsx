import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar({ user, handleLogout, isOpen, onClose }) {
  return (
    <>
      <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-user" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:8}}>
            <div style={{marginBottom:2}}>
              {/* Açık gri, sade modern kullanıcı ikon SVG */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" fill="#f7f7fa" stroke="#bdbdbd" strokeWidth="2.5"/>
                <ellipse cx="24" cy="18.5" rx="8.5" ry="8.5" fill="#e0e0e0" stroke="#bdbdbd" strokeWidth="2.2"/>
                <ellipse cx="24" cy="36" rx="13" ry="7" fill="#e0e0e0" stroke="#bdbdbd" strokeWidth="2.2"/>
                <ellipse cx="24" cy="20" rx="4.5" ry="4.5" fill="#bdbdbd"/>
              </svg>
            </div>
            <div className="sidebar-username">{user?.email || 'Kullanıcı'}</div>
          </div>          <nav className="sidebar-menu">
            <NavLink to="/profile" className={({isActive}) => isActive ? 'active' : ''}>Profil</NavLink>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Sistem Durumu</NavLink>
            <NavLink to="/devices" className={({isActive}) => isActive ? 'active' : ''}>Cihazlarım</NavLink>
            <NavLink to="/advice" className={({isActive}) => isActive ? 'active' : ''}>Tavsiyeler</NavLink>
            <NavLink to="/contact" className={({isActive}) => isActive ? 'active' : ''}>İletişim</NavLink>
          </nav>
          <button className="logout-btn-sidebar" onClick={handleLogout}>Çıkış Yap</button>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-empty">Bu kısım boş kalabilir şimdilik</div>
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
}

export default Sidebar;
