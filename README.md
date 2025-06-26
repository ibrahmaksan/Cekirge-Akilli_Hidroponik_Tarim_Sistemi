# ÇEKİRGE: Görüntü ve Sensör Tabanlı Akıllı Topraksız Tarım

Topraksız tarım (hydroponics) teknolojisinin otomasyonunu artırmak amacıyla geliştirilen bu proje; makine öğrenmesi, görüntü işleme ve IoT teknolojilerini bir araya getirerek akıllı bir tarım sisteminin temellerini atmayı hedeflemektedir.
## Not: Kod kısmı için Websitesi ve Rockchip klasörlerini kontrol ediniz.

## 🚀 Proje Amacı

- Bitki sağlığını görüntüler aracılığıyla analiz ederek hastalıkları erken tespit etmek.
- Sensör verilerini analiz ederek ortam koşullarını değerlendirmek.
- Tüm bu süreçleri gerçek zamanlı olarak buluta aktarmak ve kullanıcıya sunmak.

## 🎯 Hedefler

- İnsan faktörünü azaltmak, süreci daha öngörülebilir ve kontrol edilebilir hale getirmek.
- Enerji verimliliği yüksek bir sistem tasarlamak.
- Gerçek zamanlı uyarı mekanizmaları kurmak.

## 🧭 Proje Yol Haritası

### Aşama 2: Sensör ve Donanım Entegrasyonu
- **Sensörler**: EC, pH, DHT22, ışık sensörü, su seviyesi sensörü.
- **Veri Toplama**: Python ile okunarak lokal ve bulut veritabanına gönderilir.
- **IoT İletişimi**: MQTT protokolü ile Firebase veya AWS IoT’ye veri aktarımı.

### Aşama 4: Görüntü İşleme ile Bitki Sağlığı
- **Veri Toplama**: Kamera ile hasta/sağlıklı yaprak görüntüleri alınır.
- **Model Geliştirme**: CNN tabanlı sağlık tespiti modeli, transfer learning ile eğitilir.
- **Optimizasyon**: RKNN Toolkit ile Rockchip çipine uygun hale getirilir.

### Aşama 5: Sistem Entegrasyonu
- **Tüm Bileşenlerin Birleştirilmesi**: Sağlık analizi + görüntü analizi birlikte çalışır.
- **Arayüz**: Web dashboard

## 🧩 Teknolojiler

| Bileşen            | Kullanılan Teknoloji                |
|--------------------|-------------------------------------|
| Görüntü İşleme     | OpenCV, CNN, Transfer Learning, Yolov8    |
| Donanım            | Rockchip RK3588, DHT22 / Keyestudio TDSMeter / ADS1115 / E201-C Ph sensörü / Logitech C270 Kamera / ESP32 CAM |
| Bulut              | Firebase, AWS IoT                   |
| Veri Aktarımı      | MQTT                          |

## 📄 Lisans

Bu proje [MIT Lisansı](https://opensource.org/licenses/MIT) ile lisanslanmıştır.
