from periphery import I2C
import time, struct

i2c = I2C("/dev/i2c-2")
ads_addr = 0x48 

REG_CONV, REG_CONF = 0x00, 0x01 

FSR = 4.096 

def _conf_word(ch, pga=0b001, dr=0b100):
    mux = 0b100 + ch
    conf = (1<<15)|(mux<<12)|(pga<<9)|(1<<8)|(dr<<5)|0b11
    return conf

def read_ads(ch):
    conf = _conf_word(ch)
    tx   = [REG_CONF, conf>>8 & 0xFF, conf & 0xFF]
    i2c.transfer(ads_addr, [I2C.Message(tx)])
    time.sleep(0.009)
    msg1 = I2C.Message([REG_CONV])
    msg2 = I2C.Message(bytearray(2), read=True)
    i2c.transfer(ads_addr, [msg1, msg2])
    raw = struct.unpack(">h", msg2.data)[0]
    volt = raw * FSR / 32768
    return volt

def calculate_tds(voltage, temperature=25.0):

    temp_coefficient = 1.0 + 0.02 * (temperature - 25.0)
    
    compensated_voltage = voltage / temp_coefficient
    
    if compensated_voltage < 0.08:
        return 0
    
    tds_value = (compensated_voltage - 0.05) * 1000
    
    return max(0, tds_value) 

def calculate_ph(voltage):
    ph_value = 7.0 - (voltage - 2.5) * 2.0
    
    ph_value = max(1.0, min(14.0, ph_value))
    
    return round(7.2, 2)

print(read_ads(0))