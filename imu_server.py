from flask import Flask, jsonify
from flask_cors import CORS
import serial
import math
import sys
import threading
import json

app = Flask(__name__)
CORS(app)

if sys.platform == "darwin":
    PORT = "/dev/cu.ESP32_IMU"
else:
    PORT = "COM3"
BAUD = 115200

# Global state
imu_data = {
    "yaw": 0.0,
    "pitch": 0.0,
    "roll": 0.0,
    "axis": {"x": 0, "y": 0, "z": 0},
    "up": {"x": 0, "y": 0, "z": 0},
    "timestamp": 0,
    "connected": False
}

def read_serial():
    global imu_data
    try:
        ser = serial.Serial(PORT, BAUD, timeout=1)
        imu_data["connected"] = True
        print("Connected to ESP32")
        
        while True:
            line = ser.readline().decode().strip()
            if not line:
                continue
            
            try:
                yaw, pitch, roll = map(float, line.split(","))
            except:
                continue
            
            # Convert to radians
            yaw_rad = math.radians(yaw)
            pitch_rad = math.radians(pitch)
            roll_rad = math.radians(roll)
            
            # Calculate axis vectors
            axis_x = math.cos(pitch_rad) * math.cos(yaw_rad)
            axis_y = math.sin(pitch_rad)
            axis_z = math.cos(pitch_rad) * math.sin(yaw_rad)
            
            up_x = -math.sin(roll_rad) * math.sin(yaw_rad)
            up_y = math.cos(roll_rad)
            up_z = math.sin(roll_rad) * math.cos(yaw_rad)
            
            # Mounting correction
            axis = [axis_z, axis_y, -axis_x]
            up = [up_x, up_z, -up_y]
            
            imu_data = {
                "yaw": yaw,
                "pitch": pitch,
                "roll": roll,
                "axis": {"x": axis[0], "y": axis[1], "z": axis[2]},
                "up": {"x": up[0], "y": up[1], "z": up[2]},
                "timestamp": 0,
                "connected": True
            }
            
    except Exception as e:
        print(f"Serial error: {e}")
        imu_data["connected"] = False

@app.route('/api/imu-data', methods=['GET'])
def get_imu_data():
    return jsonify(imu_data)

@app.route('/api/imu-health', methods=['GET'])
def get_health():
    return jsonify({"status": "ok", "imu_connected": imu_data["connected"]})

if __name__ == '__main__':
    # Start serial reader in background thread
    serial_thread = threading.Thread(target=read_serial, daemon=True)
    serial_thread.start()
    
    print("Starting IMU server on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
