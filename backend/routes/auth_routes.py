from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import bcrypt
import random
from database.db import db
from database.models import User

auth_bp = Blueprint('auth', __name__)

# In-memory OTP store (simulated)
# Format: { "phone_number": "123456" }
otp_store = {}

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({"message": "Username already exists"}), 400
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({"message": "Email already exists"}), 400
        if User.query.filter_by(phone_number=data.get('phone_number')).first():
            return jsonify({"message": "Phone number already exists"}), 400
            
        # Hash password
        hashed_password = bcrypt.hashpw(data.get('password').encode('utf-8'), bcrypt.gensalt())
        
        new_user = User(
            username=data.get('username'),
            email=data.get('email'),
            password=hashed_password.decode('utf-8'),
            phone_number=data.get('phone_number'),
            company_name=data.get('company_name')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        identifier = data.get('username') or data.get('email')
        user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
        
        if not user or not bcrypt.checkpw(data.get('password').encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({"message": "Invalid credentials"}), 401
            
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "token": access_token, 
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "company_name": user.company_name
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    print(f"DEBUG: /send-otp request received. Data: {request.data}", flush=True)
    try:
        data = request.get_json()
        print(f"DEBUG: Parsed JSON data: {data}", flush=True)
        phone_number = data.get('phone_number') if data else None
        
        if not phone_number:
            return jsonify({"message": "Phone number is required"}), 400
            
        # Generate fixed OTP for easy user testing
        otp = "123456"
        otp_store[phone_number] = otp
        
        # Print to backend terminal for testing (PROMINENT LOGGING)
        print("\n" + "="*50)
        print(f"!!! SECURITY ALERT: SIMULATED OTP CREATED !!!")
        print(f"Target Number: {phone_number}")
        print(f"OTP CODE: {otp}")
        print("Enter this code in your browser.")
        print("="*50 + "\n", flush=True)
        
        return jsonify({"message": "OTP sent successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        phone_number = data.get('phone_number')
        otp = data.get('otp')
        
        if not phone_number or not otp:
            return jsonify({"message": "Phone number and OTP are required"}), 400
            
        if otp == "123456" or (phone_number in otp_store and otp_store[phone_number] == str(otp)):
            # Clean up used OTP
            if phone_number in otp_store:
                del otp_store[phone_number]
            
            # Find the user to issue a token
            user = User.query.filter_by(phone_number=phone_number).first()
            access_token = None
            if user:
                access_token = create_access_token(identity=user.id)
                
            return jsonify({
                "message": "OTP verified successfully", 
                "success": True, 
                "token": access_token,
                "username": user.username if user else None,
                "email": user.email if user else None,
                "phone_number": user.phone_number if user else None,
                "company_name": user.company_name if user else None
            }), 200
        else:
            return jsonify({"message": "Invalid or expired OTP", "success": False}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required(optional=True)
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = None
        if user_id:
            user = db.session.get(User, user_id)
            
        if not user:
            return jsonify({"message": "User not found or unauthenticated"}), 404
            
        return jsonify({
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "company_name": user.company_name,
            "description": user.description,
            "avatar": user.avatar
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/test-api', methods=['GET'])
def test_api():
    return jsonify({"message": "API is reachable", "headers": dict(request.headers)}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    print("DEBUG: /profile PUT request received", flush=True)
    try:
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404
            
        data = request.get_json()
        print(f"DEBUG: Profile update data: {data.keys()}", flush=True)
        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.company_name = data.get('company_name', user.company_name)
        user.description = data.get('description', user.description)
        user.avatar = data.get('avatar', user.avatar)
        
        db.session.commit()
        print("DEBUG: Profile updated successfully", flush=True)
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        print(f"DEBUG: Error in update_profile: {str(e)}", flush=True)
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
