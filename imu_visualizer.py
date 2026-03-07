from vpython import canvas, box, arrow, label, vector, color  # type: ignore[import]
import serial
import math
import sys

if sys.platform == "darwin":
    PORT = "/dev/cu.ESP32_IMU"   # macOS
else:
    PORT = "COM3"                 # Windows — change if your port is different
BAUD=115200

ser=serial.Serial(PORT,BAUD,timeout=1)

scene=canvas(title="Payload IMU Telemetry",width=1000,height=650,
background=vector(0.08,0.08,0.1))

scene.forward=vector(-1,-0.3,-1)

payload=box(length=4,width=2,height=1,color=color.red)

forward_arrow=arrow(pos=vector(0,0,0),axis=vector(3,0,0),
color=color.green,shaftwidth=0.15)

up_arrow=arrow(pos=vector(0,0,0),axis=vector(0,3,0),
color=color.cyan,shaftwidth=0.15)

yaw_text=label(pos=vector(-6,5,0),text="Yaw: 0°",box=False,height=20)
pitch_text=label(pos=vector(-6,4,0),text="Pitch: 0°",box=False,height=20)
roll_text=label(pos=vector(-6,3,0),text="Roll: 0°",box=False,height=20)

print("Connected")

while True:

    try:

        line=ser.readline().decode().strip()

        if not line:
            continue

        yaw,pitch,roll=map(float,line.split(","))

        yaw_text.text=f"Yaw: {yaw:.1f}°"
        pitch_text.text=f"Pitch: {pitch:.1f}°"
        roll_text.text=f"Roll: {roll:.1f}°"

        yaw=math.radians(yaw)
        pitch=math.radians(pitch)
        roll=math.radians(roll)

        axis=vector(
            math.cos(pitch)*math.cos(yaw),
            math.sin(pitch),
            math.cos(pitch)*math.sin(yaw)
        )

        up=vector(
            -math.sin(roll)*math.sin(yaw),
            math.cos(roll),
            math.sin(roll)*math.cos(yaw)
        )

        axis=vector(axis.z,axis.y,-axis.x)
        up=vector(up.x,up.z,-up.y)

        payload.axis=axis
        payload.up=up

        forward_arrow.axis=axis*3
        up_arrow.axis=up*3

    except:
        pass