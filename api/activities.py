# Description: This file contains the activities blueprint which is responsible for handling the activities endpoints.
# The activities are a way to track user actions like creating a list or adding a game to favorites.
# The API allows users to get their activity feed and get activities by a user.

from flask import Blueprint, request, jsonify
from services.firebase import db

activities_bp = Blueprint('activities', __name__)

@activities_bp.route('/feed/<user_id>', methods=['GET']) # Change from '/activities/feed/<user_id>' to '/feed/<user_id>' | Method: GET (Get activity feed)
def get_activity_feed(user_id):
    # In a real app, you'd get followed users
    # For dev, just return all activities
    activities_docs = db.collection('activities').order_by('timestamp', direction='DESCENDING').limit(20).stream()
    activities = [doc.to_dict() for doc in activities_docs]
    return jsonify(activities), 200

@activities_bp.route('/user/<user_id>', methods=['GET']) # Change from '/activities/user/<user_id>' to '/user/<user_id>' | Method: GET (Get activities by a user)
def get_user_activities(user_id):
    activities_docs = db.collection('activities').where('userId', '==', user_id).stream() # got rid of order by (FAILED 500)
    activities = [doc.to_dict() for doc in activities_docs] 
    return jsonify(activities), 200