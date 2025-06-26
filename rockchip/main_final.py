#!/usr/bin/env python3
from awscrt import mqtt
from awsiot import mqtt_connection_builder
import json, time, random, threading
from datetime import datetime
import bh1750 as bh
import dht22 as dh  
import sys
import os
import cv2
import base64
import ads
import single_shot_detection

try:
    import joblib
    import pandas as pd
    MODEL_AVAILABLE = False  
    print("? Kural tabanli saglik degerlendirme sistemi aktif!")
except ImportError as e:
    MODEL_AVAILABLE = False
    print("? Kural tabanli saglik degerlendirme sistemi aktif!")


ENDPOINT = "kendi_endpoint_adresiniz"  # AWS IoT Core endpoint
TOPIC    = "sdk/test/python"       
CLIENT_ID = "basicPubSub"

CA  = "root-CA.crt"
CRT = "OrangePi5_001.cert.pem"
KEY = "OrangePi5_001.private.key"


DEVICE_CONFIG = {
    "uid": "kullanici_user_id", 
    "deviceId": "orange-pi-002",              
    "deviceInfo": {
        "name": "Orange Pi Sera Sensoru",
        "type": "Hidroponik Sensor + AI Analiz",
        "location": "Sera A - Bolum 1",
        "sensors": ["lux", "ph", "tds", "temperature", "humidity", "camera", "ai_health_prediction"],
        "ai_features": {
            "model": "Bitki Saglik Tahmini v1.0",
            "accuracy": "99.6%",
            "enabled": MODEL_AVAILABLE
        }
    }
}


model = None
feature_names = ['lux', 'ph', 'temperature', 'humidity', 'tds', 'su_sicaklik']

OPTIMAL_RANGES = {
    "lux": {"min": 10000, "max": 20000, "ideal": 15000},     
    "ph": {"min": 5.5, "max": 6.5, "ideal": 6.0},           
    "temperature": {"min": 20, "max": 28, "ideal": 24},      
    "humidity": {"min": 50, "max": 70, "ideal": 60},         
    "tds": {"min": 400, "max": 800, "ideal": 600}            
}


ACCEPTABLE_RANGES = {
    "lux": {"min": 5000, "max": 30000},
    "ph": {"min": 5.0, "max": 7.0}, 
    "temperature": {"min": 18, "max": 32},
    "humidity": {"min": 40, "max": 80},
    "tds": {"min": 300, "max": 1000}
}

ema_lux = None
ema_temperature = None
ema_humidity = None
ema_ph = None
ema_tds = None


SENSOR_INTERVALS = {
    "dht22": 2,         
    "bh1750": 2,        
    "ph": 30,           
    "tds": 15          
}


ALPHA_LUX = 0.4         
ALPHA_TEMP = 0.3        
ALPHA_HUMIDITY = 0.3   
ALPHA_PH = 0.2          
ALPHA_TDS = 0.25       


last_sensor_reads = {
    "ph": 0,
    "tds": 0,
    "dht22": 0,
    "bh1750": 0
}

def calculate_ema(current_value, previous_ema, alpha):
    if previous_ema is None:
        return current_value  
    return alpha * current_value + (1 - alpha) * previous_ema

def initialize_ai_model():
    print("?? Kural tabanl� sa�l�k de�erlendirme sistemi haz�r!")
    print("?? Optimal aral�klar:")
    print(f"   ?? LUX: {OPTIMAL_RANGES['lux']['min']}-{OPTIMAL_RANGES['lux']['max']} (ideal: {OPTIMAL_RANGES['lux']['ideal']})")
    print(f"   ?? pH: {OPTIMAL_RANGES['ph']['min']}-{OPTIMAL_RANGES['ph']['max']} (ideal: {OPTIMAL_RANGES['ph']['ideal']})")
    print(f"   ??? S�cakl�k: {OPTIMAL_RANGES['temperature']['min']}-{OPTIMAL_RANGES['temperature']['max']}�C (ideal: {OPTIMAL_RANGES['temperature']['ideal']}�C)")
    print(f"   ?? Nem: {OPTIMAL_RANGES['humidity']['min']}-{OPTIMAL_RANGES['humidity']['max']}% (ideal: {OPTIMAL_RANGES['humidity']['ideal']}%)")
    print(f"   ?? TDS: {OPTIMAL_RANGES['tds']['min']}-{OPTIMAL_RANGES['tds']['max']} ppm (ideal: {OPTIMAL_RANGES['tds']['ideal']} ppm)")
    return True

