# Description: API routes for reviews
# The Reviews are a way for users to leave reviews for games.
# The API allows users to create a review, get reviews for a game, and get reviews by a user.

from flask import Blueprint, request, jsonify
from services.firebase import db
import time
import uuid

reviews_bp = Blueprint('reviews', __name__) # Change from 'games' to 'reviews'

@reviews_bp.route('/', methods=['POST']) # Change from '/games' to '/' | Method: POST (Create a review)
def create_review():
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
    
    # Create review
    review_id = str(uuid.uuid4())
    review_data = {
        "reviewId": review_id,
        "userId": user_id,
        "gameId": data.get('gameId'),
        "rating": data.get('rating'),
        "content": data.get('content'),
        "timestamp": data.get('timestamp', time.time()),
        "likes": []
    }
    
    # Save to database
    db.collection('reviews').document(review_id).set(review_data)
    
    # Create activity entry
    activity_id = str(uuid.uuid4())
    activity_data = {
        "activityId": activity_id,
        "userId": user_id,
        "type": "review",
        "contentId": review_id,
        "gameId": data.get('gameId'),
        "timestamp": time.time()
    }
    db.collection('activities').document(activity_id).set(activity_data)
    
    return jsonify(review_data), 201

@reviews_bp.route('/game/<game_id>', methods=['GET'])
def get_game_reviews(game_id):
    game_id = game_id.strip()
    reviews_docs = db.collection('reviews').where('gameId', '==', game_id).stream()
    reviews = [doc.to_dict() for doc in reviews_docs]
    return jsonify(reviews), 200

@reviews_bp.route('/user/<user_id>', methods=['GET']) # Change from '/games/user/<user_id>' to '/user/<user_id>' | Method: GET (Get reviews by a user)
def get_user_reviews(user_id):
    reviews_docs = db.collection('reviews').where('userId', '==', user_id).stream()
    reviews = [doc.to_dict() for doc in reviews_docs]
    return jsonify(reviews), 200