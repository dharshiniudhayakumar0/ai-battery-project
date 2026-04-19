import os
from flask import Blueprint, request, jsonify, send_file, make_response
from werkzeug.utils import secure_filename
import pandas as pd
from reportlab.pdfgen import canvas
from database.db import db
from database.models import BatteryData, Device
from datetime import datetime, timedelta

export_bp = Blueprint('export', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@export_bp.route('/upload-csv', methods=['POST'])
def upload_csv():
    try:
        if 'file' not in request.files:
            return jsonify({"message": "No file part"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"message": "No selected file"}), 400
            
        if file and file.filename.endswith('.csv'):
            filename = secure_filename(file.filename)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            
            # Parse CSV with pandas
            df = pd.read_csv(filepath)
            
            # Assuming CSV has device_id, voltage, temperature, health
            records_added = 0
            for index, row in df.iterrows():
                try:
                    new_data = BatteryData(
                        device_id=int(row['device_id']),
                        voltage=float(row['voltage']),
                        temperature=float(row['temperature']),
                        health=float(row['health'])
                    )
                    db.session.add(new_data)
                    records_added += 1
                except Exception as e:
                    print(f"Error parsing row {index}: {str(e)}")
                    continue
                    
            db.session.commit()
            
            # Remove file after processing
            os.remove(filepath)
            
            return jsonify({"message": f"Successfully uploaded and stored {records_added} records from CSV"}), 200
        else:
            return jsonify({"message": "Only CSV files are allowed"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@export_bp.route('/report/<int:device_id>', methods=['GET'])
def generate_report(device_id):
    try:
        device = Device.query.get(device_id)
        if not device:
            return jsonify({"message": "Device not found"}), 404
            
        filepath = os.path.join(UPLOAD_FOLDER, f'report_device_{device_id}.pdf')
        
        # Generate PDF
        c = canvas.Canvas(filepath)
        c.drawString(100, 800, f"Battery Health Report")
        c.drawString(100, 780, f"Device Name: {device.name}")
        c.drawString(100, 760, f"Device Type: {device.type}")
        c.drawString(100, 740, f"Generated On: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}")
        
        c.drawString(100, 700, "Recent Data:")
        data = BatteryData.query.filter_by(device_id=device_id).order_by(BatteryData.timestamp.desc()).limit(5).all()
        
        y = 680
        for d in data:
            c.drawString(120, y, f"[{d.timestamp.strftime('%H:%M:%S')}] V: {d.voltage}V, T: {d.temperature}°C, H: {d.health}%")
            y -= 20
            
        c.save()
        
        return send_file(filepath, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@export_bp.route('/calendar/<int:device_id>', methods=['GET'])
def generate_calendar(device_id):
    try:
        device = Device.query.get(device_id)
        if not device:
            return jsonify({"message": "Device not found"}), 404
            
        # Schedule maintenance for 30 days from now
        maintenance_date = datetime.utcnow() + timedelta(days=30)
        dtstart = maintenance_date.strftime("%Y%m%dT%H%M%SZ")
        dtend = (maintenance_date + timedelta(hours=2)).strftime("%Y%m%dT%H%M%SZ")
        
        ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Maintenance for Device {device.name}
DTSTART:{dtstart}
DTEND:{dtend}
DESCRIPTION:Scheduled battery maintenance for {device.name} (Barcode: {device.barcode})
END:VEVENT
END:VCALENDAR"""

        response = make_response(ics_content)
        response.headers["Content-Disposition"] = f"attachment; filename=maintenance_device_{device_id}.ics"
        response.headers["Content-Type"] = "text/calendar"
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500
