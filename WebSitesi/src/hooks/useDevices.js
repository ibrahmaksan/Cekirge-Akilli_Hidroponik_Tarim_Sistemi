import { useState, useEffect } from 'react';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { db } from '../firebase';

export const useDevices = (user) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setDevices([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const devicesRef = ref(db, `users/${user.uid}/devices`);
    const sensorDataRef = ref(db, `sensorData/${user.uid}`);

    const deviceUnsub = onValue(devicesRef, (deviceSnap) => {
      const deviceData = deviceSnap.val();
      
      if (!deviceData) {
        setDevices([]);
        setLoading(false);
        return;
      }

      const sensorUnsub = onValue(query(sensorDataRef, limitToLast(500)), (sensorSnap) => {
        setLoading(false);
        
        const sensorData = sensorSnap.val();
        const allSensorData = sensorData ? Object.values(sensorData) : [];          const deviceList = Object.entries(deviceData).map(([deviceId, device]) => {
          console.log(`=== useDevices: Cihaz ${device.name || deviceId} ===`);
          console.log('Cihaz sensörleri (Firebase):', device.sensors);
          
          const deviceSensorData = allSensorData
            .filter(data => data.deviceId === deviceId)
            .sort((a, b) => (a.ts || 0) - (b.ts || 0)) // Eski veriler solda, yeni veriler sağda
            .map(data => ({
              ...data,
              // pH değerini normalize et
              ph: data.ph || data.ph_v,
              // TDS değerini normalize et  
              tds: data.tds || data.tds_v
            }));          // Şimdilik tüm veriyi gösterelim - 1 saatlik filtreyi geçici olarak kapatıyoruz
          // const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 saat önce
          // const recentSensorData = deviceSensorData.filter(data => data.ts >= oneHourAgo);
          
          console.log(`📊 ${device.name || deviceId} - Toplam veri: ${deviceSensorData.length}`);
          console.log(`🎯 Kullanılacak veri sayısı: ${deviceSensorData.length}`);
          if (deviceSensorData.length > 0) {
            const firstData = deviceSensorData[0];
            const lastData = deviceSensorData[deviceSensorData.length - 1];
            console.log(`🕒 İlk veri: ${new Date(firstData.ts).toLocaleString('tr-TR')}`);
            console.log(`🕒 Son veri: ${new Date(lastData.ts).toLocaleString('tr-TR')}`);
          }
          
          const deviceInfo = {
            id: deviceId,
            name: device.name || `Cihaz ${deviceId}`,
            type: device.type || 'Hidroponik Sensör',
            status: device.status || 'offline',
            lastSeen: device.lastSeen || Date.now(),
            location: device.location || 'Belirtilmemiş',
            batteryLevel: device.batteryLevel || 0,
            sensors: device.sensors || ['lux', 'ph', 'tds'],
            sensorData: deviceSensorData // Tüm veriyi göster
          };
          
          console.log('İşlenmiş cihaz sensörleri:', deviceInfo.sensors);
          console.log('Sensör verisi sayısı:', deviceSensorData.length);
          
          return deviceInfo;
        });

        setDevices(deviceList);
      });

      return () => sensorUnsub();
    });

    return () => deviceUnsub();
  }, [user]);

  return { devices, loading };
};
