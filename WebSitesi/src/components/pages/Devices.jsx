import { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import Button from '../common/Button';
import GaugeChart from '../common/GaugeChart';
import { useDevices } from '../../hooks/useDevices';
import { formatLastSeen, getBatteryColor, getStatusColor, validateDeviceId } from '../../utils/deviceUtils';
import { getSensorIcon } from '../../utils/sensorUtils';
import { db } from '../../firebase';
import { ref, set, remove } from 'firebase/database';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';

function Devices({ user }) {
  const { devices, loading } = useDevices(user);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [addingDevice, setAddingDevice] = useState(false);  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [timeRange, setTimeRange] = useState('5m'); // Zaman aralığı state'i - default 5 dakika

  // Zaman aralığına göre verileri filtrele
  const getFilteredSensorData = (sensorData) => {
    if (!sensorData || sensorData.length === 0) return [];
    
    const now = new Date();
    let startTime;
      switch (timeRange) {
      case '5m':
        startTime = new Date(now.getTime() - 5 * 60 * 1000); // 5 dakika
        break;
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000); // 1 saat
        break;
      case '1d':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 gün
        break;
      case '1w':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 hafta
        break;
      case '1m':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 ay
        break;
      default:
        return sensorData; // Tüm veriler
    }
    
    const filtered = sensorData.filter(data => {
      const dataTime = new Date(data.ts);
      return dataTime >= startTime;
    });
      // Debug: Veri tarihlerini göster
    const firstData = sensorData[0];
    const lastData = sensorData[sensorData.length - 1];
    console.log(`🕒 Şu anki zaman: ${now.toLocaleString('tr-TR')}`);
    console.log(`📅 Başlangıç zamanı (${timeRange}): ${startTime.toLocaleString('tr-TR')}`);
    if (firstData) console.log(`📊 İlk veri: ${new Date(firstData.ts).toLocaleString('tr-TR')}`);    if (lastData) console.log(`📊 Son veri: ${new Date(lastData.ts).toLocaleString('tr-TR')}`);
    console.log(`📈 Toplam veri: ${sensorData.length}, Filtrelenmiş veri: ${filtered.length}, Zaman aralığı: ${timeRange} (${timeRange === '5m' ? '5 dakika' : timeRange === '1h' ? '1 saat' : timeRange === '1d' ? '1 gün' : timeRange === '1w' ? '1 hafta' : '1 ay'})`);
    
    // Filtrelenmiş verinin ilk ve son tarihlerini de göster
    if (filtered.length > 0) {
      const firstFiltered = filtered[0];
      const lastFiltered = filtered[filtered.length - 1];
      console.log(`🔍 Filtrelenmiş - İlk: ${new Date(firstFiltered.ts).toLocaleString('tr-TR')}`);
      console.log(`🔍 Filtrelenmiş - Son: ${new Date(lastFiltered.ts).toLocaleString('tr-TR')}`);
    }    
    return filtered;
  };
  // Filtrelenmiş sensör verilerini hesapla (selectedDevice değiştiğinde)
  const filteredSensorData = selectedDevice?.sensorData 
    ? getFilteredSensorData(selectedDevice.sensorData) 
    : [];

  // X ekseni için zaman formatı (zaman aralığına göre)
  const getXAxisFormatter = () => {
    switch (timeRange) {
      case '5m':
      case '1h':
        // Kısa aralıklar için saat:dakika
        return (ts) => new Date(ts).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
      case '1d':
        // 1 gün için saat
        return (ts) => new Date(ts).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
      case '1w':
        // 1 hafta için gün/ay
        return (ts) => new Date(ts).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit'});
      case '1m':
        // 1 ay için gün/ay
        return (ts) => new Date(ts).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit'});
      default:
        return (ts) => new Date(ts).toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
    }
  };

// Cihaz seçimi güncellendiğinde selectedDevice'ı güncelle
  useEffect(() => {
    if (selectedDevice && devices.length > 0) {
      const updatedDevice = devices.find(device => device.id === selectedDevice.id);
      if (updatedDevice) {
        setSelectedDevice(updatedDevice);
      }
    }
  }, [devices, selectedDevice?.id]);
  const handleDeviceClick = (device) => {
    setSelectedDevice(device);
  };
  const addNewDevice = async () => {
    if (!user || !newDeviceId.trim()) return;
    
    setAddingDevice(true);
    
    try {
      const deviceId = newDeviceId.trim();
      
      // Cihaz ID formatını kontrol et
      if (!validateDeviceId(deviceId)) {
        alert('Geçersiz cihaz ID! Lütfen geçerli bir format kullanın (örn: DEV001, SENSOR-123)');
        setAddingDevice(false);
        return;
      }
      
      // Cihazın zaten var olup olmadığını kontrol et
      const existingDevice = devices.find(device => device.id === deviceId);
      if (existingDevice) {
        alert('Bu cihaz ID\'si zaten mevcut!');
        setAddingDevice(false);
        return;
      }      const newDevice = {
        name: `Cihaz ${deviceId}`,
        type: 'Hidroponik Sensör',
        status: 'offline', // İlk başta offline, veri geldiğinde online olacak
        lastSeen: Date.now(),
        location: 'Belirtilmemiş',
        batteryLevel: 0,
        sensors: ['lux', 'ph', 'tds', 'temperature', 'humidity', 'camera'],
        createdAt: Date.now()
      };

      // Cihazı Firebase'e kaydet
      await set(ref(db, `users/${user.uid}/devices/${deviceId}`), newDevice);

      console.log('Yeni cihaz başarıyla eklendi:', deviceId);
      
      // Form'u temizle ve kapat
      setNewDeviceId('');
      setShowAddDevice(false);
      
    } catch (error) {
      console.error('Cihaz eklenirken hata:', error);
      alert('Cihaz eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setAddingDevice(false);
    }
  };  const handleBackToDevices = () => {
    setSelectedDevice(null);
  };
  const handleDeleteClick = (deviceId) => {
    setDeviceToDelete(deviceId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteDevice = async () => {
    if (!user || !deviceToDelete) return;
    
    try {
      // Cihazı Firebase'den sil
      await remove(ref(db, `users/${user.uid}/devices/${deviceToDelete}`));
      
      console.log('Cihaz başarıyla kaldırıldı:', deviceToDelete);
      
      // Modal'ı kapat ve cihaz listesine geri dön
      setShowDeleteConfirm(false);
      setDeviceToDelete(null);
      setSelectedDevice(null);
      
    } catch (error) {
      console.error('Cihaz kaldırılırken hata:', error);
      alert('Cihaz kaldırılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeviceToDelete(null);
  };
  const openImageModal = (imageData) => {
    console.log('Opening image modal with:', imageData); // Debug log
    setSelectedImage(imageData);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    console.log('Closing image modal'); // Debug log
    setShowImageModal(false);
    // Modal kapanma animasyonu için biraz bekle, sonra selectedImage'ı temizle
    setTimeout(() => {
      setSelectedImage(null);
    }, 300);
  };

  // Modal state'inin doğru çalışması için useEffect ekle
  useEffect(() => {
    console.log('Image modal state changed:', { showImageModal, selectedImage });
  }, [showImageModal, selectedImage]);

  // Eğer bir cihaz seçilmişse, o cihazın detay sayfasını göster
  if (selectedDevice) {
    return (
      <div className="devices-content">
        {/* Header with back button */}        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button 
              onClick={handleBackToDevices}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#43e97b',
                fontWeight: 600,
                fontSize: 16,
                marginRight: 16
              }}
            >
              ← Cihazlara Dön
            </button>
            <h2 style={{margin: 0, color: '#232526', fontSize: 24, fontWeight: 700}}>
              {selectedDevice.name}
            </h2>
          </div>          {/* Cihazı Kaldır Butonu */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(selectedDevice.id);
            }}
            style={{
              background: 'linear-gradient(135deg, #ff4757 0%, #ff3742 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 8,
              padding: '10px 16px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(255, 71, 87, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 16px rgba(255, 71, 87, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(255, 71, 87, 0.2)';
            }}
          >
            🗑️ Cihazı Kaldır
          </button>
        </div>

        {/* Device Info Card */}
        <div className="modern-card" style={{marginBottom: 32}}>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24}}>
            <div>
              <span style={{color: '#666', fontSize: 14, display: 'block', marginBottom: 4}}>Cihaz Tipi</span>
              <span style={{color: '#232526', fontSize: 16, fontWeight: 600}}>{selectedDevice.type}</span>
            </div>
            <div>
              <span style={{color: '#666', fontSize: 14, display: 'block', marginBottom: 4}}>Durum</span>
              <span style={{
                color: getStatusColor(selectedDevice.status),
                fontSize: 16,
                fontWeight: 600
              }}>
                {selectedDevice.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
              </span>
            </div>
            <div>
              <span style={{color: '#666', fontSize: 14, display: 'block', marginBottom: 4}}>Konum</span>
              <span style={{color: '#232526', fontSize: 16, fontWeight: 600}}>{selectedDevice.location}</span>
            </div>
            <div>
              <span style={{color: '#666', fontSize: 14, display: 'block', marginBottom: 4}}>Batarya</span>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div style={{
                  width: 60,
                  height: 8,
                  background: '#f0f0f0',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${selectedDevice.batteryLevel}%`,
                    height: '100%',
                    background: getBatteryColor(selectedDevice.batteryLevel),
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
                <span style={{color: getBatteryColor(selectedDevice.batteryLevel), fontSize: 16, fontWeight: 600}}>
                  {selectedDevice.batteryLevel}%
                </span>
              </div>
            </div>
          </div>
        </div>        {/* Sensor Data Charts */}        <div style={{
          marginBottom: 32,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 20,
          padding: 24,
          color: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div>
              <h2 style={{
                fontSize: 24,
                fontWeight: 800,
                margin: '0 0 8px 0',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                📊 Sensör Verileri
              </h2>
              <p style={{
                fontSize: 16,
                margin: 0,
                opacity: 0.9
              }}>
                Gerçek zamanlı hidroponik sistem takibi
              </p>
            </div>
            
            {/* Time Range Selector */}
            <div style={{
              display: 'flex',
              gap: 8,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 6
            }}>              {[
                { value: '5m', label: '5 Dakika' },
                { value: '1h', label: '1 Saat' },
                { value: '1d', label: '1 Gün' },
                { value: '1w', label: '1 Hafta' },
                { value: '1m', label: '1 Ay' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  style={{
                    background: timeRange === option.value 
                      ? 'rgba(255,255,255,0.9)' 
                      : 'transparent',
                    color: timeRange === option.value 
                      ? '#667eea' 
                      : 'rgba(255,255,255,0.8)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textShadow: timeRange === option.value ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (timeRange !== option.value) {
                      e.target.style.background = 'rgba(255,255,255,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (timeRange !== option.value) {
                      e.target.style.background = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>        </div>
        
        {selectedDevice.sensorData && selectedDevice.sensorData.length > 0 ? (
          (() => {
            // Filtrelenmiş sensör verilerini al
            const filteredSensorData = getFilteredSensorData(selectedDevice.sensorData);
            console.log(`🎯 Gösterilecek veri sayısı (${timeRange}):`, filteredSensorData.length);
            
            return (
              <>                <div style={{display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 32}}>
                  {/* LUX Chart */}
                  {filteredSensorData.some(d => d.lux !== undefined) && (
                    <div style={{
                      background: 'linear-gradient(145deg, #fff9e6, #ffeb3b)',
                      border: '2px solid #ffc107',
                      borderRadius: 24,
                      padding: 28,
                      boxShadow: '0 12px 40px rgba(253, 224, 71, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                    }}>
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 20
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #ffe066, #ffcc02)',
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 24
                          }}>
                            ☀️
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: 18,
                              fontWeight: 700,
                              margin: 0,
                              color: '#2d3748'
                            }}>
                              Işık Şiddeti
                            </h3>
                            <p style={{
                              fontSize: 14,
                              color: '#718096',
                              margin: 0
                            }}>
                              Fotosentez için gerekli ışık
                            </p>
                          </div>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #fff4e6, #ffe8cc)',
                          border: '2px solid #ffcc02',
                          borderRadius: 16,
                          padding: '12px 20px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#b7791f',
                            lineHeight: 1
                          }}>
                            {filteredSensorData.length > 0 ? filteredSensorData[filteredSensorData.length - 1]?.lux?.toFixed(0) || 'N/A' : 'N/A'}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#b7791f',
                            fontWeight: 600,
                            marginTop: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            LUX
                          </div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={filteredSensorData} margin={{top:8,right:8,left:0,bottom:8}}>                          <defs>
                            <linearGradient id="luxGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ffe066" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ffe066" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="ts" 
                            tickFormatter={getXAxisFormatter()}
                            tick={{fontSize: 12, fill: '#718096'}}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{fontSize: 12, fill: '#718096'}} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            labelFormatter={ts=>new Date(ts).toLocaleString('tr-TR')}
                            formatter={(value) => [value, 'LUX']}
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="lux" 
                            stroke="#ffe066" 
                            fillOpacity={1} 
                            fill="url(#luxGradient)"
                            strokeWidth={3}
                            dot={(props) => {
                              const { cx, cy, payload, index } = props;
                              const isLast = index === filteredSensorData.length - 1;
                              if (isLast) {
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={6} 
                                    fill="#ffcc02" 
                                    stroke="#fff" 
                                    strokeWidth={3}
                                    style={{
                                      filter: 'drop-shadow(0 2px 4px rgba(255,204,2,0.4))',
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                );
                              }
                              return <circle cx={cx} cy={cy} r={1} fill="rgba(255,230,102,0.3)" />;
                            }}
                            activeDot={{r:6,fill:'#ffcc02'}}
                          />
                          {/* Son veri noktasını büyük göstermek için Line */}
                          <Line 
                            type="monotone" 
                            dataKey="lux" 
                            stroke="transparent" 
                            strokeWidth={0}
                            dot={false}
                            activeDot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}                  {/* pH Chart */}
                  {filteredSensorData.some(d => d.ph !== undefined || d.ph_v !== undefined) && (
                    <div style={{
                      background: 'linear-gradient(145deg, #e6f7ff, #03a9f4)',
                      border: '2px solid #0288d1',
                      borderRadius: 24,
                      padding: 28,
                      boxShadow: '0 12px 40px rgba(14, 165, 233, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                    }}>
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 20
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #00bcd4, #0097a7)',
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 24
                          }}>
                            🧪
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: 18,
                              fontWeight: 700,
                              margin: 0,
                              color: '#2d3748'
                            }}>
                              pH Seviyesi
                            </h3>
                            <p style={{
                              fontSize: 14,
                              color: '#718096',
                              margin: 0
                            }}>
                              Asitlik-bazlık dengesi
                            </p>
                          </div>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #e6f7ff, #b3e5fc)',
                          border: '2px solid #00bcd4',
                          borderRadius: 16,
                          padding: '12px 20px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#00838f',
                            lineHeight: 1
                          }}>
                            {(() => {
                              const latestData = filteredSensorData[filteredSensorData.length - 1];
                              const phValue = latestData?.ph || latestData?.ph_v;
                              return phValue ? phValue.toFixed(1) : 'N/A';
                            })()}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#00838f',
                            fontWeight: 600,
                            marginTop: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            pH
                          </div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={filteredSensorData} margin={{top:8,right:8,left:0,bottom:8}}>                          <defs>
                            <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00bcd4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="ts" 
                            tickFormatter={getXAxisFormatter()}
                            tick={{fontSize: 12, fill: '#718096'}}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{fontSize: 12, fill: '#718096'}} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            labelFormatter={ts=>new Date(ts).toLocaleString('tr-TR')}
                            formatter={(value) => [value, 'pH']}
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                            }}
                          />                          <Area 
                            type="monotone" 
                            dataKey="ph" 
                            stroke="#00bcd4" 
                            fillOpacity={1} 
                            fill="url(#phGradient)"
                            strokeWidth={3}
                            dot={(props) => {
                              const { cx, cy, payload, index } = props;
                              const isLast = index === filteredSensorData.length - 1;
                              if (isLast) {
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={6} 
                                    fill="#0097a7" 
                                    stroke="#fff" 
                                    strokeWidth={3}
                                    style={{
                                      filter: 'drop-shadow(0 2px 4px rgba(0,151,167,0.4))',
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                );
                              }
                              return <circle cx={cx} cy={cy} r={1} fill="rgba(0,188,212,0.3)" />;
                            }}
                            activeDot={{r:6,fill:'#0097a7'}}
                          />
                          {/* Son veri noktasını büyük göstermek için Line */}
                          <Line 
                            type="monotone" 
                            dataKey="ph" 
                            stroke="transparent" 
                            strokeWidth={0}
                            dot={false}
                            activeDot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}                  {filteredSensorData.some(d => d.tds !== undefined || d.tds_v !== undefined) && (
                    <div style={{
                      background: 'linear-gradient(145deg, #e8f5e8, #4caf50)',
                      border: '2px solid #388e3c',
                      borderRadius: 24,
                      padding: 28,
                      boxShadow: '0 12px 40px rgba(34, 197, 94, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                    }}>
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 20
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 24
                          }}>
                            💧
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: 18,
                              fontWeight: 700,
                              margin: 0,
                              color: '#2d3748'
                            }}>
                              TDS Seviyesi
                            </h3>
                            <p style={{
                              fontSize: 14,
                              color: '#718096',
                              margin: 0
                            }}>
                              Çözünmüş katı madde miktarı
                            </p>
                          </div>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                          border: '2px solid #22c55e',
                          borderRadius: 16,
                          padding: '12px 20px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#15803d',
                            lineHeight: 1
                          }}>
                            {(() => {
                              const latestData = filteredSensorData[filteredSensorData.length - 1];
                              const tdsValue = latestData?.tds || latestData?.tds_v;
                              return tdsValue ? tdsValue.toFixed(0) : 'N/A';
                            })()}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#15803d',
                            fontWeight: 600,
                            marginTop: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            ppm
                          </div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={filteredSensorData} margin={{top:8,right:8,left:0,bottom:8}}>                          <defs>
                            <linearGradient id="tdsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="ts" 
                            tickFormatter={getXAxisFormatter()}
                            tick={{fontSize: 12, fill: '#718096'}}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{fontSize: 12, fill: '#718096'}} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            labelFormatter={ts=>new Date(ts).toLocaleString('tr-TR')}
                            formatter={(value) => [value, 'ppm']}
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                            }}
                          />                          <Area 
                            type="monotone" 
                            dataKey="tds" 
                            stroke="#22c55e" 
                            fillOpacity={1} 
                            fill="url(#tdsGradient)"
                            strokeWidth={3}
                            dot={(props) => {
                              const { cx, cy, payload, index } = props;
                              const isLast = index === filteredSensorData.length - 1;
                              if (isLast) {
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={6} 
                                    fill="#16a34a" 
                                    stroke="#fff" 
                                    strokeWidth={3}
                                    style={{
                                      filter: 'drop-shadow(0 2px 4px rgba(22,163,74,0.4))',
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                );
                              }
                              return <circle cx={cx} cy={cy} r={1} fill="rgba(34,197,94,0.3)" />;
                            }}
                            activeDot={{r:6,fill:'#16a34a'}}
                          />
                          {/* Son veri noktasını büyük göstermek için Line */}
                          <Line 
                            type="monotone" 
                            dataKey="tds" 
                            stroke="transparent" 
                            strokeWidth={0}
                            dot={false}
                            activeDot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}                  {/* Temperature Chart */}
                  {filteredSensorData.some(d => d.temperature !== undefined) && (
                    <div style={{
                      background: 'linear-gradient(145deg, #ffebee, #f44336)',
                      border: '2px solid #d32f2f',
                      borderRadius: 24,
                      padding: 28,
                      boxShadow: '0 12px 40px rgba(239, 68, 68, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                    }}>
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 20
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 24
                          }}>
                            🌡️
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: 18,
                              fontWeight: 700,
                              margin: 0,
                              color: '#2d3748'
                            }}>
                              Sıcaklık
                            </h3>
                            <p style={{
                              fontSize: 14,
                              color: '#718096',
                              margin: 0
                            }}>
                              Çevre sıcaklığı
                            </p>
                          </div>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                          border: '2px solid #ef4444',
                          borderRadius: 16,
                          padding: '12px 20px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#b91c1c',
                            lineHeight: 1
                          }}>
                            {filteredSensorData.length > 0 ? filteredSensorData[filteredSensorData.length - 1]?.temperature?.toFixed(1) || 'N/A' : 'N/A'}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#b91c1c',
                            fontWeight: 600,
                            marginTop: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            °C
                          </div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={filteredSensorData} margin={{top:8,right:8,left:0,bottom:8}}>                          <defs>
                            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="ts" 
                            tickFormatter={getXAxisFormatter()}
                            tick={{fontSize: 12, fill: '#718096'}}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{fontSize: 12, fill: '#718096'}} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            labelFormatter={ts=>new Date(ts).toLocaleString('tr-TR')}
                            formatter={(value) => [value, '°C']}
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                            }}
                          />                          <Area 
                            type="monotone" 
                            dataKey="temperature" 
                            stroke="#ef4444" 
                            fillOpacity={1} 
                            fill="url(#tempGradient)"
                            strokeWidth={3}
                            dot={(props) => {
                              const { cx, cy, payload, index } = props;
                              const isLast = index === filteredSensorData.length - 1;
                              if (isLast) {
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={6} 
                                    fill="#dc2626" 
                                    stroke="#fff" 
                                    strokeWidth={3}
                                    style={{
                                      filter: 'drop-shadow(0 2px 4px rgba(220,38,38,0.8))',
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                );
                              }
                              return <circle cx={cx} cy={cy} r={1} fill="rgba(239,68,68,0.3)" />;
                            }}
                            activeDot={{r:6,fill:'#dc2626'}}
                          />
                          {/* Son veri noktasını büyük göstermek için Line */}
                          <Line 
                            type="monotone" 
                            dataKey="temperature" 
                            stroke="transparent" 
                            strokeWidth={0}
                            dot={false}
                            activeDot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}                  {/* Humidity Chart */}
                  {filteredSensorData.some(d => d.humidity !== undefined) && (
                    <div style={{
                      background: 'linear-gradient(145deg, #e0f2f1, #26a69a)',
                      border: '2px solid #00695c',
                      borderRadius: 24,
                      padding: 28,
                      boxShadow: '0 12px 40px rgba(20, 184, 166, 0.15)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                    }}>
                      <div style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 20
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12
                        }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                            borderRadius: 12,
                            padding: 12,
                            fontSize: 24
                          }}>
                            💨
                          </div>
                          <div>
                            <h3 style={{
                              fontSize: 18,
                              fontWeight: 700,
                              margin: 0,
                              color: '#2d3748'
                            }}>
                              Nem Oranı
                            </h3>
                            <p style={{
                              fontSize: 14,
                              color: '#718096',
                              margin: 0
                            }}>
                              Hava nem seviyesi
                            </p>
                          </div>
                        </div>
                        <div style={{
                          background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)',
                          border: '2px solid #14b8a6',
                          borderRadius: 16,
                          padding: '12px 20px',
                          minWidth: '90px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#0f766e',
                            lineHeight: 1
                          }}>
                            {filteredSensorData.length > 0 ? filteredSensorData[filteredSensorData.length - 1]?.humidity?.toFixed(1) || 'N/A' : 'N/A'}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: '#0f766e',
                            fontWeight: 600,
                            marginTop: 2,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            %
                          </div>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={filteredSensorData} margin={{top:8,right:8,left:0,bottom:8}}>                          <defs>
                            <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="ts" 
                            tickFormatter={getXAxisFormatter()}
                            tick={{fontSize: 12, fill: '#718096'}}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
                            tick={{fontSize: 12, fill: '#718096'}} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            labelFormatter={ts=>new Date(ts).toLocaleString('tr-TR')}
                            formatter={(value) => [value, '%']}
                            contentStyle={{
                              background: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              borderRadius: 12,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                            }}
                          />                          <Area 
                            type="monotone" 
                            dataKey="humidity" 
                            stroke="#14b8a6" 
                            fillOpacity={1} 
                            fill="url(#humidityGradient)"
                            strokeWidth={3}
                            dot={(props) => {
                              const { cx, cy, payload, index } = props;
                              const isLast = index === filteredSensorData.length - 1;
                              if (isLast) {
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={6} 
                                    fill="#0d9488" 
                                    stroke="#fff" 
                                    strokeWidth={3}
                                    style={{
                                      filter: 'drop-shadow(0 2px 4px rgba(13,148,136,0.4))',
                                      animation: 'pulse 2s infinite'
                                    }}
                                  />
                                );
                              }
                              return <circle cx={cx} cy={cy} r={1} fill="rgba(20,184,166,0.3)" />;
                            }}
                            activeDot={{r:6,fill:'#0d9488'}}
                          />
                          {/* Son veri noktasını büyük göstermek için Line */}
                          <Line 
                            type="monotone" 
                            dataKey="humidity" 
                            stroke="transparent" 
                            strokeWidth={0}
                            dot={false}
                            activeDot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Anlık Değerler - Gauge Charts */}
                <div className="modern-card" style={{marginBottom: 24}}>
                  <div style={{fontWeight:700, marginBottom:24, display: 'flex', alignItems: 'center', fontSize: 18, color: '#232526'}}>
                    📊 Anlık Değerler
                  </div>
                  
                  <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: 16,
                    justifyItems: 'center'
                  }}>
                    {/* LUX Gauge */}
                    {filteredSensorData.some(d => d.lux !== undefined) && (() => {
                      const latestLux = filteredSensorData[filteredSensorData.length - 1]?.lux || 0;
                      return (
                        <GaugeChart
                          value={latestLux}
                          min={0}
                          max={100000}
                          unit="lux"
                          color="#ffe066"
                          label="☀️ Işık Şiddeti"
                        />
                      );
                    })()}                    {/* pH Gauge */}
                    {filteredSensorData.some(d => d.ph !== undefined) && (() => {
                      const latestPH = filteredSensorData[filteredSensorData.length - 1]?.ph || 7;
                      return (
                        <GaugeChart
                          value={latestPH}
                          min={0}
                          max={14}
                          unit="pH"
                          color="#00bcd4"
                          label="💧 pH Seviyesi"
                        />
                      );
                    })()}

                    {/* TDS Gauge */}
                    {filteredSensorData.some(d => d.tds !== undefined) && (() => {
                      const latestTDS = filteredSensorData[filteredSensorData.length - 1]?.tds || 0;
                      return (
                        <GaugeChart
                          value={latestTDS}
                          min={0}
                          max={2000}
                          unit="ppm"
                          color="#ff7043"
                          label="🧪 TDS Seviyesi"
                        />
                      );
                    })()}

                    {/* Temperature Gauge */}
                    {filteredSensorData.some(d => d.temperature !== undefined) && (() => {
                      const latestTemp = filteredSensorData[filteredSensorData.length - 1]?.temperature || 20;
                      return (
                        <GaugeChart
                          value={latestTemp}
                          min={0}
                          max={50}
                          unit="°C"
                          color="#ff5722"
                          label="🌡️ Sıcaklık"
                        />
                      );
                    })()}

                    {/* Humidity Gauge */}
                    {filteredSensorData.some(d => d.humidity !== undefined) && (() => {
                      const latestHumidity = filteredSensorData[filteredSensorData.length - 1]?.humidity || 50;
                      return (
                        <GaugeChart
                          value={latestHumidity}
                          min={0}
                          max={100}
                          unit="%"
                          color="#4ecdc4"
                          label="💨 Nem Oranı"
                        />
                      );
                    })()}
                  </div>                </div>                {/* AI Prediction Section */}
                {filteredSensorData.some(d => d.ai_prediction) && (
                  <div className="modern-card" style={{marginBottom: 24}}>
                    <div style={{fontWeight:700, marginBottom:16, display: 'flex', alignItems: 'center', fontSize: 18, color: '#232526'}}>
                      🤖 Analiz Sonucu
                    </div>
                      {(() => {
                      const latestAI = filteredSensorData.find(d => d.ai_prediction);
                      if (!latestAI || !latestAI.ai_prediction) return null;
                      
                      const ai = latestAI.ai_prediction;
                      const isHealthy = ai.prediction === "Saglikli";
                      
                      return (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: 20
                        }}>
                          {/* Prediction Result */}
                          <div style={{
                            background: isHealthy ? '#f0f9f4' : '#fef2f2',
                            border: `2px solid ${isHealthy ? '#43e97b' : '#ef4444'}`,
                            borderRadius: 12,
                            padding: 20,
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontSize: 48,
                              marginBottom: 12
                            }}>
                              {isHealthy ? '🌱' : '⚠️'}
                            </div>
                            <h3 style={{
                              color: isHealthy ? '#16a34a' : '#dc2626',
                              margin: '0 0 8px 0',
                              fontSize: 18,
                              fontWeight: 'bold'
                            }}>
                              {ai.prediction}
                            </h3>
                            <p style={{
                              color: '#666',
                              fontSize: 14,
                              margin: 0
                            }}>
                              Güven: %{ai.confidence}
                            </p>
                          </div>

                          {/* Risk Level */}
                          <div style={{
                            background: '#f8fafc',
                            border: '2px solid #e2e8f0',
                            borderRadius: 12,
                            padding: 20
                          }}>
                            <h4 style={{
                              color: '#232526',
                              margin: '0 0 12px 0',
                              fontSize: 16,
                              fontWeight: 'bold'
                            }}>
                              📊 Risk Seviyesi
                            </h4>
                            <div style={{
                              fontSize: 18,
                              fontWeight: 'bold',
                              color: ai.risk_level === 'Düşük' ? '#16a34a' : '#dc2626'
                            }}>
                              {ai.risk_level}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Suggestions */}                    {(() => {
                      const latestAI = filteredSensorData.find(d => d.ai_prediction);
                      if (!latestAI?.ai_prediction?.suggestions) return null;
                      
                      return (
                        <div style={{marginTop: 20}}>
                          <h4 style={{
                            color: '#232526',
                            margin: '0 0 12px 0',
                            fontSize: 16,
                            fontWeight: 'bold'
                          }}>
                            💡 Öneriler
                          </h4>                          <ul style={{
                            margin: 0,
                            padding: '0 0 0 20px',
                            color: '#000'
                          }}>
                            {latestAI.ai_prediction.suggestions.map((suggestion, index) => (
                              <li key={index} style={{marginBottom: 8}}>
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })()}
                  </div>
                )}
                  {/* Kamera Görüntüleri - Son 5 görüntü */}
                {selectedDevice.sensorData.filter(d => d.image).length > 0 && (
                  <div style={{
                    background: 'linear-gradient(145deg, #f0f9ff, #ffffff)',
                    borderRadius: 24,
                    padding: 32,
                    marginBottom: 24,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    border: '1px solid #e0f2fe'
                  }}>
                    <div style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: 24
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16
                      }}>
                        <div style={{
                          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                          borderRadius: 16,
                          padding: 16,
                          fontSize: 28
                        }}>
                          📷
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: 24,
                            fontWeight: 800,
                            margin: 0,
                            color: '#0f172a',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            Kamera Görüntüleri
                          </h3>
                          <p style={{
                            fontSize: 16,
                            color: '#64748b',
                            margin: 0
                          }}>
                            Gerçek zamanlı bitki takibi
                          </p>
                        </div>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        padding: '8px 16px',
                        borderRadius: 20,
                        boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
                      }}>
                        📸 {Math.min(selectedDevice.sensorData.filter(d => d.image).length, 5)} görüntü
                      </div>
                    </div>

                    {/* Ana (en son) görüntü */}
                    {(() => {
                      const imagesWithData = selectedDevice.sensorData.filter(d => d.image).slice(-5);
                      const latestImage = imagesWithData[imagesWithData.length - 1];
                      
                      return (
                        <div style={{marginBottom: 20}}>
                          <div style={{textAlign: 'center', marginBottom: 12}}>                            <img 
                              key={latestImage.ts}
                              src={`data:image/jpeg;base64,${latestImage.image}`}
                              alt="En Son Görüntü"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '400px',
                                height: 'auto',
                                borderRadius: 12,
                                border: '3px solid #43e97b',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                                cursor: 'pointer'
                              }}                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Ana fotoğraf tıklandı'); // Debug log
                              openImageModal({
                                url: `data:image/jpeg;base64,${latestImage.image}`,
                                timestamp: latestImage.ts
                              });
                            }}
                          />
                          </div>                          <p style={{
                            textAlign: 'center',
                            color: '#43e97b', 
                            fontSize: 14, 
                            marginTop: 8, 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                          }}>
                            <span style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#ff4757',
                              animation: 'pulse 2s infinite'
                            }}></span>
                            CANLI • {new Date(latestImage.ts).toLocaleString('tr-TR')}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Küçük görüntü galerisi */}
                    {(() => {
                      const imagesWithData = selectedDevice.sensorData.filter(d => d.image).slice(-5);
                      
                      if (imagesWithData.length > 1) {
                        return (
                          <div>                              <h4 style={{
                                color: '#0891b2', 
                                fontSize: 16, 
                                fontWeight: 700, 
                                marginBottom: 16,
                                textAlign: 'center'
                              }}>
                                📸 Önceki Görüntüler
                              </h4>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                              gap: 12,
                              maxWidth: '600px',
                              margin: '0 auto'
                            }}>
                              {imagesWithData.slice(0, -1).reverse().map((data, index) => (
                                <div key={data.ts} style={{textAlign: 'center'}}>                                  <img 
                                    src={`data:image/jpeg;base64,${data.image}`}
                                    alt={`Görüntü ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '80px',
                                      objectFit: 'cover',
                                      borderRadius: 8,
                                      border: '2px solid #e0e0e0',
                                      cursor: 'pointer',
                                      transition: 'all 0.3s ease'
                                    }}                                  onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      console.log('Küçük fotoğraf tıklandı:', index); // Debug log
                                      openImageModal({
                                        url: `data:image/jpeg;base64,${data.image}`,
                                        timestamp: data.ts
                                      });
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.transform = 'scale(1.05)';
                                      e.target.style.borderColor = '#43e97b';
                                      e.target.style.boxShadow = '0 4px 12px rgba(67, 233, 123, 0.3)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.transform = 'scale(1)';
                                      e.target.style.borderColor = '#e0e0e0';
                                      e.target.style.boxShadow = 'none';
                                    }}
                                  />
                                  <p style={{
                                    fontSize: 11, 
                                    color: '#999', 
                                    marginTop: 4,
                                    fontWeight: 500
                                  }}>
                                    {new Date(data.ts).toLocaleTimeString('tr-TR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              ))}                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}          </>
            );
          })()
        ) : (
          <div className="modern-card" style={{textAlign: 'center', padding: '60px 32px'}}>
            <div style={{fontSize: 48, marginBottom: 16, opacity: 0.3}}>📊</div>
            <h3 style={{color: '#666', marginBottom: 12, fontSize: 20}}>Sensör verisi bulunamadı</h3>
            <p style={{color: '#999', fontSize: 16, lineHeight: 1.5}}>
              Bu cihazdan henüz sensör verisi alınmamış.<br/>
              Veriler gerçek zamanlı olarak güncellenecektir.
            </p>
          </div>
        )}{/* Analytics Section - Only show if we have data */}
        {selectedDevice.sensorData && selectedDevice.sensorData.length > 0 && (
          <>
            <h3 style={{color: '#232526', fontSize: 20, fontWeight: 700, marginBottom: 24}}>Analitik Sonuçlar</h3>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24}}>
              {/* Average Values */}
              <div className="modern-card">
                <h4 style={{margin: '0 0 16px 0', color: '#232526', fontSize: 16, fontWeight: 700}}>Ortalama Değerler</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  {selectedDevice.sensorData.some(d => d.lux !== undefined) && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666'}}>LUX:</span>                      <span style={{fontWeight: 600, color: '#ffe066'}}>
                        {filteredSensorData.length > 0 ? Math.round(filteredSensorData.reduce((sum, d) => sum + (d.lux || 0), 0) / filteredSensorData.length) : 'N/A'}
                      </span>
                    </div>
                  )}                  {selectedDevice.sensorData.some(d => d.ph !== undefined) && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666'}}>pH:</span>                      <span style={{
                        fontWeight: 600, 
                        color: (() => {
                          const avgPH = filteredSensorData.length > 0 ? (filteredSensorData.reduce((sum, d) => sum + (d.ph || 0), 0) / filteredSensorData.length) : 7;
                          if (avgPH >= 6.0 && avgPH <= 7.5) return '#43e97b'; // İdeal
                          if ((avgPH >= 5.5 && avgPH < 6.0) || (avgPH > 7.5 && avgPH <= 8.0)) return '#ffd93d'; // Normal
                          return '#ff6b6b'; // Problem
                        })()
                      }}>
                        {filteredSensorData.length > 0 ? (filteredSensorData.reduce((sum, d) => sum + (d.ph || 0), 0) / filteredSensorData.length).toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  )}
                  {selectedDevice.sensorData.some(d => d.tds !== undefined) && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666'}}>TDS:</span>                      <span style={{fontWeight: 600, color: '#43e97b'}}>
                        {filteredSensorData.length > 0 ? Math.round(filteredSensorData.reduce((sum, d) => sum + (d.tds || 0), 0) / filteredSensorData.length) : 'N/A'}
                      </span>
                    </div>
                  )}
                  {selectedDevice.sensorData.some(d => d.temperature !== undefined) && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666'}}>Sıcaklık:</span>                      <span style={{fontWeight: 600, color: '#ff6b6b'}}>
                        {filteredSensorData.length > 0 ? (filteredSensorData.reduce((sum, d) => sum + (d.temperature || 0), 0) / filteredSensorData.length).toFixed(1) : 'N/A'}°C
                      </span>
                    </div>
                  )}
                  {selectedDevice.sensorData.some(d => d.humidity !== undefined) && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666'}}>Nem:</span>                      <span style={{fontWeight: 600, color: '#4ecdc4'}}>
                        {filteredSensorData.length > 0 ? (filteredSensorData.reduce((sum, d) => sum + (d.humidity || 0), 0) / filteredSensorData.length).toFixed(1) : 'N/A'}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Summary */}
              <div className="modern-card">
                <h4 style={{margin: '0 0 16px 0', color: '#232526', fontSize: 16, fontWeight: 700}}>Durum Özeti</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#666'}}>Son Güncelleme:</span>
                    <span style={{fontWeight: 600, color: '#232526'}}>
                      {formatLastSeen(selectedDevice.lastSeen)}
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#666'}}>Veri Sayısı:</span>                    <span style={{fontWeight: 600, color: '#232526'}}>
                      {filteredSensorData.length} ölçüm
                    </span>
                  </div>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span style={{color: '#666'}}>Aktif Sensör:</span>
                    <span style={{fontWeight: 600, color: '#43e97b'}}>
                      {selectedDevice.sensors.length} adet
                    </span>
                  </div>
                  {selectedDevice.sensorData[0]?.image && (
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{color: '#666'}}>Kamera:</span>
                      <span style={{fontWeight: 600, color: '#43e97b'}}>
                        Aktif
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="modern-card">
                <h4 style={{margin: '0 0 16px 0', color: '#232526', fontSize: 16, fontWeight: 700}}>Öneriler</h4>
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {selectedDevice.status === 'online' ? (
                    <>                      <div style={{padding: '8px 12px', background: '#e8f5e8', borderRadius: 6, fontSize: 14, color: '#000'}}>
                        ✅ Cihaz normal çalışıyor
                      </div>
                      {selectedDevice.batteryLevel < 30 && (
                        <div style={{padding: '8px 12px', background: '#fff3e0', borderRadius: 6, fontSize: 14, color: '#000'}}>
                          ⚠️ Batarya seviyesi düşük
                        </div>
                      )}
                      {filteredSensorData.some(d => d.temperature > 30) && (
                        <div style={{padding: '8px 12px', background: '#fff3e0', borderRadius: 6, fontSize: 14, color: '#000'}}>
                          🌡️ Sıcaklık yüksek
                        </div>
                      )}
                      {filteredSensorData.some(d => d.ph < 5.5 || d.ph > 8.0) && (
                        <div style={{padding: '8px 12px', background: '#ffebee', borderRadius: 6, fontSize: 14, color: '#000'}}>
                          🧪 pH seviyesi kritik seviyede
                        </div>
                      )}
                      {filteredSensorData.some(d => d.ph >= 5.5 && d.ph < 6.0) && (
                        <div style={{padding: '8px 12px', background: '#fff3e0', borderRadius: 6, fontSize: 14, color: '#000'}}>
                          ⚠️ pH seviyesi düşük
                        </div>
                      )}
                      {filteredSensorData.some(d => d.ph > 7.5 && d.ph <= 8.0) && (
                        <div style={{padding: '8px 12px', background: '#fff3e0', borderRadius: 6, fontSize: 14, color: '#000'}}>
                          ⚠️ pH seviyesi yüksek
                        </div>
                      )}
                    </>
                  ) : (                    <div style={{padding: '8px 12px', background: '#ffebee', borderRadius: 6, fontSize: 14, color: '#000'}}>
                      ❌ Cihaz bağlantısını kontrol edin
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Ana cihaz listesi görünümü
  return (
    <div className="devices-content">
      {/* Sadece Cihazlarım başlığı */}
      <div style={{marginBottom: 32}}>
        <h2 style={{color: '#232526', fontSize: 28, fontWeight: 700, margin: 0}}>Cihazlarım</h2>
        <p style={{color: '#666', fontSize: 16, margin: '8px 0 0 0'}}>
          Kayıtlı cihazlarınızı görüntüleyin ve yönetin
        </p>
      </div>      {loading ? (
        <LoadingSpinner />      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 24, width: '100%'}}>
          {/* Cihaz Ekle Kartı - Her zaman göster */}
          <div 
            className="modern-card" 
            style={{
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px dashed #43e97b',
              backgroundColor: '#f8fff9',
              minHeight: '280px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onClick={() => setShowAddDevice(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.backgroundColor = '#f0fff0';
              e.currentTarget.style.borderColor = '#43e97b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.backgroundColor = '#f8fff9';
              e.currentTarget.style.borderColor = '#43e97b';
            }}
          >
            <div style={{
              fontSize: 48,
              marginBottom: 16,
              color: '#43e97b'
            }}>
              ➕
            </div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: 20,
              fontWeight: 700,
              color: '#232526'
            }}>
              Yeni Cihaz Ekle
            </h3>
            <p style={{
              margin: 0,
              color: '#666',
              fontSize: 14,
              textAlign: 'center',
              lineHeight: 1.4
            }}>
              Orange Pi cihazınızın ID'sini<br/>
              girerek sisteme ekleyin
            </p>
          </div>

          {/* Eğer cihaz yoksa boş durum mesajı göster */}
          {devices.length === 0 && (
            <div className="modern-card" style={{textAlign: 'center', padding: '60px 32px'}}>
              <div style={{fontSize: 48, marginBottom: 16, opacity: 0.3}}>📡</div>
              <h3 style={{color: '#666', marginBottom: 12, fontSize: 20}}>İlk cihazınızı ekleyin</h3>
              <p style={{color: '#999', fontSize: 16, lineHeight: 1.5}}>
                Henüz sisteme kayıtlı cihazınız bulunmamaktadır.<br/>
                Soldaki "+" kartını kullanarak ilk cihazınızı ekleyebilirsiniz.
              </p>
            </div>
          )}

          {/* Mevcut Cihazlar */}
          {devices.map(device => (
            <div 
              key={device.id} 
              className="modern-card" 
              style={{
                position: 'relative', 
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onClick={() => handleDeviceClick(device)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#43e97b33';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(67, 233, 123, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
              }}
            >
              {/* Status Indicator */}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: getStatusColor(device.status),
                boxShadow: `0 0 10px ${getStatusColor(device.status)}44`
              }}></div>

              {/* Device Header */}
              <div style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16, marginBottom: 16}}>
                <h3 style={{margin: 0, fontSize: 18, fontWeight: 700, color: '#232526'}}>
                  {device.name}
                </h3>
                <p style={{margin: '4px 0 0 0', color: '#666', fontSize: 14}}>
                  {device.type}
                </p>
              </div>

              {/* Device Info */}
              <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#666', fontSize: 14}}>Durum:</span>
                  <span style={{
                    color: getStatusColor(device.status),
                    fontWeight: 600,
                    fontSize: 14,
                    textTransform: 'capitalize'
                  }}>
                    {device.status === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                  </span>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#666', fontSize: 14}}>Son Görülme:</span>
                  <span style={{color: '#999', fontSize: 14}}>
                    {formatLastSeen(device.lastSeen)}
                  </span>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#666', fontSize: 14}}>Konum:</span>
                  <span style={{color: '#666', fontSize: 14}}>
                    {device.location}
                  </span>
                </div>

                {/* Battery Level */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{color: '#666', fontSize: 14}}>Batarya:</span>
                  <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                    <div style={{
                      width: 40,
                      height: 8,
                      background: '#f0f0f0',
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${device.batteryLevel}%`,
                        height: '100%',
                        background: getBatteryColor(device.batteryLevel),
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <span style={{color: getBatteryColor(device.batteryLevel), fontSize: 14, fontWeight: 600}}>
                      {device.batteryLevel}%
                    </span>
                  </div>
                </div>

                {/* Sensors */}
                <div style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8}}>
                  <span style={{color: '#666', fontSize: 14, marginBottom: 8, display: 'block', fontWeight: '600'}}>Özellikler:</span>
                  <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                    {device.sensors.map(sensor => (
                      <div key={sensor} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                        padding: '8px 14px',
                        borderRadius: 12,
                        fontSize: 13,
                        fontWeight: '600',
                        color: '#2c3e50',
                        border: '1px solid #dee2e6',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                      }}
                      >
                        <span style={{fontSize: '16px', lineHeight: 1, marginRight: '2px'}}>
                          {getSensorIcon(sensor)}
                        </span>
                        <span style={{color: '#2c3e50', fontWeight: '700', letterSpacing: '0.5px', fontSize: '12px'}}>
                          {sensor === 'lux' ? 'LUX' :
                           sensor === 'ph' ? 'PH' :
                           sensor === 'tds' ? 'TDS' :
                           sensor === 'temperature' ? 'TEMPERATURE' :
                           sensor === 'humidity' ? 'HUMIDITY' :
                           sensor === 'camera' ? 'CAMERA' :
                           sensor === 'ai_health_prediction' ? 'HEALTH_ANALYZE' :
                           sensor.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Click hint */}
                <div style={{
                  marginTop: 16,
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38d9a9 100%)',
                  color: '#1a1a1a',
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 8,
                  textAlign: 'center',
                  opacity: device.status === 'online' ? 1 : 0.5
                }}>
                  {device.status === 'online' ? 'Detayları Görüntüle →' : 'Cihaz Çevrimdışı'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}{/* Cihaz Ekleme Modal */}
      <Modal
        isOpen={showAddDevice}
        onClose={() => {
          setShowAddDevice(false);
          setNewDeviceId('');
        }}
        title="🔗 Yeni Cihaz Ekle"
      >
        <p style={{
          margin: '0 0 24px 0',
          color: '#666',
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          Orange Pi cihazınızın benzersiz ID'sini girin.<br/>
          Bu ID cihazdan gönderilen verilerle eşleşmelidir.
        </p>

        <div style={{marginBottom: 24}}>
          <label style={{
            display: 'block',
            marginBottom: 8,
            fontSize: 14,
            fontWeight: 600,
            color: '#232526'
          }}>
            Cihaz ID'si
          </label>
          <input
            type="text"
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            placeholder="Örn: orange-pi-001"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '2px solid #f0f0f0',
              fontSize: 16,
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#43e97b'}
            onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !addingDevice) {
                addNewDevice();
              }
            }}
          />
          <small style={{
            display: 'block',
            marginTop: 8,
            color: '#999',
            fontSize: 12
          }}>
            Sadece harf, rakam ve tire (-) karakteri kullanın
          </small>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAddDevice(false);
              setNewDeviceId('');
            }}
            disabled={addingDevice}
          >
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={addNewDevice}
            disabled={!newDeviceId.trim() || addingDevice}
          >
            {addingDevice ? 'Ekleniyor...' : 'Cihaz Ekle'}
          </Button>
        </div>
      </Modal>      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={cancelDelete}
        title="⚠️ Cihazı Kaldır"
      >
        <div style={{marginBottom: 32}}>
          <p style={{
            fontSize: 16,
            lineHeight: 1.5,
            color: '#666',
            margin: 0,
            marginBottom: 16
          }}>
            <strong style={{color: '#232526'}}>
              "{selectedDevice?.name || deviceToDelete}"
            </strong> cihazını hesabınızdan kaldırmak istediğinizden emin misiniz?
          </p>
          <div style={{
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: 8,
            padding: 16,
            marginTop:  16
          }}>
            <p style={{
              fontSize: 14,
              color: '#c53030',
              margin: 0,
              fontWeight: 500
            }}>
              ⚠️ Bu işlem geri alınamaz ve cihazın tüm verileri silinecektir.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end'
        }}>
          <Button

            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              cancelDelete();
            }}
          >
            İptal
          </Button>
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              confirmDeleteDevice();
            }}
          >
            🗑️ Cihazı Kaldır
          </Button>
        </div>      </Modal>      {/* Image Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={closeImageModal}
        title="📷 Kamera Görüntüsü"
        size="large"
      >
        {selectedImage ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedImage.url}
              alt="Kamera görüntüsü"
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
            <p style={{
              marginTop: 16,
              fontSize: 14,
              color: '#666',
              fontStyle: 'italic'
            }}>
              📅 {selectedImage.timestamp ? new Date(selectedImage.timestamp).toLocaleString('tr-TR') : 'Tarih bilgisi yok'}
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Görüntü yükleniyor...</p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Devices;
