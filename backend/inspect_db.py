from app import app
from database.db import db
from database.models import Device, BatteryData

with app.app_context():
    try:
        devices = Device.query.all()
        print(f"Found {len(devices)} devices")
        for d in devices:
            print(f"Device: ID={d.id}, Name={d.name}, CreatedAt={d.created_at}")
            data_points = BatteryData.query.filter_by(device_id=d.id).all()
            print(f"  Found {len(data_points)} data points")
            for dp in data_points:
                print(f"    Point: ID={dp.id}, Voltage={dp.voltage}, Temp={dp.temperature}, Health={dp.health}, Cycles={dp.cycles}, Timestamp={dp.timestamp}")
                if dp.health is None:
                    print("    WARNING: Health is None!")
                if dp.voltage is None:
                    print("    WARNING: Voltage is None!")
    except Exception as e:
        print(f"Error: {e}")