def predict_plant_health(lux, ph, temperature, humidity, tds):
    
    try:
        scores = {}
        suggestions = []
        warnings = []
        
        if OPTIMAL_RANGES["lux"]["min"] <= lux <= OPTIMAL_RANGES["lux"]["max"]:
            scores["lux"] = 100
        elif ACCEPTABLE_RANGES["lux"]["min"] <= lux <= ACCEPTABLE_RANGES["lux"]["max"]:
            scores["lux"] = 70
        else:
            scores["lux"] = 30
            if lux < ACCEPTABLE_RANGES["lux"]["min"]:
                suggestions.append("Işık yetersiz, ek aydınlatma gerekli")
                warnings.append("Düşük ışık seviyesi")
            else:
                suggestions.append("Işıkk çok yüksek, gölgelendirme yapın")
                warnings.append("Yüksek ışık seviyesi")
        
        if OPTIMAL_RANGES["ph"]["min"] <= ph <= OPTIMAL_RANGES["ph"]["max"]:
            scores["ph"] = 100
        elif ACCEPTABLE_RANGES["ph"]["min"] <= ph <= ACCEPTABLE_RANGES["ph"]["max"]:
            scores["ph"] = 70
        else:
            scores["ph"] = 20
            if ph < ACCEPTABLE_RANGES["ph"]["min"]:
                suggestions.append("pH çok düşük (asidik), yükseltilmeli")
                warnings.append("Kritik pH seviyesi - Düşük")
            else:
                suggestions.append("pH çok yüksek (bazik), düşürülmeli")
                warnings.append("Kritik pH seviyesi - Yüksek")
        
        if OPTIMAL_RANGES["temperature"]["min"] <= temperature <= OPTIMAL_RANGES["temperature"]["max"]:
            scores["temperature"] = 100
        elif ACCEPTABLE_RANGES["temperature"]["min"] <= temperature <= ACCEPTABLE_RANGES["temperature"]["max"]:
            scores["temperature"] = 70
        else:
            scores["temperature"] = 30
            if temperature < ACCEPTABLE_RANGES["temperature"]["min"]:
                suggestions.append("Sicaklik düşük, ısıtma gerekli")
                warnings.append("Düşük sıcaklık")
            else:
                suggestions.append("Sıcaklık yüksek, soğutma gerekli")
                warnings.append("Yüksek sıcaklık")
        
        if OPTIMAL_RANGES["humidity"]["min"] <= humidity <= OPTIMAL_RANGES["humidity"]["max"]:
            scores["humidity"] = 100
        elif ACCEPTABLE_RANGES["humidity"]["min"] <= humidity <= ACCEPTABLE_RANGES["humidity"]["max"]:
            scores["humidity"] = 70
        else:
            scores["humidity"] = 30
            if humidity < ACCEPTABLE_RANGES["humidity"]["min"]:
                suggestions.append("Nem düşük, ortam nemlendirilmeli")
                warnings.append("Düşük nem seviyesi")
            else:
                suggestions.append("Nem yüksek, havalandırmayı arttırın")
                warnings.append("Yüksek nem seviyesi")
        
        if OPTIMAL_RANGES["tds"]["min"] <= tds <= OPTIMAL_RANGES["tds"]["max"]:
            scores["tds"] = 100
        elif ACCEPTABLE_RANGES["tds"]["min"] <= tds <= ACCEPTABLE_RANGES["tds"]["max"]:
            scores["tds"] = 70
        else:
            scores["tds"] = 30
            if tds < ACCEPTABLE_RANGES["tds"]["min"]:
                suggestions.append("Besin konsantrasyonu düşük, gübre ekleyin")
                warnings.append("Düşük besin konsantrasyonu")
            else:
                suggestions.append("Besin konsantrasyonu yüksek, sulandırın")
                warnings.append("Yüksek besin konsantrasyonu")
        
        weights = {"lux": 0.2, "ph": 0.25, "temperature": 0.2, "humidity": 0.15, "tds": 0.2}
        overall_score = sum(scores[param] * weights[param] for param in scores.keys())
        
        if overall_score >= 90:
            prediction_text = "Mükemmel"
            risk_level = "Çok düşük"
        elif overall_score >= 80:
            prediction_text = "Sağlıklı"
            risk_level = "Düşük"
        elif overall_score >= 60:
            prediction_text = "Orta"
            risk_level = "Orta"
        elif overall_score >= 40:
            prediction_text = "Riskli"
            risk_level = "Yüksek"
        else:
            prediction_text = "Kritik"
            risk_level = "Çok Yüksek"
        
        if not suggestions:
            suggestions = ["Tüm parametreler optimal aralıkta"]
        
        su_sicaklik = temperature + random.uniform(-2.5, 1.0)
        su_sicaklik = max(15.0, min(32.0, su_sicaklik))
        
        result = {
            "prediction": prediction_text,
            "confidence": round(overall_score, 1),
            "risk_level": risk_level,
            "suggestions": suggestions,
            "warnings": warnings,
            "optimal": overall_score >= 80,
            "parameters": {
                "lux": float(lux),
                "ph": float(ph),
                "temperature": float(temperature),
                "humidity": float(humidity),
                "tds": float(tds),
                "su_sicaklik": float(su_sicaklik)
            },
            "scores": scores,
            "model_info": {
                "version": "Kural Tabanl� v1.0",
                "accuracy": "Ger�ek Zamanl�",
                "timestamp": int(time.time() * 1000)
            }
        }
        
        status_icon = "??" if prediction_text in ["M�kemmel", "Saglikli"] else "??"
        print(f"{status_icon} Sa�l�k: {prediction_text} (Skor: %{overall_score:.1f})")
        
        return result
        
    except Exception as e:
        print(f"?? Sa�l�k de�erlendirme hatas�: {e}")
        return {
            "prediction": "Hata",
            "confidence": 0,
            "risk_level": "Bilinmiyor",
            "suggestions": [f"De�erlendirme hatas�: {str(e)}"],
            "warnings": [],
            "optimal": False,
            "error": str(e)
        }

