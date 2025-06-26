from periphery import I2C
import time

def get_Lux():
    i2c = I2C("/dev/i2c-2")

    addr = 0x23
    power_on = [0x01]
    reset = [0x07]
    continuous_high_res_mode = [0x10]

    i2c.transfer(addr, [I2C.Message(power_on)])
    i2c.transfer(addr, [I2C.Message(reset)])
    i2c.transfer(addr, [I2C.Message(continuous_high_res_mode)])

    time.sleep(1.0)
    read_add = [0x00, 0x00]
    messages = [I2C.Message(read_add, read=True)]
    i2c.transfer(addr, messages)
    print(f"ham deger: {messages[0].data}")
    raw = messages[0].data
    lux = ((raw[0] << 8) | raw[1]) / 1.2
    print(f"isik siddeti: {lux:.2f} lux")
    time.sleep(1)
    return lux

print(get_Lux())