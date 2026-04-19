from app import app
from database.db import db
from database.models import Device
from datetime import datetime

with app.app_context():
    try:
        devices = Device.query.filter(Device.created_at == None).all()
        print(f"Adding timestamps to {len(devices)} devices...")
        for d in devices:
            d.created_at = datetime.utcnow()
        db.session.commit()
        print("Done!")
    except Exception as e:
        db.session.rollback()
        print(f"Error: {e}")
