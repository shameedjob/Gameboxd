# import_games.py
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import time
import os

# Initialize Firebase
cred = credentials.Certificate("firebase-key.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

def get_popular_games(limit=20):
    """Get popular games from Steam featured section"""
    url = "https://store.steampowered.com/api/featuredcategories"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            
            # Try to get games from different categories
            categories = ['top_sellers', 'new_releases', 'specials']
            games = []
            
            for category in categories:
                if category in data and 'items' in data[category]:
                    for item in data[category]['items'][:limit//2]:  # Take half the limit from each category
                        game = {
                            'appid': item.get('id'),
                            'name': item.get('name'),
                            'discounted': item.get('discounted', False),
                            'discount_percent': item.get('discount_percent', 0),
                            'header_image': item.get('header_image', '')
                        }
                        games.append(game)
                        
                        if len(games) >= limit:
                            break
                
                if len(games) >= limit:
                    break
            
            return games
        else:
            print(f"Error fetching popular games: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error in get_popular_games: {e}")
        return []

def get_game_details(app_id):
    """Get detailed information about a specific game"""
    url = f"https://store.steampowered.com/api/appdetails?appids={app_id}"
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            
            # Check if the request was successful and data is available
            if data and data.get(str(app_id), {}).get('success'):
                return data.get(str(app_id)).get('data')
            else:
                print(f"No data available for app ID {app_id}")
                return None
        else:
            print(f"Error fetching game details: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error in get_game_details: {e}")
        return None

def import_games(limit=12):
    """Import games from Steam to Firebase"""
    print(f"Getting {limit} popular games from Steam...")
    popular_games = get_popular_games(limit)
    
    imported_count = 0
    for game in popular_games:
        app_id = game.get('appid')
        print(f"Importing game {app_id}: {game.get('name')}...")
        
        details = get_game_details(app_id)
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
                'description': details.get('short_description'),
                'importTimestamp': time.time()
            }
            
            # Add to Firebase
            db.collection('games').document(f"steam:{app_id}").set(game_data)
            imported_count += 1
            
            print(f"✅ Imported: {game_data['title']}")
        else:
            print(f"❌ Failed to get details for {app_id}")
        
        # Respect API rate limits with a small delay
        time.sleep(1)
    
    print(f"\nImport completed! Imported {imported_count} games.")

if __name__ == "__main__":
    print("Starting Steam game import...")
    import_games(12)  # Import 12 popular games