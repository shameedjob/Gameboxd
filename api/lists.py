# Description: This file contains the API endpoints for lists.
# The Lists are a way for users to create and share lists of games.
# The API allows users to create new lists, get a list by ID, and get lists by a user.

from flask import Blueprint, request, jsonify
from services.firebase import db
import time
import uuid # uuid is a module that helps generate unique IDs
 
lists_bp = Blueprint('lists', __name__)

@lists_bp.route('/', methods=['POST']) # Change from '/lists' to '/' | Method: POST (Create a list)
def create_list():
    data = request.json
    
    # Get user ID from token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization required"}), 401
    
    token = auth_header.split('Bearer ')[1]
    # Simple development token parsing
    if token.startswith('dev_token_'):
        user_id = token.split('dev_token_')[1].split('_')[0]
    else:
        return jsonify({"error": "Invalid token"}), 401
    
    # Create list
    list_id = str(uuid.uuid4())
    list_data = {
        "listId": list_id,
        "userId": user_id,
        "title": data.get('title'),
        "description": data.get('description'),
        "games": data.get('games', []),
        "isPublic": data.get('isPublic', True),
        "timestamp": data.get('timestamp', time.time())
    }
    
    # Save to database
    db.collection('lists').document(list_id).set(list_data)
    
    # Create activity entry
    activity_id = str(uuid.uuid4())
    activity_data = {
        "activityId": activity_id,
        "userId": user_id,
        "type": "list",
        "contentId": list_id,
        "gameId": None,
        "timestamp": time.time()
    }
    db.collection('activities').document(activity_id).set(activity_data)
    
    return jsonify(list_data), 201

@lists_bp.route('/<list_id>', methods=['GET']) # Change from '/lists/<list_id>' to '/<list_id>' | Method: GET (Get a list by ID)
def get_list(list_id):
    list_doc = db.collection('lists').document(list_id).get()
    if list_doc.exists:
        return jsonify(list_doc.to_dict()), 200
    return jsonify({"error": "List not found"}), 404

@lists_bp.route('/user/<user_id>', methods=['GET']) # Change from '/lists/user/<user_id>' to '/user/<user_id>' | Method: GET (Get lists by a user)
def get_user_lists(user_id):
    # Get public lists, or all lists if it's the current user
    lists_docs = db.collection('lists').where('userId', '==', user_id).stream()
    lists = [doc.to_dict() for doc in lists_docs]
    return jsonify(lists), 200