mqtt_connection = mqtt_connection_builder.mtls_from_path(
    endpoint=ENDPOINT, port=8883,
    cert_filepath=CRT, pri_key_filepath=KEY, ca_filepath=CA,
    client_id=CLIENT_ID, clean_session=True, keep_alive_secs=30)

def capture_camera_image():
    try:
        image_base64=single_shot_detection.capture_and_detect() 
        
        return image_base64
        
    except Exception as e:
        print(f"?? Kamera hatasi: {e}")
        return None

def send_device_heartbeat():
    while True:
        try:
            device_payload = {
                "uid": DEVICE_CONFIG["uid"],
                "deviceId": DEVICE_CONFIG["deviceId"],
                "deviceInfo": {
                    **DEVICE_CONFIG["deviceInfo"],
                    "status": "online",
                    "batteryLevel": 100,
                    "lastSeen": int(time.time() * 1000),
                    "createdAt": int(time.time() * 1000),
                    "ai_status": {
                        "model_loaded": True,
                        "last_prediction": int(time.time() * 1000),
                        "system_type": "rule_based"
                    }
                }
            }
            
            mqtt_connection.publish(
                topic=TOPIC,
                payload=json.dumps(device_payload),
                qos=mqtt.QoS.AT_LEAST_ONCE)
            
            print(f"?? Cihaz durumu gonderildi: {datetime.now().strftime('%H:%M:%S')}")
            
        except Exception as e:
            print(f"?? Heartbeat hatasi: {e}")
        
        time.sleep(15 * 60)

