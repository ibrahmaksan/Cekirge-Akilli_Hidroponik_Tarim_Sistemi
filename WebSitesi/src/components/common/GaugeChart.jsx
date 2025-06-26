import React from 'react';

const GaugeChart = ({ value, min = 0, max = 100, unit = '', color = '#43e97b', label = '' }) => {
  // Sensör tipine göre dinamik aralık belirleme
  const getSensorRanges = (unit, label) => {
    const sensorType = unit.toLowerCase() || label.toLowerCase();
    
    if (sensorType.includes('lux') || label.toLowerCase().includes('lux')) {
      return { min: 0, max: 30000, optimal: { min: 10000, max: 20000 } };
    } else if (sensorType.includes('ph') || label.toLowerCase().includes('ph')) {
      return { min: 0, max: 14, optimal: { min: 5.5, max: 6.5 } };
    } else if (sensorType.includes('°c') || sensorType.includes('temperature') || label.toLowerCase().includes('sıcaklık')) {
      return { min: 0, max: 50, optimal: { min: 20, max: 28 } };
    } else if (sensorType.includes('%') || sensorType.includes('humidity') || label.toLowerCase().includes('nem')) {
      return { min: 0, max: 100, optimal: { min: 50, max: 70 } };
    } else if (sensorType.includes('ppm') || sensorType.includes('tds') || label.toLowerCase().includes('tds')) {
      return { min: 0, max: 1500, optimal: { min: 400, max: 800 } };
    }
    return { min: min, max: max, optimal: { min: min + (max - min) * 0.3, max: min + (max - min) * 0.7 } };
  };

  const ranges = getSensorRanges(unit, label);
  const actualMin = ranges.min;
  const actualMax = ranges.max;
  
  // Değeri yüzdeye çevir (gerçek aralığa göre)
  const percentage = Math.min(Math.max(((value - actualMin) / (actualMax - actualMin)) * 100, 0), 100);
  
  // pH için özel renk ve durum belirleme (Python kodundaki aralıklara göre)
  const getPHColorAndStatus = (phValue) => {
    if (phValue >= 5.5 && phValue <= 6.5) {
      return { color: '#43e97b', status: '✅ İdeal' }; // Yeşil - Optimal aralık (5.5-6.5)
    } else if (phValue >= 5.0 && phValue <= 7.0) {
      return { color: '#ffd93d', status: '⚡ Normal' }; // Sarı - Kabul edilebilir aralık (5.0-7.0)
    } else {
      return { color: '#ff6b6b', status: '⚠️ Problem' }; // Kırmızı - Problemli
    }
  };

  // Genel renk belirleme (optimal aralıklara göre)
  const getColor = (value, ranges) => {
    const { optimal } = ranges;
    
    // Optimal aralıkta mı?
    if (value >= optimal.min && value <= optimal.max) {
      return '#43e97b'; // Yeşil - İdeal aralık
    }
    
    // Kabul edilebilir aralık kontrolü
    const acceptableMin = optimal.min - (optimal.max - optimal.min) * 0.5;
    const acceptableMax = optimal.max + (optimal.max - optimal.min) * 0.5;
    
    if (value >= acceptableMin && value <= acceptableMax) {
      return '#ffd93d'; // Sarı - Kabul edilebilir
    }
    
    return '#ff6b6b'; // Kırmızı - Problemli
  };

  // pH sensörü kontrolü ve renk belirleme
  const isPHSensor = unit === 'pH' || label.toLowerCase().includes('ph');
  const phColorStatus = isPHSensor ? getPHColorAndStatus(value) : null;
  const gaugeColor = isPHSensor ? phColorStatus.color : (color === '#43e97b' ? getColor(value, ranges) : color);
  
  // SVG path hesaplama
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference * 0.75; // 3/4 çember
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 20px',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: '20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
      border: '1px solid rgba(255,255,255,0.8)',
      minWidth: '200px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    }}>
      {/* Gauge SVG */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <svg width="140" height="100" viewBox="0 0 140 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 50 50 0 0 1 120 80"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d="M 20 80 A 50 50 0 0 1 120 80"
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s ease'
            }}
          />
          
          {/* Center dot/needle base */}
          <circle
            cx="70"
            cy="80"
            r="4"
            fill={gaugeColor}
          />
        </svg>
        
        {/* Value display */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '26px',
            fontWeight: 'bold',
            color: '#2c3e50',
            lineHeight: 1,
            textShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {typeof value === 'number' ? value.toFixed(1) : value}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#7f8c8d',
            fontWeight: '600',
            marginTop: '2px',
            letterSpacing: '0.5px'
          }}>
            {unit}
          </div>
        </div>
      </div>
      
      {/* Label */}
      {label && (
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '8px',
          letterSpacing: '0.5px',
          textTransform: 'capitalize'
        }}>
          {label}
        </div>
      )}
      
      {/* Status indicator */}
      <div style={{
        marginTop: '4px',
        fontSize: '13px',
        padding: '6px 16px',
        borderRadius: '25px',
        background: `${gaugeColor}15`,
        color: gaugeColor,
        fontWeight: '700',
        border: `2px solid ${gaugeColor}30`,
        textAlign: 'center',
        minWidth: '100px',
        letterSpacing: '0.3px',
        textShadow: `0 1px 2px ${gaugeColor}20`
      }}>
        {isPHSensor 
          ? phColorStatus.status 
          : (() => {
              const { optimal } = ranges;
              if (value >= optimal.min && value <= optimal.max) {
                return '✅ İdeal';
              }
              const acceptableMin = optimal.min - (optimal.max - optimal.min) * 0.5;
              const acceptableMax = optimal.max + (optimal.max - optimal.min) * 0.5;
              if (value >= acceptableMin && value <= acceptableMax) {
                return '⚡ Normal';
              }
              return '⚠️ Problem';
            })()
        }
      </div>
    </div>
  );
};

export default GaugeChart;
