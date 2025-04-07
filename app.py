# Description: Main entry point for the Flask application.
# This file initializes the Flask app, sets up CORS, and registers the API blueprints.
# BASICALLY, THIS FILE IS THE STARTING POINT OF THE APPLICATION. :)

from flask import Flask, request, jsonify
from flask_cors import CORS # type: ignore
import os
from dotenv import load_dotenv
import services.firebase as firebase
import time


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Import routes
from api.auth import auth_bp
from api.games import games_bp
from api.reviews import reviews_bp
from api.users import users_bp
from api.lists import lists_bp
from api.activities import activities_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(games_bp, url_prefix='/api/games')
app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(lists_bp, url_prefix='/api/lists')
app.register_blueprint(activities_bp, url_prefix='/api/activities')

@app.route('/') # Change from '/api' to '/' | Method: GET
def index():
    return jsonify({"message": "Welcome to the Game Tracker API"})

# Test route for auth API
# @app.route('/test-auth', methods=['GET']) # Method: GET
# def test_auth_route():
#     """Test route for auth API"""
#     return jsonify({
#         "status": "ok",
#         "message": "Auth API is accessible",
#         "timestamp": time.time()
#     })
    
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change from port 5000 to 5001