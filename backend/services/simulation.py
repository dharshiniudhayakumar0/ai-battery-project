import threading
import time
import random
from database.db import db
from database.models import Device, BatteryData, Alert

class BatterySimulator:
    def __init__(self, app):
        self.app = app
        self.running = False
        self.thread = None
        
    def start(self):
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self._simulate_loop)
            self.thread.daemon = True
            self.thread.start()
            print("[\u2713] Battery Data Simulator started")
            
    def stop(self):
        self.running = False
        
    def _simulate_loop(self):
        with self.app.app_context():
            while self.running:
                # Sleep between 10 to 15 seconds
                time.sleep(random.uniform(10, 15))
                
                devices = Device.query.all()
                if not devices:
                    continue
                    
                # Pick a random device
                device = random.choice(devices)
                
                # Generate random data
                voltage = round(random.uniform(10.5, 14.8), 2)
                temperature = round(random.uniform(20.0, 65.0), 2)
                health = round(random.uniform(10.0, 100.0), 2)
                
                new_data = BatteryData(
                    device_id=device.id,
                    voltage=voltage,
                    temperature=temperature,
                    health=health
                )
                db.session.add(new_data)
                
                # Alerts logic
                if health < 30.0:
                    alert = Alert(device_id=device.id, message=f"[Simulated] Critical Health: {health}%")
                    db.session.add(alert)
                if temperature > 45.0:
                    alert = Alert(device_id=device.id, message=f"[Simulated] High Temperature: {temperature}°C")
                    db.session.add(alert)
                    
                db.session.commit()
                # Uncomment to debug:
                # print(f"Simulator inserted data for device {device.id}: V={voltage}, T={temperature}, H={health}")
