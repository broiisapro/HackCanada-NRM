from vpython import *
import serial
import math

ser = serial.Serial("/dev/cu.ESP32_IMU",115200)

scene = canvas(title="ESP32 IMU Orientation", width=800, height=600)

board = box(length=4,width=2,height=0.3,color=color.red)

while True:

    line = ser.readline().decode().strip()

    try:
        pitch, roll = map(float,line.split(","))

        board.axis = vector(math.cos(math.radians(pitch)),0,math.sin(math.radians(pitch)))
        board.up = vector(0,math.cos(math.radians(roll)),math.sin(math.radians(roll)))

    except:
        pass
