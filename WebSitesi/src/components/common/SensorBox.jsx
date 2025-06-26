import React from 'react';
import SensorIcons from './SensorIcons';

function SensorBox({ item }) {
  const icons = SensorIcons();
  return (
    <div className="sensor-box">
      <div className="sensor-row"><b>{icons.lux}LUX:</b> {item.lux || '-'}</div>
      <div className="sensor-row"><b>{icons.ph}pH:</b> {item.ph || item.ph_v || '-'}</div>
      <div className="sensor-row"><b>{icons.tds}TDS:</b> {item.tds || item.tds_v || '-'}</div>
      <div className="sensor-row"><b>{icons.temperature}Sıcaklık:</b> {item.temperature ? `${item.temperature}°C` : '-'}</div>
      <div className="sensor-row"><b>{icons.humidity}Nem:</b> {item.humidity ? `${item.humidity}%` : '-'}</div>
      <div className="sensor-row"><b>{icons.ts}Zaman:</b> {item.ts ? new Date(item.ts).toLocaleString('tr-TR') : '-'}</div>
    </div>
  );
}

export default SensorBox;
