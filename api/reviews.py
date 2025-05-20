# Description: API routes for reviews
# The Reviews are a way for users to leave reviews for games.
# The API allows users to create a review, get reviews for a game, and get reviews by a user.

from flask import Blueprint, request, jsonify, current_app
from services.firebase import db
import time
import uuid

reviews_bp = Blueprint('reviews', __name__) # Change from 'games' to 'reviews'

@reviews_bp.route('/reviews', methods=['POST'])
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
    try:
        game_id = game_id.strip()

        limit = int(request.args.get('limit', 10))

        from services.firebase import db

        reviews_query = db.collection('reviews') \
            .where('gameId', '==', game_id) \
            .order_by('timestamp', direction='DESCENDING') \
            .limit(limit)

        reviews_docs = reviews_query.stream()
        reviews = [doc.to_dict() for doc in reviews_docs]

        return jsonify(reviews), 200

    except Exception as e:
        print(f"Error in get_game_reviews: {str(e)}")
        return jsonify({"error": str(e)}), 500


@reviews_bp.route('/user/<user_id>', methods=['GET']) # Change from '/games/user/<user_id>' to '/user/<user_id>' | Method: GET (Get reviews by a user)
def get_user_reviews(user_id):
    reviews_docs = db.collection('reviews').where('userId', '==', user_id).stream()
    reviews = [doc.to_dict() for doc in reviews_docs]
    return jsonify(reviews), 200

# Add a route to match frontend expectation
@reviews_bp.route('/games/<game_id>/reviews', methods=['GET'])
def get_reviews_for_game(game_id):
    # Fetch reviews for this game from Firebase
    reviews_ref = db.collection('reviews').where('gameId', '==', game_id)
    reviews = []
    for doc in reviews_ref.stream():
        review = doc.to_dict()
        # Fetch user info for each review
        user_doc = db.collection('users').document(review['userId']).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            review['user'] = {
                'username': user_data.get('username', 'Unknown'),
                'profilePicture': user_data.get('profilePicture', None)
            }
        else:
            review['user'] = {
                'username': 'Unknown',
                'profilePicture': None
            }
        reviews.append(review)
    return jsonify(reviews), 200