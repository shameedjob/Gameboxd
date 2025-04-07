# Description: User authentication routes
# The authentication routes allow users to register, login, and get their own user data.

from flask import Blueprint, request, jsonify
import time
import uuid
import json
import bcrypt

auth_bp = Blueprint('auth', __name__)

# Simple in-memory storage for development
# In production, use Firebase Auth
users_db = {}

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        # Parse request JSON
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract required fields
        email = data.get('email')
        password = data.get('password')

        username = data.get('username', email.split('@')[0])
        
        # Validate fields
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        # Check if user already exists
        from services.firebase import db
        existing_users = list(db.collection('users').where('email', '==', email).limit(1).stream())
        if existing_users:
            return jsonify({"error": "User with this email already exists"}), 409
        
        # Create new user
        user_id = str(uuid.uuid4())
        user_data = {
            'userId': user_id,
            'username': username,
            'password': hashed_password,
            'email': email,
            'joinDate': time.time(),
            'bio': None,
            'profilePicture': None,
            'favoriteGames': []
        }
        
        # Store in Firestore
        db.collection('users').document(user_id).set(user_data)
        
        return jsonify({
            "message": "User registered successfully",
            "userId": user_id
        }), 201
        
    except Exception as e:
        print(f"Error in register: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    try:
        # Parse request JSON
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Extract credentials
        email = data.get('email')
        password = data.get('password')
        
        # Validate fields
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # Find user in Firestore
        from services.firebase import db
        users = list(db.collection('users').where('email', '==', email).limit(1).stream())
        
        if not users:
            return jsonify({"error": "User not found"}), 404
        
        user_data = users[0].to_dict()
        user_id = user_data['userId']
        stored_password = user_data.get('password')

        if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
            return jsonify({"error": "Invalid credentials"}), 401

        # In a real app, verify password with Firebase Auth
        # For development, we'll accept any password
        
        # Generate a simple token (in production, use JWT)
        token = f"dev_token_{user_id}_{int(time.time())}"
        
        return jsonify({
            "message": "Login successful",
            "userId": user_id,
            "token": token
        }), 200
        
    except Exception as e:
        print(f"Error in login: {str(e)}")
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user info from token"""
    try:
        # Get Authorization header
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Missing or invalid token"}), 401
        
        # Extract token
        token = auth_header.split('Bearer ')[1]
        
        # Simple token validation (in production, use JWT)
        if not token.startswith('dev_token_'):
            return jsonify({"error": "Invalid token format"}), 401
        
        # Extract user ID from token
        user_id = token.split('_')[2]
        
        # Get user from Firestore
        from services.firebase import db
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        # Return user data
        return jsonify(user_doc.to_dict()), 200
        
    except Exception as e:
        print(f"Error in get_current_user: {str(e)}")
        return jsonify({"error": str(e)}), 500