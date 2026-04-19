from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from database.db import db
from services.simulation import BatterySimulator

# Import blueprints
from routes.auth_routes import auth_bp
from routes.device_routes import device_bp
from routes.battery_routes import battery_bp
from routes.ai_routes import ai_bp
from routes.alert_routes import alert_bp
from routes.export_routes import export_bp
from routes.health_calculate_routes import health_calc_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes
CORS(app)

# Initialize JWT
jwt = JWTManager(app)

# Initialize DB
db.init_app(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(device_bp, url_prefix='/api')
app.register_blueprint(battery_bp, url_prefix='/api/battery-data')
app.register_blueprint(ai_bp, url_prefix='/api')
app.register_blueprint(alert_bp, url_prefix='/api/alerts')
app.register_blueprint(export_bp, url_prefix='/api')
app.register_blueprint(health_calc_bp, url_prefix='/api')

# Global error handler
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

with app.app_context():
    # Create tables if they don't exist
    db.create_all()
    print("[\u2713] Database initialized")

# Start background battery simulator
simulator = BatterySimulator(app)
simulator.start()

if __name__ == '__main__':
    print("[\u2713] Starting Server...")
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=True)
