# replace_games.py
import firebase_admin
from firebase_admin import credentials, firestore
import time
import os

# Initialize Firebase
if not firebase_admin._apps:
    cred = credentials.Certificate("firebase-key.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

# First, delete all existing games
def delete_all_games():
    print("Deleting existing games...")
    
    # Get all games
    games_ref = db.collection('games').stream()
    deleted_count = 0
    
    for game in games_ref:
        game.reference.delete()
        deleted_count += 1
    
    print(f"Deleted {deleted_count} games")

# New game data
new_games = [
    {
        "apiSourceId": "custom:1001",
        "title": "Celestial Odyssey",
        "coverImage": "https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_1280.jpg",
        "description": "Embark on an epic journey through the cosmos, exploring distant galaxies and unraveling the mysteries of the universe.",
        "releaseDate": "May 15, 2025",
        "developers": ["Cosmic Studios"],
        "genres": ["Adventure", "RPG", "Sci-Fi"],
        "platforms": ["windows", "playstation", "xbox"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1002",
        "title": "Knights of the Realm",
        "coverImage": "https://cdn.pixabay.com/photo/2017/01/31/20/45/castle-2027112_1280.jpg",
        "description": "A medieval fantasy adventure where you lead a band of knights to restore peace to a kingdom plagued by dark forces.",
        "releaseDate": "March 10, 2025",
        "developers": ["Epic Games"],
        "genres": ["RPG", "Strategy", "Fantasy"],
        "platforms": ["windows", "mac"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1003",
        "title": "Ocean Explorer",
        "coverImage": "https://cdn.pixabay.com/photo/2018/04/06/14/17/lagoon-3295853_1280.jpg",
        "description": "Dive into the depths of uncharted oceans to discover vibrant marine life and lost civilizations in this open-world adventure.",
        "releaseDate": "June 22, 2025",
        "developers": ["Deep Blue Interactive"],
        "genres": ["Adventure", "Simulation", "Education"],
        "platforms": ["windows", "mac", "nintendo"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1004",
        "title": "Formula Racing Pro",
        "coverImage": "https://cdn.pixabay.com/photo/2016/11/22/23/44/porsche-1851246_1280.jpg",
        "description": "Experience the thrill of high-speed racing in this realistic simulation featuring real-world tracks and advanced physics.",
        "releaseDate": "April 8, 2025",
        "developers": ["Velocity Games"],
        "genres": ["Racing", "Simulation", "Sports"],
        "platforms": ["windows", "playstation", "xbox"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1005",
        "title": "Cybernetic Revolution",
        "coverImage": "https://cdn.pixabay.com/photo/2018/03/13/10/09/binary-3222827_1280.jpg",
        "description": "In a dystopian future where AI controls society, lead a resistance movement to reclaim humanity's freedom.",
        "releaseDate": "May 30, 2025",
        "developers": ["Future Tech Studios"],
        "genres": ["Action", "RPG", "Cyberpunk"],
        "platforms": ["windows", "playstation"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1006",
        "title": "Wilderness Survival",
        "coverImage": "https://cdn.pixabay.com/photo/2015/07/09/22/45/tree-838667_1280.jpg",
        "description": "Test your survival skills in diverse wilderness environments with realistic weather systems and wildlife interactions.",
        "releaseDate": "January 25, 2025",
        "developers": ["Natural World Games"],
        "genres": ["Survival", "Simulation", "Open World"],
        "platforms": ["windows", "xbox"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1007",
        "title": "Tactical Command",
        "coverImage": "https://cdn.pixabay.com/photo/2017/06/03/05/41/board-game-2368571_1280.jpg",
        "description": "Lead your elite squad through challenging missions in this turn-based tactical strategy game with permadeath mechanics.",
        "releaseDate": "February 12, 2025",
        "developers": ["Strategy First"],
        "genres": ["Strategy", "Tactical", "Turn-Based"],
        "platforms": ["windows", "mac", "linux"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1008",
        "title": "City Builder 2100",
        "coverImage": "https://cdn.pixabay.com/photo/2019/05/30/11/29/city-4239352_1280.jpg",
        "description": "Design and manage the city of the future with advanced simulation of economy, ecology, and citizen happiness.",
        "releaseDate": "April 3, 2025",
        "developers": ["Metropolis Games"],
        "genres": ["Simulation", "Strategy", "Management"],
        "platforms": ["windows", "mac"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1009",
        "title": "Melody Maker",
        "coverImage": "https://cdn.pixabay.com/photo/2015/05/07/11/02/guitar-756326_1280.jpg",
        "description": "Create music, form a band, and rise to stardom in this innovative music simulation game with realistic instruments.",
        "releaseDate": "March 17, 2025",
        "developers": ["Harmony Studios"],
        "genres": ["Simulation", "Music", "Creative"],
        "platforms": ["windows", "playstation", "xbox"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1010",
        "title": "Lost Artifacts",
        "coverImage": "https://cdn.pixabay.com/photo/2015/07/15/01/50/temple-845393_1280.jpg",
        "description": "Travel the world as an archaeologist uncovering ancient artifacts and solving historical mysteries in this adventure game.",
        "releaseDate": "June 5, 2025",
        "developers": ["Historical Games Inc."],
        "genres": ["Adventure", "Puzzle", "Educational"],
        "platforms": ["windows", "mac", "mobile"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1011",
        "title": "Space Colony",
        "coverImage": "https://cdn.pixabay.com/photo/2016/01/19/17/57/earth-1149733_1280.jpg",
        "description": "Build and manage a thriving colony on a distant planet, dealing with alien environments and resource management.",
        "releaseDate": "July 12, 2025",
        "developers": ["Frontier Games"],
        "genres": ["Simulation", "Strategy", "Sci-Fi"],
        "platforms": ["windows", "mac"],
        "importTimestamp": time.time()
    },
    {
        "apiSourceId": "custom:1012",
        "title": "Legendary Heroes",
        "coverImage": "https://cdn.pixabay.com/photo/2017/07/22/11/46/adventure-2528477_1280.jpg",
        "description": "Assemble a team of heroes with unique abilities to battle mythical creatures and save the world from ancient evil.",
        "releaseDate": "April 25, 2025",
        "developers": ["Epic Quests Studios"],
        "genres": ["RPG", "Action", "Fantasy"],
        "platforms": ["windows", "playstation", "xbox", "nintendo"],
        "importTimestamp": time.time()
    }
]

# Add new games to Firestore
def add_new_games():
    print("Adding new games...")
    
    for game in new_games:
        db.collection('games').document(game["apiSourceId"]).set(game)
        print(f"Added: {game['title']}")
    
    print(f"Added {len(new_games)} new games")

if __name__ == "__main__":
    # First delete all existing games
    delete_all_games()
    
    # Then add the new ones
    add_new_games()
    
    print("Game data replacement complete!")