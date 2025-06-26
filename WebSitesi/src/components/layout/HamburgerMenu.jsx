import React from 'react';

function HamburgerMenu({ onClick, isOpen }) {
  return (
    <button className={`hamburger-menu${isOpen ? ' open' : ''}`} onClick={onClick} aria-label="Menüyü Aç/Kapat">
      <span></span>
      <span></span>
      <span></span>
    </button>
  );
}

export default HamburgerMenu;
