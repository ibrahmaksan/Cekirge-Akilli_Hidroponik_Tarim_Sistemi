# Orange pi 5 plus üzerinde çalıştırılan kodlar

Bu proje, Orange Pi 5 Plus üzerinde çalışan bir sera izleme sistemi olup, çeşitli sensörlerden veri toplayarak AWS IoT Core'a gönderir ve AI tabanlı bitki sağlık analizi yapar.

## Özellikler

- **Sensör İzleme**: LUX, pH, TDS, sıcaklık, nem sensörlerinden veri toplama
- **AI Analizi**: Kural tabanlı bitki sağlık değerlendirme sistemi
- **Görüntü İşleme**: YOLO modeliyle bitki hastalık tespiti
- **AWS IoT Entegrasyonu**: Real-time veri gönderimi
- **EMA Filtreleme**: Sensör verilerinin optimize edilmiş filtrelenmesi

## Sistem Gereksinimleri

### Donanım
- Orange Pi 5 Plus
- BH1750 LUX sensörü (I2C)
- DHT22 sıcaklık/nem sensörü (Serial)
- E201C pH sensörü (ADS1115 üzerinden)
- Keyestudio TDS sensörü (ADS1115 üzerinden)
- ADS1115 ADC modülü
- USB kamera
- MicroSD kart (en az 32GB)

### Yazılım
- Ubuntu/Debian tabanlı işletim sistemi (Orange Pi 5 Plus için)
- Python 3.8 veya üzeri
- OpenCV
- RKNN Lite runtime

## Kurulum Adımları

### 1. Sistem Güncellemesi
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Python Bağımlılıklarının Kurulumu
```bash
# Temel Python paketleri
sudo apt install python3-pip python3-dev python3-venv -y

# Sistem kütüphaneleri
sudo apt install build-essential cmake pkg-config -y
sudo apt install libjpeg-dev libtiff5-dev libjasper-dev libpng-dev -y
sudo apt install libavcodec-dev libavformat-dev libswscale-dev libv4l-dev -y
sudo apt install libxvidcore-dev libx264-dev -y
sudo apt install libfontconfig1-dev libcairo2-dev -y
sudo apt install libgdk-pixbuf2.0-dev libpango1.0-dev -y
sudo apt install libgtk2.0-dev libgtk-3-dev -y
sudo apt install libatlas-base-dev gfortran -y
```

### 3. Python Sanal Ortamının Oluşturulması
```bash
cd /path/to/project
python3 -m venv venv
source venv/bin/activate
```

### 4. Python Paketlerinin Kurulumu
```bash
pip install --upgrade pip

# AWS IoT SDK
pip install awsiotsdk

# Sensör kütüphaneleri
pip install python-periphery

# OpenCV
pip install opencv-python

# Diğer gerekli paketler
pip install numpy
pip install pandas
pip install joblib
```

### 5. RKNN Lite Kurulumu (Orange Pi 5 Plus için)
```bash
# RKNN Lite wheel dosyasını indirin (Orange Pi resmi sitesinden)
# Kurulum:
pip install rknnlite-1.5.0-cp310-cp310-linux_aarch64.whl
```

### 6. I2C ve Serial Ayarları

#### I2C Etkinleştirme
```bash
# /boot/config.txt dosyasına ekleyin:
sudo nano /boot/config.txt
# Aşağıdaki satırı ekleyin:
# dtparam=i2c_arm=on

# I2C araçlarını kurun
sudo apt install i2c-tools -y

# I2C cihazlarını kontrol edin
sudo i2cdetect -y 2
```

#### Serial Port Ayarları
```bash
# Serial port iznini verin
sudo chmod 666 /dev/ttyS6

# Kullanıcıyı dialout grubuna ekleyin
sudo usermod -a -G dialout $USER
```

### 7. AWS IoT Certificate Dosyalarının Yapılandırılması

Proje klasöründe aşağıdaki dosyaların bulunması gerekir:
```
root-CA.crt              # Amazon Root CA sertifikası
OrangePi5_001.cert.pem   # Cihaz sertifikası
OrangePi5_001.private.key # Cihaz özel anahtarı
```

AWS IoT Core'dan bu dosyaları indirip proje klasörüne yerleştirin.

### 8. YOLO Model Dosyası
```bash
# leaf6.rknn dosyasının proje klasöründe bulunduğundan emin olun
ls -la leaf6.rknn
```

## Proje Dosya Yapısı
```
rockchip/
├── main_final.py           # Ana çalıştırma dosyası
├── dht22.py               # DHT22 sensör kütüphanesi
├── bh1750.py              # BH1750 LUX sensör kütüphanesi
├── ads.py                 # ADS1115 ADC kütüphanesi (pH/TDS)
├── single_shot_detection.py # YOLO detection kütüphanesi
├── leaf6.rknn             # YOLO model dosyası
├── root-CA.crt            # AWS Root CA
├── OrangePi5_001.cert.pem # AWS IoT cihaz sertifikası
├── OrangePi5_001.private.key # AWS IoT özel anahtar
```

## Çalıştırma

### 1. Sanal Ortamı Aktifleştirin
```bash
cd /path/to/project
source venv/bin/activate
```

### 2. Uygulamayı Başlatın
```bash
python3 main_final.py
```

## Sensör Bağlantıları

### I2C Bağlantıları (Pin 3,5 - I2C2)
- **BH1750**: SDA → Pin 3, SCL → Pin 5, VCC → 3.3V, GND → GND
- **ADS1115**: SDA → Pin 3, SCL → Pin 5, VCC → 3.3V, GND → GND

### ADS1115 Analog Bağlantıları
- **TDS Sensör**: A0 kanalı
- **pH Sensör**: A3 kanalı

### Serial Bağlantı
- **DHT22**: /dev/ttyS6 9600 baud rate)

### USB
- **Kamera**: USB portuna bağlayın

## AWS IoT Core Yapılandırması

### 1. Thing Oluşturma
```json
{
  "thingName": "orange-pi-002",
  "thingTypeName": "SeraSensoru",
  "attributes": {
    "location": "Sera A - Bolum 1",
    "deviceType": "Hidroponik Sensor + AI Analiz"
  }
}
```

### 2. Topic Subscription
```
sdk/test/python
```

### 3. IAM Policy Örneği
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect",
        "iot:Publish",
        "iot:Subscribe",
        "iot:Receive"
      ],
      "Resource": "*"
    }
  ]
}
```

## Veri Formatı

### Sensör Verisi
```json
{
  "uid": "SyRyUmS8SvdkZi97V0fZk5y1xHg2",
  "deviceId": "orange-pi-002",
  "ts": 1640995200000,
  "lux": 1500.5,
  "ph_v": 6.2,
  "tds_v": 650.0,
  "temperature": 24.5,
  "humidity": 65.0,
  "data_source": "EMA_filtered",
  "ai_analysis": {
    "health_prediction": "Sağlıklı",
    "confidence_percent": 85.5,
    "risk_level": "Düşük",
    "suggestions": ["Tüm parametreler optimal aralıkta"],
    "warnings": []
  },
  "image": "base64_encoded_image_data"
}
```
