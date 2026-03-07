#include <Wire.h>
#include <MPU6050.h>
#include <QMC5883LCompass.h>
#include <MadgwickAHRS.h>
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;

MPU6050 mpu;
QMC5883LCompass compass;
Madgwick filter;

int16_t ax, ay, az;
int16_t gx, gy, gz;

float mx, my, mz;

float gyroOffsetX=0;
float gyroOffsetY=0;
float gyroOffsetZ=0;

float yaw,pitch,roll;

unsigned long lastSend = 0;

void calibrateGyro() {

  Serial.println("Calibrating gyro...");
  delay(2000);

  const int samples = 500;

  for(int i=0;i<samples;i++) {

    mpu.getMotion6(&ax,&ay,&az,&gx,&gy,&gz);

    gyroOffsetX += gx;
    gyroOffsetY += gy;
    gyroOffsetZ += gz;

    delay(5);
  }

  gyroOffsetX /= samples;
  gyroOffsetY /= samples;
  gyroOffsetZ /= samples;

  Serial.println("Calibration done");
}

void setup() {

  Serial.begin(115200);
  SerialBT.begin("ESP32_IMU");

  Wire.begin(21,22);

  mpu.initialize();

  if(!mpu.testConnection()){
    Serial.println("MPU fail");
    while(1);
  }

  compass.init();

  calibrateGyro();

  filter.begin(50);

  Serial.println("IMU ready");
}

void loop() {

  mpu.getMotion6(&ax,&ay,&az,&gx,&gy,&gz);

  compass.read();

  mx = compass.getX();
  my = compass.getY();
  mz = compass.getZ();

  gx -= gyroOffsetX;
  gy -= gyroOffsetY;
  gz -= gyroOffsetZ;

  float gxf = gx * 0.0010653;
  float gyf = gy * 0.0010653;
  float gzf = gz * 0.0010653;

  filter.update(gxf,gyf,gzf,ax,ay,az,mx,my,mz);

  roll  = filter.getRoll();
  pitch = filter.getPitch();
  yaw   = filter.getYaw();

  if(millis() - lastSend > 50){

    SerialBT.printf("%.2f,%.2f,%.2f\n",yaw,pitch,roll);

    lastSend = millis();
  }

  delay(5);
}