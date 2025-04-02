# Description: User profile endpoints
# The user profile endpoints allow users to view and update their profile information.
# The user profile includes details like username, bio, profile picture, and favorite games.

from flask import Blueprint, request, jsonify
from services.firebase import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    user_doc = db.collection('users').document(user_id).get()
    if user_doc.exists:
        return jsonify(user_doc.to_dict()), 200
    return jsonify({"error": "User not found"}), 404

@users_bp.route('/<user_id>', methods=['PUT'])
def update_user_profile(user_id):
    data = request.json
    # Get Authorization header
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Authorization required"}), 401
    
    # Simple check if the token contains the user ID (for development)
    token = auth_header.split('Bearer ')[1]
    if user_id not in token:
        return jsonify({"error": "Unauthorized to update this profile"}), 403
    
    # Update user document
    db.collection('users').document(user_id).update(data)
    
    # Return updated user
    updated_user = db.collection('users').document(user_id).get()
    return jsonify(updated_user.to_dict()), 200

@users_bp.route('/<user_id>/favorites', methods=['POST'])
def add_favorite(user_id):
    data = request.json
    game_id = data.get('gameId')
    
    if not game_id:
        return jsonify({"error": "Game ID is required"}), 400
    
    # Get current favorites
    user_doc = db.collection('users').document(user_id).get()
    if not user_doc.exists:
        return jsonify({"error": "User not found"}), 404
    
    user_data = user_doc.to_dict()
    favorites = user_data.get('favoriteGames', [])
    
    # Add game to favorites if not already there
    if game_id not in favorites:
        favorites.append(game_id)
        db.collection('users').document(user_id).update({"favoriteGames": favorites})
    
    return jsonify({"message": "Game added to favorites"}), 200

@users_bp.route('/<user_id>/favorites', methods=['GET'])
def get_favorites(user_id):
    user_doc = db.collection('users').document(user_id).get()
    if not user_doc.exists:
        return jsonify({"error": "User not found"}), 404
    
    user_data = user_doc.to_dict()
    favorite_ids = user_data.get('favoriteGames', [])
    
    # Get details for each favorite game
    favorites = []
    for game_id in favorite_ids:
        game_doc = db.collection('games').document(game_id).get()
        if game_doc.exists:
            favorites.append(game_doc.to_dict())
    
    return jsonify(favorites), 200