from .db import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), unique=True)
    company_name = db.Column(db.String(120))
    description = db.Column(db.String(500))
    avatar = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Device(db.Model):
    __tablename__ = 'devices'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    environment = db.Column(db.String(50))
    barcode = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    battery_data = db.relationship('BatteryData', backref='device', lazy=True, cascade="all, delete-orphan")

class BatteryData(db.Model):
    __tablename__ = 'battery_data'
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'), nullable=False)
    voltage = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    cycles = db.Column(db.Float, nullable=True)
    health = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.Integer, db.ForeignKey('devices.id'))
    message = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    device = db.relationship('Device', backref='alerts', lazy=True)
