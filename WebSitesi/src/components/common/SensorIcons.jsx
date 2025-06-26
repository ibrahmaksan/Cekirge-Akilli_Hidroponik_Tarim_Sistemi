import React from 'react';

function SensorIcons() {
  return {
    lux: <span style={{marginRight:6}} title="Işık" data-tooltip="Işık"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="6" stroke="#ffe066" strokeWidth="2.2" fill="#fffde7"/><g stroke="#ffe066" strokeWidth="2.2"><line x1="11" y1="1" x2="11" y2="4"/><line x1="11" y1="18" x2="11" y2="21"/><line x1="1" y1="11" x2="4" y2="11"/><line x1="18" y1="11" x2="21" y2="11"/><line x1="4.5" y1="4.5" x2="6.5" y2="6.5"/><line x1="15.5" y1="15.5" x2="17.5" y2="17.5"/><line x1="4.5" y1="17.5" x2="6.5" y2="15.5"/><line x1="15.5" y1="6.5" x2="17.5" y2="4.5"/></g><circle cx="11" cy="11" r="3.2" fill="#ffe066"/></svg></span>,
    ph: <span style={{marginRight:6}} title="pH" data-tooltip="pH"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="14" rx="7" ry="5" fill="#e0f7fa" stroke="#00bcd4" strokeWidth="2.2"/><rect x="7" y="2" width="8" height="9" rx="4" fill="#fff" stroke="#00bcd4" strokeWidth="2.2"/><circle cx="11" cy="6.5" r="2.2" fill="#00bcd4"/></svg></span>,
    tds: <span style={{marginRight:6}} title="TDS" data-tooltip="TDS"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><ellipse cx="11" cy="14" rx="7" ry="5" fill="#e8f5e9" stroke="#43e97b" strokeWidth="2.2"/><path d="M11 2 L15 10 H7 L11 2 Z" fill="#43e97b"/><circle cx="11" cy="14" r="2.2" fill="#43e97b"/></svg></span>,
    temperature: <span style={{marginRight:6}} title="Sıcaklık" data-tooltip="Sıcaklık"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="9" y="2" width="4" height="12" rx="2" fill="#ffebee" stroke="#ef4444" strokeWidth="2.2"/><circle cx="11" cy="17" r="3" fill="#ef4444"/><rect x="9.5" y="3" width="3" height="10" rx="1.5" fill="#ef4444"/></svg></span>,
    humidity: <span style={{marginRight:6}} title="Nem" data-tooltip="Nem"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2 C11 2 6 7 6 12 C6 15.866 8.134 18 11 18 C13.866 18 16 15.866 16 12 C16 7 11 2 11 2 Z" fill="#f0fdfa" stroke="#14b8a6" strokeWidth="2.2"/><circle cx="11" cy="12" r="3" fill="#14b8a6"/></svg></span>,
    ts: <span style={{marginRight:6}} title="Zaman" data-tooltip="Zaman"><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="#ffb347" strokeWidth="2.2" fill="#fff8e1"/><path d="M11 5v6l5 2" stroke="#ffb347" strokeWidth="2.2" strokeLinecap="round"/><circle cx="11" cy="11" r="3.2" fill="#ffb347"/></svg></span>
  };
}

export default SensorIcons;
