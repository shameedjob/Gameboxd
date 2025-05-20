# Description: This file contains the API endpoints for games.
# The API allows users to get all games, search for games, and get details for a game.

from flask import Blueprint, request, jsonify
from services.steam_api import SteamAPI
from services.firebase import db
import time

games_bp = Blueprint('games', __name__)

@games_bp.route('/', methods=['GET']) # Change from '/games' to '/' | Method: GET (Get all games)
def get_games():
    try:
        # Get query parameters
        limit = request.args.get('limit', default=20, type=int)
        
        # Try to get games from Firebase first
        games_ref = db.collection('games').limit(limit).stream()
        games = [doc.to_dict() for doc in games_ref]
        
        # If no games in Firebase yet, fetch from Steam API
        if not games:
            print("No games in Firebase, fetching from Steam API...")
            steam_games = SteamAPI.get_popular_games(limit)
            
            # Get details for each game and store in Firebase
            games = []
            for game in steam_games:
                app_id = game.get('appid')
                details = SteamAPI.get_game_details(app_id)
                
                if details:
                    game_data = {
                        'title': details.get('name'),
                        'coverImage': details.get('header_image'),
                        'releaseDate': details.get('release_date', {}).get('date'),
                        'platforms': [
                            platform for platform, has_support in details.get('platforms', {}).items() 
                            if has_support
                        ],
                        'developers': details.get('developers', []),
                        'genres': [genre.get('description') for genre in details.get('genres', [])],
                        'apiSourceId': f"steam:{app_id}",
                        'importTimestamp': time.time()
                    }
                    
                    # Add to Firebase
                    db.collection('games').document(f"steam:{app_id}").set(game_data)
                    games.append(game_data)
        
        print(f"Found {len(games)} games in Firebase")
        return jsonify(games), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@games_bp.route('/search', methods=['GET']) # Change from '/games/search' to '/search' | Method: GET (Search games)
def search_games():
    try:
        print("Searching for games...")
        query = request.args.get('q', '')
        if not query:
            return jsonify({"error": "Search query is required"}), 400
        
        limit = request.args.get('limit', default=20, type=int)
        
        # Search in Firebase first
        results = db.collection('games').where('title', '>=', query).where('title', '<=', query + '\uf8ff').limit(limit).stream()
        games = [doc.to_dict() for doc in results]
        
        # If no results, search using Steam API
        if not games:
            steam_games = SteamAPI.search_games(query, limit)
            
            games = []
            for game in steam_games:
                game_data = {
                    'title': game.get('name'),
                    'apiSourceId': f"steam:{game.get('appid')}",
                }
                games.append(game_data)
        
        return jsonify(games), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@games_bp.route('/<game_id>', methods=['GET']) # Change from '/games/<game_id>' to '/<game_id>' | Method: GET (Get game details)
def get_game(game_id):
    try:
        # Check if game exists in Firebase
        game_doc = db.collection('games').document(game_id).get()
        
        if game_doc.exists:
            return jsonify(game_doc.to_dict()), 200
        
        # If not in Firebase but is a Steam game ID
        if game_id.startswith('steam:'):
            app_id = game_id.split(':')[1]
            details = SteamAPI.get_game_details(app_id)
            
            if details:
                game_data = {
                    'title': details.get('name'),
                    'coverImage': details.get('header_image'),
                    'releaseDate': details.get('release_date', {}).get('date'),
                    'platforms': [
                        platform for platform, has_support in details.get('platforms', {}).items() 
                        if has_support
                    ],
                    'developers': details.get('developers', []),
                    'genres': [genre.get('description') for genre in details.get('genres', [])],
                    'apiSourceId': game_id,
                    'description': details.get('detailed_description'),
                    'importTimestamp': time.time()
                }
                
                # Add to Firebase for future requests
                db.collection('games').document(game_id).set(game_data)
                
                return jsonify(game_data), 200
        
        return jsonify({"error": "Game not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@games_bp.route('/user/<user_id>/currently-playing', methods=['GET'])
def get_currently_playing(user_id):
    try:
        # Get user's currently playing games from Firebase
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        currently_playing = user_data.get('currentlyPlaying', [])

        # Get details for each game
        games = []
        for game_id in currently_playing:
            game_doc = db.collection('games').document(game_id).get()
            if game_doc.exists:
                games.append(game_doc.to_dict())

        return jsonify(games), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@games_bp.route('/user/<user_id>/currently-playing', methods=['POST'])
def add_currently_playing(user_id):
    try:
        # Get Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization required"}), 401
        
        # Simple check if the token contains the user ID (for development)
        token = auth_header.split('Bearer ')[1]
        if user_id not in token:
            return jsonify({"error": "Unauthorized to update this profile"}), 403

        data = request.json
        game_id = data.get('gameId')
        
        if not game_id:
            return jsonify({"error": "Game ID is required"}), 400

        # Get current list
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        currently_playing = user_data.get('currentlyPlaying', [])

        # Add game if not already in list
        if game_id not in currently_playing:
            currently_playing.append(game_id)
            db.collection('users').document(user_id).update({
                "currentlyPlaying": currently_playing
            })

        return jsonify({"message": "Game added to currently playing"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@games_bp.route('/user/<user_id>/currently-playing/<game_id>', methods=['DELETE'])
def remove_currently_playing(user_id, game_id):
    try:
        # Get Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization required"}), 401
        
        # Simple check if the token contains the user ID (for development)
        token = auth_header.split('Bearer ')[1]
        if user_id not in token:
            return jsonify({"error": "Unauthorized to update this profile"}), 403

        # Get current list
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        currently_playing = user_data.get('currentlyPlaying', [])

        # Remove game if in list
        if game_id in currently_playing:
            currently_playing.remove(game_id)
            db.collection('users').document(user_id).update({
                "currentlyPlaying": currently_playing
            })

        return jsonify({"message": "Game removed from currently playing"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500