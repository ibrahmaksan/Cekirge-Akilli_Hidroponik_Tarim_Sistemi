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
- [Sensör Değer Aralıkları](#-sensör-değer-aralıkları)
- [Özelleştirme](#-özelleştirme)
- [Sorun Giderme](#-sorun-giderme)

## ✨ Özellikler

### 🔐 Kimlik Doğrulama
- **Facebook tarzı modern login ekranı**
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
- Batarya seviyesi izleme
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
- **Health Analyze**: AI destekli sağlık analizi

## 🛠️ Teknolojiler

- **Frontend**: React 18, Vite
- **Routing**: React Router v6
- **Veritabanı**: Firebase Realtime Database
- **Kimlik Doğrulama**: Firebase Authentication
- **Grafik**: Recharts
- **Stil**: Inline CSS (Modern Material Design)
- **İkonlar**: Emoji ve Custom SVG
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

## 🎯 Kullanım

### Giriş Yapma
1. Email ve şifre ile giriş yapın
2. Yeni kullanıcılar otomatik olarak kayıt olabilir

### Cihaz Ekleme
1. **Cihazlarım** sayfasına gidin
2. **"+"** kartını tıklayın
3. Orange Pi cihazının ID'sini girin (örn: `orange-pi-001`)
4. **"Cihaz Ekle"** butonunu tıklayın

### Veri İzleme
1. Dashboard'da genel görünümü inceleyin
2. Cihaz detayları için cihaz kartını tıklayın
3. Zaman aralığını seçerek filtreleme yapın
4. Grafiklerde trend analizi yapın

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

## 📊 Sensör Değer Aralıkları

| Sensör | Minimum | Maximum | Optimal Min | Optimal Max | Birim |
|--------|---------|---------|-------------|-------------|-------|
| LUX | 0 | 30,000 | 10,000 | 20,000 | lux |
| pH | 0 | 14 | 5.5 | 6.5 | pH |
| TDS | 0 | 1,500 | 400 | 800 | ppm |
| Sıcaklık | 0 | 50 | 20 | 28 | °C |
| Nem | 0 | 100 | 50 | 70 | % |

### Renk Kodlaması
- 🟢 **Yeşil (İdeal)**: Değer optimal aralıkta
- 🟡 **Sarı (Normal)**: Değer kabul edilebilir aralıkta  
- 🔴 **Kırmızı (Problem)**: Değer kritik seviyede

## 🎨 Özelleştirme

### Tema Renkleri
Ana renk paleti `App.css` dosyasında tanımlanmıştır:

```css
:root {
  --primary-color: #43e97b;
  --secondary-color: #38d9a9;
  --danger-color: #ff6b6b;
  --warning-color: #ffd93d;
  --text-primary: #2c3e50;
  --text-secondary: #666;
}
```

### Gauge Chart Özelleştirme
`src/components/common/GaugeChart.jsx` dosyasından renk ve aralık ayarları değiştirilebilir.

### Sensör İkonları
`src/utils/sensorUtils.js` dosyasından sensör ikonları güncellenebilir:

```javascript
export const sensorIcons = {
  lux: '💡',
  ph: '🧪',
  tds: '💧',
  temperature: '🌡️',
  humidity: '💨',
  camera: '📷',
  ai_health_prediction: '🤖'
};
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

#### 1. Firebase Bağlantı Hatası
```bash
# Kontrol edin:
- Firebase config dosyası doğru mu?
- İnternet bağlantısı var mı?
- Firebase projesinde Authentication açık mı?
```

#### 2. Cihaz Verisi Gözükmüyor
```bash
# Kontrol edin:
- Cihaz ID'si doğru mu?
- Cihaz online durumda mı?
- Veri formatı JSON yapısına uygun mu?
- Kullanıcı UID'si doğru mu?
```

#### 3. Grafik Gösterilmiyor
```bash
# Kontrol edin:
- Recharts kütüphanesi yüklü mü?
- Veri dizisi boş mu?
- Zaman aralığı filtresi çok kısıtlayıcı mı?
```

#### 4. Görüntü Yüklenmiyor
```bash
# Kontrol edin:
- Base64 format doğru mu?
- Firebase Storage limitleri aşıldı mı?
- Görüntü boyutu çok büyük mü? (>128KB)
```

### Geliştirici Araçları

#### Debug Modu
```javascript
// Console log'ları aktifleştirin
localStorage.setItem('debug', 'true');

// Firebase Realtime Database debug
window.firebase = firebase;
```

#### Veri İzleme
```javascript
// Firebase Realtime Database console'da:
firebase.database().ref().on('value', (snapshot) => {
  console.log('Database data:', snapshot.val());
});
```

## 📦 Build ve Deploy

### Production Build
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## 🚀 GitHub'a Yükleme

### 1. Repository Oluşturma
```bash
# GitHub'da yeni repository oluşturun
# Sonra local projenizi bağlayın:

git init
git add .
git commit -m "Initial commit: Cekirge React Dashboard"
git branch -M main
git remote add origin https://github.com/yourusername/cekirge-react.git
git push -u origin main
```

### 2. Environment Variables Kurulumu
**Önemli:** `.env` dosyası GitHub'a yüklenmez (güvenlik için).

Yeni bilgisayarlarda proje kurulumu için:
```bash
# 1. Repoyu klonlayın
git clone https://github.com/yourusername/cekirge-react.git
cd cekirge-react

# 2. Bağımlılıkları yükleyin
npm install

# 3. .env dosyasını oluşturun
cp .env.example .env

# 4. .env dosyasını düzenleyip gerçek Firebase anahtarlarınızı yazın
# 5. Uygulamayı başlatın
npm run dev
```

### 3. GitHub'a Yüklenmesi Gereken Dosyalar
✅ **Dahil edilecek:**
- `src/` (tüm kaynak kodlar)
- `public/` (statik dosyalar)
- `package.json` & `package-lock.json`
- `vite.config.js`, `eslint.config.js`
- `README.md`, `.gitignore`
- `.env.example` (örnek env dosyası)

❌ **Hariç tutulacak:**
- `node_modules/` (otomatik yüklenir)
- `dist/`, `build/` (build çıktıları)
- `.env` (gizli anahtarlar)
- `.vscode/`, `.idea/` (IDE ayarları)

### 4. Firebase Güvenlik Kuralları
Production'da Firebase güvenlik kurallarınızı da güncelleyin:

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

## 📞 Destek

Sorunlarınız için:

1. **GitHub Issues** açın
2. **Discord**: [Cekirge Community]
3. **Email**: support@cekirge.com
4. **Dokümantasyon**: [docs.cekirge.com]

## 📄 Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

---

**🌱 Cekirge React ile modern hidroponik tarım deneyimi yaşayın!**

Made with ❤️ by Cekirge Team
