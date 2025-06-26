# 🌱 Cekirge React - Hidroponik Sera İzleme Sistemi

Modern ve kullanıcı dostu arayüz ile hidroponik sera sistemlerinizi gerçek zamanlı olarak izleyin ve yönetin.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [Proje Yapısı](#-proje-yapısı)
- [Firebase Konfigürasyonu](#-firebase-konfigürasyonu)
- [Cihaz Entegrasyonu](#-cihaz-entegrasyonu)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- **Modern login ekranı**
- Firebase Authentication ile güvenli giriş
- Kullanıcı profil yönetimi
- Otomatik oturum yönetimi

### 📊 Dashboard
- **Gerçek zamanlı sensör verileri**
- Interaktif gauge chart'lar
- Akıllı renk kodlaması (İdeal/Normal/Problem)
- Son sensör verilerinin görüntülenmesi
- Hızlı erişim menüleri

### 🔧 Cihaz Yönetimi
- **Cihaz ekleme/kaldırma**
- Cihaz durumu takibi (Online/Offline)
- Sensör özelliklerinin görüntülenmesi

### 📈 Veri Analizi
- **Zaman serisi grafikleri** (Recharts)
- Filtrelenebilir zaman aralıkları (5dk, 1s, 1g, 1h, 1a)
- Ortalama değer hesaplamaları
- Durum özeti ve öneriler

### 📷 Görsel İzleme
- Kamera görüntülerinin görüntülenmesi
- Modal ile büyütülmüş görüntü inceleme
- Tarih damgası ile organize edilmiş görseller

### 🌡️ Sensör İzleme
- **LUX (Işık)**: 0-30,000 lux (Optimal: 10,000-20,000)
- **pH**: 0-14 (Optimal: 5.5-6.5)
- **TDS**: 0-1,500 ppm (Optimal: 400-800)
- **Sıcaklık**: 0-50°C (Optimal: 20-28°C)
- **Nem**: 0-100% (Optimal: 50-70%)
- **Kamera**: Gerçek zamanlı görüntü
- **Health Analyze**: Karşılaştırmalı sağlık analizi

## 🛠️ Teknolojiler

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Veritabanı**: Firebase Realtime Database
- **Kimlik Doğrulama**: Firebase Authentication
- **Grafik**: Recharts, CSS
- **State Management**: React Hooks (useState, useEffect)

## 🚀 Kurulum

### 1. Gereksinimler
```bash
Node.js 18+ (önerilen)
npm veya yarn
```

### 2. Projeyi Klonlayın
```bash
git clone <repository-url>
cd cekirge-react
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Firebase Konfigürasyonu
`src/firebase.js` dosyasını düzenleyin:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
```

### 5. Uygulamayı Başlatın
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.


## 📁 Proje Yapısı

```
cekirge-react/
├── public/
│   ├── vite.svg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/           # Ortak bileşenler
│   │   │   ├── Button.jsx
│   │   │   ├── GaugeChart.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── SectionTitle.jsx
│   │   │   ├── SensorBox.jsx
│   │   │   └── SensorIcons.jsx
│   │   ├── layout/           # Layout bileşenleri
│   │   │   ├── HamburgerMenu.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/            # Sayfa bileşenleri
│   │   │   ├── Advice.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Devices.jsx
│   │   │   └── Profile.jsx
│   │   ├── ImageSlider.jsx
│   │   ├── Login.jsx
│   │   └── Sidebar.jsx
│   ├── hooks/
│   │   ├── useAuth.js        # Kimlik doğrulama hook'u
│   │   └── useDevices.js     # Cihaz yönetimi hook'u
│   ├── utils/
│   │   ├── deviceUtils.js    # Cihaz yardımcı fonksiyonları
│   │   └── sensorUtils.js    # Sensör yardımcı fonksiyonları
│   ├── assets/
│   │   ├── cekirge-logo.jpg
│   │   ├── hidro-1.jpg
│   │   ├── hidro-2.jpg
│   │   └── react.svg
│   ├── firebase.js          # Firebase konfigürasyonu
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Firebase Konfigürasyonu

### Database Yapısı
```
cekirge-firebase/
├── users/
│   └── {userId}/
│       └── devices/
│           └── {deviceId}/
│               ├── name: "Orange Pi Sera Sensoru"
│               ├── type: "Hidroponik Sensor + AI Analiz"
│               ├── status: "online/offline"
│               ├── location: "Sera A - Bolum 1"
│               ├── batteryLevel: 100
│               ├── lastSeen: timestamp
│               └── sensors: ["lux", "ph", "tds", ...]
└── sensorData/
    └── {userId}/
        └── {timestamp}/
            ├── deviceId: "orange-pi-001"
            ├── ts: timestamp
            ├── lux: 15000
            ├── ph_v: 6.2
            ├── tds_v: 600
            ├── temperature: 24
            ├── humidity: 65
            └── image: "base64_string"
```

### Güvenlik Kuralları
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "sensorData": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 🤖 Cihaz Entegrasyonu

### Orange Pi Python Kodu ile Entegrasyon
Cihazınızın aşağıdaki formatta veri göndermesi gerekir:

```json
{
  "uid": "USER_UID",
  "deviceId": "orange-pi-001",
  "ts": 1703123456789,
  "lux": 15000,
  "ph_v": 6.2,
  "tds_v": 600,
  "temperature": 24,
  "humidity": 65,
  "image": "base64_encoded_image",
  "ai_analysis": {
    "health_prediction": "Sağlıklı",
    "confidence_percent": 95.5,
    "suggestions": ["Tüm parametreler optimal aralıkta"]
  }
}
```

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

Made with ❤️ by Cekirge Team, Ibrahim AKSAN