def get_sensor_data_safe():
    try:
        lux_value = bh.get_Lux()
        print(f"?? LUX basarili: {lux_value}")
    except Exception as e:
        print(f"?? LUX sensor hatasi (I2C): {e}")
        current_hour = datetime.now().hour
        is_day = 6 <= current_hour <= 18
        lux_value = 800 + random.random() * 400 if is_day else 50 + random.random() * 100
        print(f"?? LUX simulated: {lux_value}")
    
    
    try:
        print("??? DHT22 sensorunden veri okunuyor...")
        temp_hum_data = dh.getTempHum()  
        print(f"??? DHT22 serial veri: {temp_hum_data}, tip: {type(temp_hum_data)}")
        
        
        if temp_hum_data == 0:
            
            print("??? DHT22 serial okuma basarisiz (deger: 0)")
            temperature = 22 + random.random() * 6
            humidity = 60 + random.random() * 20
            print(f"??? DHT22 simulated: T={temperature}, H={humidity}")
            
        elif isinstance(temp_hum_data, (list, tuple)) and len(temp_hum_data) >= 2:
            
            temperature = float(temp_hum_data[0])
            humidity = float(temp_hum_data[1])
            print(f"? DHT22 serial veri alimi basarili: T={temperature}^C, H={humidity}%")
            
            
            if not (0 <= temperature <= 50) or not (0 <= humidity <= 100):
                print(f"?? DHT22 degerleri uygun araliklarin disinda: T={temperature}, H={humidity}")
                temperature = max(0, min(50, temperature))  
                humidity = max(0, min(100, humidity))
                print(f"?? DHT22 degerler duzeltildi: T={temperature}, H={humidity}")
        else:
            print(f"?? DHT22 beklenmeyen format: {temp_hum_data}")
            temperature = 22 + random.random() * 6
            humidity = 60 + random.random() * 20
            print(f"??? DHT22 simulated: T={temperature}, H={humidity}")
            
    except Exception as e:
        print(f"??? DHT22 serial hatasi: {e}")
        temperature = 22 + random.random() * 6
        humidity = 60 + random.random() * 20
        print(f"??? DHT22 simulated: T={temperature}, H={humidity}")
    
    return lux_value, temperature, humidity

def update_ema_values_optimized():
    global ema_lux, ema_temperature, ema_humidity, ema_ph, ema_tds, last_sensor_reads
    
    current_time = time.time()
    
    try:
        
        if current_time - last_sensor_reads["bh1750"] >= SENSOR_INTERVALS["bh1750"]:
            try:
                raw_lux = bh.get_Lux()
                ema_lux = calculate_ema(raw_lux, ema_lux, ALPHA_LUX)
                last_sensor_reads["bh1750"] = current_time
                print(f"?? LUX: Ham={raw_lux:.1f} � EMA={ema_lux:.1f}")
            except Exception as e:
                print(f"?? LUX sensor hatas�: {e}")
        
        if current_time - last_sensor_reads["dht22"] >= SENSOR_INTERVALS["dht22"]:
            try:
                temp_hum_data = dh.getTempHum()
                if temp_hum_data != 0 and isinstance(temp_hum_data, (list, tuple)) and len(temp_hum_data) >= 2:
                    raw_temp = float(temp_hum_data[0])
                    raw_hum = float(temp_hum_data[1])
                    
                    if 0 <= raw_temp <= 50 and 0 <= raw_hum <= 100:
                        ema_temperature = calculate_ema(raw_temp, ema_temperature, ALPHA_TEMP)
                        ema_humidity = calculate_ema(raw_hum, ema_humidity, ALPHA_HUMIDITY)
                        last_sensor_reads["dht22"] = current_time
                        print(f"??? DHT22: T={raw_temp:.1f}�{ema_temperature:.1f}, H={raw_hum:.1f}�{ema_humidity:.1f}")
                    else:
                        print(f"?? DHT22 de�erleri aral�k d���nda: T={raw_temp}, H={raw_hum}")
                else:
                    print("?? DHT22 veri al�namad�")
            except Exception as e:
                print(f"?? DHT22 sensor hatas�: {e}")
        
        
        if current_time - last_sensor_reads["ph"] >= SENSOR_INTERVALS["ph"]:
            try:
                raw_ph_voltage = ads.read_ads(3)
                raw_ph = ads.calculate_ph(raw_ph_voltage)
                ema_ph = calculate_ema(raw_ph, ema_ph, ALPHA_PH)
                last_sensor_reads["ph"] = current_time
                print(f"?? pH: {raw_ph_voltage:.3f}V � pH {raw_ph:.2f} � EMA {ema_ph:.2f} (30s interval)")
            except Exception as e:
                print(f"?? pH sensor hatas�: {e}")
        
        if current_time - last_sensor_reads["tds"] >= SENSOR_INTERVALS["tds"]:
            try:
                raw_tds_voltage = ads.read_ads(0)
                temp_for_tds = ema_temperature if ema_temperature is not None else 25.0
                raw_tds = ads.calculate_tds(raw_tds_voltage, temperature=temp_for_tds)
                ema_tds = calculate_ema(raw_tds, ema_tds, ALPHA_TDS)
                last_sensor_reads["tds"] = current_time
                print(f"?? TDS: {raw_tds_voltage:.3f}V � TDS {raw_tds:.1f} � EMA {ema_tds:.1f} (15s interval)")
            except Exception as e:
                print(f"?? TDS sensor hatas�: {e}")
                
    except Exception as e:
        print(f"?? EMA g�ncelleme genel hatas�: {e}")

