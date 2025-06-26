export const sensorIcons = {
  lux: '💡',
  ph: '🧪',
  tds: '💧',
  temperature: '🌡️',
  humidity: '💨',
  camera: '📷',
  ai_health_prediction: '🤖'
};

export const getSensorIcon = (sensorType) => {
  return sensorIcons[sensorType] || '📊 ';
};

export const getSensorLabel = (sensorType) => {
  const labels = {
    lux: 'LUX',
    ph: 'PH', 
    tds: 'TDS',
    temperature: 'TEMPERATURE',
    humidity: 'HUMIDITY',
    camera: 'CAMERA',
    ai_health_prediction: 'HEALTH_ANALYZE'
  };
  return labels[sensorType] || sensorType.toUpperCase();
};

export const getSensorUnit = (sensorType) => {
  const units = {
    lux: 'LUX',
    ph: 'pH',
    tds: 'ppm',
    temperature: '°C',
    humidity: '%',
    camera: '',
    ai_health_prediction: ''
  };
  return units[sensorType] || '';
};
