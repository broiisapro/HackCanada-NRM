#include <Wire.h>
#include <MPU6050.h>
#include "BluetoothSerial.h"

BluetoothSerial SerialBT;
MPU6050 mpu;

int16_t ax, ay, az;
int16_t gx, gy, gz;

float pitch, roll;

void setup() {

  Serial.begin(115200);
  SerialBT.begin("ESP32_IMU");

  Wire.begin(21,22);

  mpu.initialize();

  if (!mpu.testConnection()) {
    Serial.println("IMU connection failed");
    while (1);
  }

  Serial.println("IMU connected");
}

void loop() {

  mpu.getMotion6(&ax,&ay,&az,&gx,&gy,&gz);

  pitch = atan2(ax, sqrt(ay*ay + az*az)) * 180 / PI;
  roll  = atan2(ay, sqrt(ax*ax + az*az)) * 180 / PI;

  SerialBT.printf("%f,%f\n", pitch, roll);

  delay(20);
}