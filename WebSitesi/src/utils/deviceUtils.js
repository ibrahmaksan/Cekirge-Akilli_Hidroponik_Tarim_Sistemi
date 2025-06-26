export const formatLastSeen = (timestamp) => {
  if (!timestamp) return 'Bilinmiyor';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  return `${days} gün önce`;
};

export const getBatteryColor = (level) => {
  if (level > 50) return '#43e97b';
  if (level > 20) return '#ff9800';
  return '#f44336';
};

export const getStatusColor = (status) => {
  return status === 'online' ? '#43e97b' : '#f44336';
};

export const validateDeviceId = (deviceId) => {
  const regex = /^[a-zA-Z0-9\-]+$/;
  return regex.test(deviceId) && deviceId.length >= 3 && deviceId.length <= 20;
};
