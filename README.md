# ÇEKİRGE: Görüntü ve Sensör Tabanlı Akıllı Topraksız Tarım

Topraksız tarım (hydroponics) teknolojisinin otomasyonunu artırmak amacıyla geliştirilen bu proje; makine öğrenmesi, görüntü işleme ve IoT teknolojilerini bir araya getirerek akıllı bir tarım sisteminin temellerini atmayı hedeflemektedir.
## Not: Kod kısmı için Websitesi ve Rockchip klasörlerini kontrol ediniz.

## 🚀 Proje Amacı

- EC (Elektriksel İletkenlik) ve pH gibi hayati parametreleri izleyip gelecekteki değerlerini tahmin etmek.
- Bitki sağlığını görüntüler aracılığıyla analiz ederek hastalıkları erken tespit etmek.
- Sensör verilerini analiz ederek ortam koşullarını değerlendirmek.
- Tüm bu süreçleri gerçek zamanlı olarak buluta aktarmak ve kullanıcıya sunmak.

## 🎯 Hedefler

- Akıllı besin yönetimiyle verimi artırmak.
- İnsan faktörünü azaltmak, süreci daha öngörülebilir ve kontrol edilebilir hale getirmek.
- Enerji verimliliği yüksek bir sistem tasarlamak.
- Gerçek zamanlı uyarı mekanizmaları kurmak.

## 🧭 Proje Yol Haritası

### Aşama 2: Sensör ve Donanım Entegrasyonu
- **Sensörler**: EC, pH, DHT22, ışık sensörü, su seviyesi sensörü.
- **Veri Toplama**: Python veya C++ ile okunarak lokal veya bulut veritabanına gönderilir.
- **IoT İletişimi**: MQTT/HTTP protokolleri ile Firebase veya AWS IoT’ye veri aktarımı.

### Aşama 3: Makine Öğrenmesi Modeli
- **Veri Hazırlığı**: EC ve pH'ı etkileyen verilerin temizlenmesi.
- **Model Eğitimi**: Random Forest / DNN modelleri, Rockchip RK3588’e uygun şekilde optimize edilir.
- **Doğrulama**: Veri artırımıyla model performansı geliştirilir.

### Aşama 4: Görüntü İşleme ile Bitki Sağlığı
- **Veri Toplama**: Kamera ile hasta/sağlıklı yaprak görüntüleri alınır.
- **Model Geliştirme**: CNN tabanlı sağlık tespiti modeli, transfer learning ile eğitilir.
- **Optimizasyon**: RKNN Toolkit ile Rockchip çipine uygun hale getirilir.

### Aşama 5: Sistem Entegrasyonu
- **Tüm Bileşenlerin Birleştirilmesi**: EC/pH tahmini + görüntü analizi birlikte çalışır.
- **Arayüz**: Web dashboard veya Telegram bot ile kullanıcıya veri sunumu.

### Aşama 6: Optimizasyon & Raporlama
- Model ve sistem performansının artırılması.
- Enerji tüketiminin düşürülmesi.
- Sonuçların raporlanması, gerekiyorsa akademik yayın haline getirilmesi.

## 🧩 Teknolojiler

| Bileşen            | Kullanılan Teknoloji                |
|--------------------|-------------------------------------|
| Görüntü İşleme     | OpenCV, CNN, Transfer Learning       |
| Makine Öğrenmesi   | Random Forest, DNN                  |
| Donanım            | Rockchip RK3588, EC/pH/DHT22/Sıcaklık/Nem sensörleri |
| Bulut              | Firebase, AWS IoT                   |
| Veri Aktarımı      | MQTT, HTTP                          |

## 👥 Katkı Sağlamak

Katkıda bulunmak istiyorsan:

1. Bu repoyu **fork**'la.
2. Yeni bir **branch** aç.
3. Geliştirmelerini yap.
4. Pull Request gönder.

## 📄 Lisans

Bu proje [MIT Lisansı](https://opensource.org/licenses/MIT) ile lisanslanmıştır.
