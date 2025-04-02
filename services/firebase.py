# Description: Firebase service for managing user, game, review, and activity data.
# This module provides functions to interact with Firebase Firestore for user, game, review, and activity operations.

import firebase_admin # type: ignore
from firebase_admin import credentials, firestore  # type: ignore

# Initialize Firebase
cred = credentials.Certificate("firebase-key.json")
firebase_app = firebase_admin.initialize_app(cred)
db = firestore.client()

# User operations
def get_user(user_id):
    return db.collection('users').document(user_id).get().to_dict()

def create_user(user_data):
    user_ref = db.collection('users').document(user_data['userId'])
    user_ref.set(user_data)
    return user_data

# Game operations
def get_game(game_id):
    return db.collection('games').document(game_id).get().to_dict()

def search_games(query, limit=20):
    return db.collection('games').where('title', '>=', query).where('title', '<=', query + '\uf8ff').limit(limit).get()

# Review operations
def create_review(review_data):
    review_ref = db.collection('reviews').document()
    review_id = review_ref.id
    review_data['reviewId'] = review_id
    review_ref.set(review_data)
    
    # Create activity for this review
    create_activity({
        'userId': review_data['userId'],
        'type': 'review',
        'contentId': review_id,
        'gameId': review_data['gameId'],
        'timestamp': review_data['timestamp']
    })
    
    return review_data

# Activity operations
def create_activity(activity_data):
    activity_ref = db.collection('activities').document()
    activity_id = activity_ref.id
    activity_data['activityId'] = activity_id
    activity_ref.set(activity_data)
    return activity_data

def get_user_activities(user_id, limit=20):
    return db.collection('activities').where('userId', '==', user_id).order_by('timestamp', direction='DESCENDING').limit(limit).get()

def get_feed_activities(user_ids, limit=20):
    return db.collection('activities').where('userId', 'in', user_ids).order_by('timestamp', direction='DESCENDING').limit(limit).get()

# Lists operations
def create_list(list_data):
    list_ref = db.collection('lists').document()
    list_id = list_ref.id
    list_data['listId'] = list_id
    list_ref.set(list_data)
    
    # Create activity for this list
    create_activity({
        'userId': list_data['userId'],
        'type': 'list',
        'contentId': list_id,
        'gameId': None,
        'timestamp': list_data['timestamp']
    })
    
    return list_data