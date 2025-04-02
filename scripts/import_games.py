# NOT USING YETTTT (MAYBE IN THE FUTURE)

# # Description: Import games from Steam to Firebase Firestore

# # scripts/import_steam_games.py
# import firebase_admin # type: ignore
# from firebase_admin import credentials, firestore # type: ignore
# import requests
# import time
# import os

# # Initialize Firebase
# if os.path.exists("firebase-key.json"):
#     cred = credentials.Certificate("firebase-key.json")
#     firebase_admin.initialize_app(cred)
# else:
#     firebase_admin.initialize_app()

# db = firestore.client()

# def get_popular_games(limit=50):
#     """Get popular games from Steam featured section"""
#     url = "https://store.steampowered.com/api/featured"
    
#     response = requests.get(url)
#     if response.status_code == 200:
#         data = response.json()
#         featured = data.get('featured_win', [])
#         return featured[:limit]
    
#     return []

# def get_game_details(app_id):
#     """Get detailed information about a specific game"""
#     url = f"https://store.steampowered.com/api/appdetails?appids={app_id}"
    
#     response = requests.get(url)
#     if response.status_code == 200:
#         data = response.json()
        
#         if data and data.get(str(app_id), {}).get('success'):
#             return data.get(str(app_id)).get('data')
    
#     return None

# def import_games(limit=20):
#     """Import games from Steam to Firebase"""
#     print(f"Getting {limit} popular games from Steam...")
#     popular_games = get_popular_games(limit)
    
#     imported_count = 0
#     for game in popular_games:
#         app_id = game.get('id')
#         print(f"Importing game {app_id}: {game.get('name')}...")
        
#         details = get_game_details(app_id)
#         if details:
#             game_data = {
#                 'title': details.get('name'),
#                 'coverImage': details.get('header_image'),
#                 'releaseDate': details.get('release_date', {}).get('date'),
#                 'platforms': [
#                     platform for platform, has_support in details.get('platforms', {}).items() 
#                     if has_support
#                 ],
#                 'developers': details.get('developers', []),
#                 'genres': [genre.get('description') for genre in details.get('genres', [])],
#                 'apiSourceId': f"steam:{app_id}",
#                 'description': details.get('short_description'),
#                 'importTimestamp': time.time()
#             }
            
#             # Add to Firebase
#             db.collection('games').document(f"steam:{app_id}").set(game_data)
#             imported_count += 1
            
#             print(f"✅ Imported: {game_data['title']}")
#         else:
#             print(f"❌ Failed to get details for {app_id}")
        
#         # Respect API rate limits with a small delay
#         time.sleep(1)
    
#     print(f"\nImport completed! Imported {imported_count} games.")

# if __name__ == "__main__":
#     print("Starting Steam game import...")
#     import_games(20)  # Import 20 popular games