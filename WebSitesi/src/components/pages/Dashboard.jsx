import React, { useEffect, useState } from 'react';
import ImageSlider from '../ImageSlider';
import SensorBox from '../common/SensorBox';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quickStats, setQuickStats] = useState({
    totalDevices: 3,
    onlineDevices: 2,
    totalSensors: 15,
    lastUpdate: '2 dakika önce'
  });
  const [latestSensorData, setLatestSensorData] = useState([]);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Firebase'den istatistikleri çek
  useEffect(() => {
    if (!user) return;

    const devicesRef = ref(db, `users/${user.uid}/devices`);
    const sensorDataRef = ref(db, `sensorData/${user.uid}`);    // Cihazları dinle
    const deviceUnsub = onValue(devicesRef, (snapshot) => {
      const devices = snapshot.val();
      const deviceCount = devices ? Object.keys(devices).length : 0;
      const onlineCount = devices ? Object.values(devices).filter(d => d.status === 'online').length : 0;        // Toplam benzersiz sensör türü sayısını hesapla
      const allSensorTypes = new Set();
      if (devices) {
        console.log('=== CİHAZ ve SENSÖR ANALİZİ ===');
        Object.entries(devices).forEach(([deviceId, device]) => {
          console.log(`Cihaz: ${device.name || deviceId}`);
          console.log(`  - sensors array:`, device.sensors);
          
          if (device.sensors && Array.isArray(device.sensors)) {
            device.sensors.forEach(sensor => {
              console.log(`    Sensör eklendi: ${sensor}`);
              allSensorTypes.add(sensor);
            });
          } else {
            console.log(`    Bu cihazda sensors array bulunamadı veya array değil`);
          }
        });
      }
      const totalSensorTypes = allSensorTypes.size;
      
      // Debug: Hangi sensör türleri bulundu
      console.log('=== SONUÇ ===');
      console.log('Bulunan sensör türleri:', Array.from(allSensorTypes));
      console.log('Toplam sensör türü sayısı:', totalSensorTypes);
      console.log('=============');
      
      // Son güncelleme zamanını bul
      const lastUpdate = devices ? Math.max(...Object.values(devices).map(d => d.lastSeen || 0)) : 0;
      const lastUpdateText = lastUpdate ? formatLastUpdate(lastUpdate) : 'Henüz güncelleme yok';

      setQuickStats(prev => ({
        ...prev,
        totalDevices: deviceCount,
        onlineDevices: onlineCount,
        totalSensors: totalSensorTypes,
        lastUpdate: lastUpdateText
      }));
    });    // Sensör verilerini dinle (toplam sensör sayısı için)
    const sensorUnsub = onValue(query(sensorDataRef, limitToLast(10)), (snapshot) => {
      const sensorData = snapshot.val();
      
      // Son sensör verilerini al
      const latestData = sensorData ? Object.values(sensorData).slice(-3) : [];
      setLatestSensorData(latestData);
      
      // Gerçek sensör verilerinden benzersiz sensör tiplerini hesapla
      const realSensorTypes = new Set();
      if (sensorData) {
        console.log('=== GERÇEK SENSÖR VERİLERİNDEN ANALİZ ===');
        Object.values(sensorData).forEach((data, index) => {
          console.log(`Sensör verisi ${index + 1}:`, data);
          
          // Tüm veri anahtarlarını kontrol et (timestamp ve deviceId hariç)
          Object.keys(data).forEach(key => {
            if (key !== 'ts' && key !== 'deviceId' && key !== 'timestamp') {
              console.log(`  Sensör tipi bulundu: ${key} (değer: ${data[key]})`);
              realSensorTypes.add(key);
            }
          });
        });
        
        console.log('Gerçek sensör verilerinden bulunan tipler:', Array.from(realSensorTypes));
        console.log('Gerçek sensör verilerinden toplam tip sayısı:', realSensorTypes.size);
      }
    });

    return () => {
      deviceUnsub();
      sensorUnsub();
    };
  }, [user]);

  const formatLastUpdate = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return 'Uzun zaman önce';
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '🌅 Günaydın';
    if (hour < 17) return '☀️ İyi günler';
    if (hour < 22) return '🌆 İyi akşamlar';
    return '🌙 İyi geceler';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const quickActions = [
    {
      title: 'Cihazlarım',
      icon: '📱',
      description: 'Cihazlarını görüntüle ve yönet',
      color: '#667eea',
      action: () => navigate('/devices')
    },
    {
      title: 'Akıllı Tavsiyeler',
      icon: '💡',
      description: 'Sensör verilerine dayalı öneriler',
      color: '#764ba2',
      action: () => navigate('/advice')
    },
    {
      title: 'Profil Ayarları',
      icon: '⚙️',
      description: 'Hesap bilgilerini düzenle',
      color: '#43e97b',
      action: () => navigate('/profile')
    },
    {
      title: 'İletişim',
      icon: '📞',
      description: 'Destek ve yardım al',
      color: '#74b9ff',
      action: () => navigate('/contact')
    }
  ];

  return (
    <ImageSlider>
      <div className="home-hero" style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Welcome Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '50px 40px',
          textAlign: 'center',
          marginBottom: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '800px',
          width: '100%'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
            {getGreeting().split(' ')[0]}
          </div>
          
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 15px 0',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            {getGreeting()}, {user?.email?.split('@')[0] || 'Kullanıcı'}!
          </h1>
          
          <p style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.2rem',
            fontWeight: '400',
            marginBottom: '25px',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 25px auto'
          }}>
            Çekirge IoT platformuna hoşgeldiniz. Akıllı sensörlerinizi yönetin ve verilerinizi analiz edin.
          </p>

          {/* Date & Time */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '30px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '15px 25px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '5px' }}>
                📅 Bugün
              </div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                {formatDate(currentTime)}
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '15px 25px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginBottom: '5px' }}>
                🕐 Saat
              </div>
              <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>
                {formatTime(currentTime)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'rgba(103, 126, 234, 0.2)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(103, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📱</div>
              <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>
                {quickStats.totalDevices}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Toplam Cihaz
              </div>
            </div>

            <div style={{
              background: 'rgba(67, 233, 123, 0.2)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(67, 233, 123, 0.3)'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🟢</div>
              <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>
                {quickStats.onlineDevices}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Aktif Cihaz
              </div>
            </div>

            <div style={{
              background: 'rgba(116, 185, 255, 0.2)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(116, 185, 255, 0.3)'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📊</div>
              <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>
                {quickStats.totalSensors}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Toplam Sensör
              </div>
            </div>

            <div style={{
              background: 'rgba(243, 156, 18, 0.2)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(243, 156, 18, 0.3)'
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔄</div>
              <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>
                {quickStats.lastUpdate}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>
                Son Güncelleme
              </div>
            </div>
          </div>
        </div>

        {/* Son Sensör Verileri */}
        {latestSensorData.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: '1000px',
            width: '100%',
            marginBottom: '40px'
          }}>
            <h2 style={{
              color: '#fff',
              fontSize: '1.8rem',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '30px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
            }}>
              📊 Son Sensör Verileri
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {latestSensorData.map((sensorItem, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <SensorBox item={sensorItem} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '1000px',
          width: '100%'
        }}>
          <h2 style={{
            color: '#fff',
            fontSize: '1.8rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '30px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
          }}>
            🚀 Hızlı Erişim
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                style={{
                  background: `linear-gradient(135deg, ${action.color}CC, ${action.color}99)`,
                  border: 'none',
                  borderRadius: '20px',
                  padding: '25px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-5px) scale(1.02)';
                  e.target.style.boxShadow = `0 10px 30px ${action.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                  {action.icon}
                </div>
                <h3 style={{
                  color: '#fff',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  margin: '0 0 8px 0'
                }}>
                  {action.title}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ImageSlider>
  );
}

export default Dashboard;
