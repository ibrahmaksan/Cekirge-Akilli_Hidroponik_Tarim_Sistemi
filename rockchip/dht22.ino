#include "DHT.h"
#define DHTPIN 12       
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (!isnan(h) && !isnan(t)) {
    Serial.print("SICAKLIK:");
    Serial.print(t, 1);
    Serial.print(";NEM:");
    Serial.println(h, 1);
  }
  delay(2000);
}