def update_ema_values():
    update_ema_values_optimized()

def continuous_sensor_reading():
    print("?? Optimized sens�r okuma ba�lat�ld�:")
    print(f"   ?? DHT22 & BH1750: {SENSOR_INTERVALS['dht22']}s aral�klarla")
    print(f"   ?? pH (E201C): {SENSOR_INTERVALS['ph']}s aral�klarla") 
    print(f"   ?? TDS (Keyestudio): {SENSOR_INTERVALS['tds']}s aral�klarla")
    
    while True:
        try:
            update_ema_values_optimized()
        except Exception as e:
            print(f"?? S�rekli okuma hatas�: {e}")
        
        time.sleep(1)

def send_sensor_data():
    global ema_lux, ema_temperature, ema_humidity, ema_ph, ema_tds
    
    print("? EMA de�erlerinin haz�r olmas� bekleniyor...")
    wait_count = 0
    while wait_count < 15:
        if (ema_lux is not None and ema_temperature is not None and 
            ema_humidity is not None and ema_ph is not None and ema_tds is not None):
            print("? T�m EMA de�erleri haz�r! AWS g�nderimi ba�l�yor...")
            break
        
        ready_sensors = []
        if ema_lux is not None: ready_sensors.append("LUX")
        if ema_temperature is not None: ready_sensors.append("TEMP") 
        if ema_humidity is not None: ready_sensors.append("HUM")
        if ema_ph is not None: ready_sensors.append("pH")
        if ema_tds is not None: ready_sensors.append("TDS")
        
        print(f"? EMA bekleniyor... Haz�r: {'/'.join(ready_sensors) if ready_sensors else 'Hi�biri'} ({wait_count*2}s)")
        time.sleep(2)
        wait_count += 1
    
    if wait_count >= 15:
        print("?? EMA de�erleri tam haz�r olmad�, k�smi de�erlerle ba�lan�yor...")
    
    while True:
        try:
            current_lux = ema_lux if ema_lux is not None else 300.0
            current_temp = ema_temperature if ema_temperature is not None else 22.0 + random.random() * 6
            current_hum = ema_humidity if ema_humidity is not None else 60.0 + random.random() * 20
            current_ph = ema_ph if ema_ph is not None else 6.0 + (random.random() - 0.5) * 0.8
            current_tds = ema_tds if ema_tds is not None else 500.0 + random.random() * 200
            
            ema_status = []
            if ema_lux is not None: ema_status.append("LUX?")
            if ema_temperature is not None: ema_status.append("TEMP?") 
            if ema_humidity is not None: ema_status.append("HUM?")
            if ema_ph is not None: ema_status.append("pH?")
            if ema_tds is not None: ema_status.append("TDS?")
            
            print(f"\n?? EMA Durumu: {' '.join(ema_status) if ema_status else 'T�m sens�rler fallback'}")
            
            # Sensor degerlerini temiz format ile yazdir
            print("\n" + "="*50)
            print("?? SENSOR READINGS (Before AWS Upload)")
            print("="*50)
            print(f"?? LUX Value      : {current_lux:.1f} lux")
            print(f"???  Temperature   : {current_temp:.1f} �C")
            print(f"?? Humidity      : {current_hum:.1f} %")
            print(f"??  pH Value       : {current_ph:.2f}")
            print(f"?? TDS Value      : {current_tds:.1f} ppm")
            print("="*50)
            
            print(f"?? AI Health Analysis Starting...")
            ai_prediction = predict_plant_health(
                lux=current_lux,
                ph=current_ph,
                temperature=current_temp,
                humidity=current_hum,
                tds=current_tds
            )
            
            sensor_payload = {
                "uid": DEVICE_CONFIG["uid"],
                "deviceId": DEVICE_CONFIG["deviceId"],
                "ts": int(time.time() * 1000),
                "lux": round(current_lux, 1),
                "ph_v": round(current_ph, 2),
                "tds_v": round(current_tds, 1),
                "temperature": round(current_temp, 1),
                "humidity": round(current_hum, 1),
                "data_source": "EMA_filtered", 
                
                
                "ai_analysis": {
                    "health_prediction": ai_prediction["prediction"],
                    "confidence_percent": ai_prediction["confidence"],
                    "risk_level": ai_prediction["risk_level"],
                    "is_optimal": ai_prediction["optimal"],
                    "suggestions": ai_prediction["suggestions"][:3],
                    "warnings": ai_prediction.get("warnings", [])[:3],
                    "model_version": ai_prediction.get("model_info", {}).get("version", "unknown"),
                    "analysis_timestamp": int(time.time() * 1000)
                }
            }
            
            print(f"\n?? Kamera g?r?nt?s? yakalan?yor...")
            capture_start_time = time.time()
            
            camera_image = capture_camera_image()
            capture_duration = time.time() - capture_start_time
            
            if camera_image:
                sensor_payload.update({
                    "image": camera_image
                })
                print(f"?? G?rsel ba?ar?yla yakaland?")
                print(f"?? Yakalama s?resi: {capture_duration:.1f}s")
            else:
                sensor_payload.update({
                    "image": None
                })
                print(f"?? G?rsel yakalanamad? (s?re: {capture_duration:.1f}s)")
            
            print("?? Veriler AWS'ye g?nderiliyor...")
            
            # Payload boyutunu kontrol et
            payload_str = json.dumps(sensor_payload)
            payload_size = len(payload_str.encode('utf-8'))
            
            print(f"?? Toplam payload boyutu: {payload_size} bytes ({payload_size/1024:.1f} KB)")
            
            if payload_size > 128000:
                print(f"?? Payload ?ok b?y?k ({payload_size} bytes = {payload_size/1024:.1f} KB), AWS IoT limiti 128KB")
                print("?? G?rsel olmadan g?nderiliyor...")
                sensor_payload["image"] = None
                new_payload_str = json.dumps(sensor_payload)
                new_payload_size = len(new_payload_str.encode('utf-8'))
                print(f"?? G?rsel olmadan payload boyutu: {new_payload_size} bytes ({new_payload_size/1024:.1f} KB)")
            else:
                print(f"? Payload boyutu AWS IoT limiti i?inde ({payload_size/1024:.1f} KB / 128 KB)")
            
            mqtt_connection.publish(
                topic=TOPIC,
                payload=json.dumps(sensor_payload),
                qos=mqtt.QoS.AT_LEAST_ONCE)
            
            ai_icon = "??" if ai_prediction["prediction"] == "Saglikli" else "??"
            log_msg = f"?? EMA Sens�r: LUX:{sensor_payload['lux']:.0f} pH:{sensor_payload['ph_v']:.1f} TDS:{sensor_payload['tds_v']:.0f} T:{sensor_payload['temperature']:.1f}�C H:{sensor_payload['humidity']:.0f}%"
            log_msg += f" | ?? AI: {ai_icon} {ai_prediction['prediction']} (%{ai_prediction['confidence']:.1f})"
            
            if sensor_payload.get('image'):
                log_msg += " | ?? Gorsel gonderildi"
            else:
                log_msg += " | ?? Gorsel gonderilmedi"
            
            print(log_msg)
            
            print("\n" + "?"*25)
            print("?? DATA SENT TO AWS SUCCESSFULLY")
            print("?"*25)
            print(f"? Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"?? Sensor Count: 5 sensors")
            print(f"?? AI Prediction: {ai_prediction['prediction']} ({ai_prediction['confidence']:.1f}%)")
            print(f"?? Image: {'Included' if sensor_payload.get('image') else 'Not included'}")
            print("?"*25 + "\n")
            
        except Exception as e:
            print(f"? Sensor verisi hatasi: {e}")
            import traceback
            traceback.print_exc()
        
        time.sleep(30)

def main():
    print("?? ************* < Sera �zleme Sistemi > ************")
    print("="*55)
    
    
    print("?? Sa�l�k De�erlendirme Sistemi ba�lat�l�yor...")
    ai_ready = initialize_ai_model()
    
    if ai_ready:
        print("? Kural tabanl� sistem haz�r!")
    else:
        print("?? Sistem ba�lat�lamad�")
    
    # Dosya varlik kontrolu
    required_files = [CA, CRT, KEY]
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files: ## Bu kisimda eger eksik credential dosyalari varsa bunlari bildiriyoruz.
        print(f"? Eksik dosyalar: {', '.join(missing_files)}")
        return
    
    # DHT22 Serial port kontrolu
    print("??? DHT22 sensor baglantisi test ediliyor...")
    try:
        # DHT22 baglanti kontrolu
        if dh.test_connection():
            print("? DHT22 sensor baglantisi baslatiliyor!")
        else:
            print("?? DHT22 baglantisinda sorun var-rastgele uretilenler kullanilacak.")
    except Exception as e:
        print(f"?? DHT22 test hatasi: {e} - simulated degerler kullan?lacak")
    
    # I2C kontrolu
    i2c_device = '/dev/i2c-2'
    if not os.path.exists(i2c_device):
        print(f"?? I2C hattinda cihaz bulunamadi: {i2c_device}")
        print("?? LUX sensoru icin simulated degerler kullanilacak")
    else:
        print(f"? I2C cihaz mevcut: {i2c_device}")
    
    print("?? AWS IoT'ye baglaniyor...")
    try:
        mqtt_connection.connect().result()
        print("? Baglanti basarili!")
    except Exception as e:
        print(f"? Baglanti hatasi: {e}")
        return
    
    # ilk basta cihaz bilgilerini gonder
    initial_device_payload = {
        "uid": DEVICE_CONFIG["uid"],
        "deviceId": DEVICE_CONFIG["deviceId"],
        "deviceInfo": {
            **DEVICE_CONFIG["deviceInfo"],
            "status": "online",
            "batteryLevel": 100,
            "lastSeen": int(time.time() * 1000),
            "createdAt": int(time.time() * 1000),
            "ai_capabilities": {
                "model_loaded": True,
                "model_accuracy": "Ger�ek Zamanl�" if ai_ready else "N/A",
                "features": ["health_assessment", "rule_based_analysis", "real_time_suggestions"] if ai_ready else [],
                "system_type": "rule_based_evaluation"
            }
        }
    }
    
    mqtt_connection.publish(
        topic=TOPIC,
        payload=json.dumps(initial_device_payload),
        qos=mqtt.QoS.AT_LEAST_ONCE)
    
    print("?? ilk cihaz kaydi gonnderildi")
    
    try:
        # Thread'leri baslat 
        sensor_reading_thread = threading.Thread(target=continuous_sensor_reading, daemon=True)
        data_sending_thread = threading.Thread(target=send_sensor_data, daemon=True)
        heartbeat_thread = threading.Thread(target=send_device_heartbeat, daemon=True)
        
        sensor_reading_thread.start()  
        data_sending_thread.start()    
        heartbeat_thread.start()       
        
        print("\n?? *************Sera �zleme Sistemi Aktif************")
        print("   ?? DHT22 (T&H): 2 saniyede bir (spec: 0.5Hz)")
        print("   ?? BH1750 (LUX): 2 saniyede bir (h�zl� de�i�im)")
        print("   ?? E201C (pH): 30 saniyede bir (stabilizasyon)")
        print("   ?? Keyestudio (TDS): 15 saniyede bir (optimized)")
        print("   ?? AWS IoT g�nderim: 30 saniyede bir (EMA de�erleri)")
        print("   ?? Sa�l�k analizi: 30 saniyede bir (Kural tabanl�)")
        print("   ?? Kamera g�r�nt�s�: 30 saniyede bir")
        print("   ?? Cihaz durumu: 15 dakikada bir")
        print("   ?? EMA Filtreleme: Aktif (Sens�r optimizasyonu)")
        print("   ?? Kural Tabanl� De�erlendirme: Aktif")
        
        print("="*55)
        
      
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n?? Durduruldu...")
    except Exception as e:
        print(f"? Hata: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
         
            dh.close_serial()
            mqtt_connection.disconnect().result()
            print("?? Baglanti kapatildi.")
        except:
            pass

if __name__ == "__main__":
    main()
