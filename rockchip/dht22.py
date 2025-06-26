import serial

ser = serial.Serial('/dev/ttyS6', 9600, timeout=1)

def getTempHum():
    line = ser.readline().decode(errors='ignore').strip()
    if line.startswith("SICAKLIK:") and ";NEM:" in line:
        temp = line.split("SICAKLIK:")[1].split(";NEM:")[0]
        hum  = line.split(";NEM:")[1]
        return [temp,hum]
    else:
        return 0
    
print(getTempHum())