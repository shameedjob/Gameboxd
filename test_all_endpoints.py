import requests
import json
import time
import uuid
import sys

# Configuration
BASE_URL = "http://localhost:5001/api"  # Using port 5001 to avoid AirPlay conflict
TEST_USER = {
    "username": f"tester_{uuid.uuid4().hex[:6]}",
    "email": f"test_{uuid.uuid4().hex[:6]}@example.com",
    "password": "TestPassword123!"
}

# Global variables to store data between tests
auth_data = {
    "user_id": None,
    "token": None
}

game_data = {
    "game_id": None,
    "title": None
}

review_data = {
    "review_id": None
}

list_data = {
    "list_id": None
}

# Helper functions
def print_header(title):
    """Print a formatted header for test sections"""
    print(f"\n{'=' * 50}")
    print(f"  {title}")
    print(f"{'=' * 50}")

def print_test(name, success=None):
    """Print a test result with appropriate formatting"""
    if success is None:
        print(f"\n--- {name} ---")
    elif success:
        print(f"  ✅ {name}: PASSED")
    else:
        print(f"  ❌ {name}: FAILED")

def make_request(method, endpoint, json_data=None, token=None, params=None):
    """Make an API request with proper error handling"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    url = f"{BASE_URL}/{endpoint}"
    
    try:
        if method.lower() == 'get':
            response = requests.get(url, headers=headers, params=params)
        elif method.lower() == 'post':
            response = requests.post(url, json=json_data, headers=headers)
        elif method.lower() == 'put':
            response = requests.put(url, json=json_data, headers=headers)
        elif method.lower() == 'delete':
            response = requests.delete(url, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return None
            
        # Check content type
        if 'application/json' in response.headers.get('Content-Type', ''):
            try:
                data = response.json()
                return response.status_code, data
            except json.JSONDecodeError:
                print(f"Invalid JSON response: {response.text[:200]}...")
                return response.status_code, None
        else:
            print(f"Non-JSON response: {response.headers.get('Content-Type')}")
            print(f"Response text: {response.text[:200]}...")
            return response.status_code, None
            
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None, None

# Test functions
def test_auth():
    """Test authentication endpoints"""
    print_header("TESTING AUTHENTICATION")
    results = {}
    
    # Test registration
    print_test("Register User")
    status, data = make_request('post', 'auth/register', TEST_USER)
    
    if status == 201 and data and 'userId' in data:
        auth_data["user_id"] = data['userId']
        print(f"  Created user: {auth_data['user_id']}")
        results["register"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["register"] = False
    
    # Test login
    print_test("Login")
    login_credentials = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    status, data = make_request('post', 'auth/login', login_credentials)
    
    if status == 200 and data and 'token' in data:
        auth_data["token"] = data['token']
        print(f"  Got token: {auth_data['token'][:15]}...")
        results["login"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["login"] = False
    
    # Test get current user
    print_test("Get Current User")
    if not auth_data["token"]:
        print("  Skipped (no authentication token)")
        results["get_me"] = False
    else:
        status, data = make_request('get', 'auth/me', token=auth_data["token"])
        
        if status == 200 and data and 'userId' in data:
            print(f"  Got user data: {data['username']}")
            results["get_me"] = True
        else:
            print(f"  Failed with status {status}: {data}")
            results["get_me"] = False
    
    # Summary
    print("\nAuth Tests Summary:")
    for test, passed in results.items():
        print_test(test, passed)
    
    return all(results.values())

def test_games():
    """Test game-related endpoints"""
    print_header("TESTING GAMES")
    results = {}
    
    # Test get games
    print_test("Get Games List")
    status, data = make_request('get', 'games')
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} games")
        if len(data) > 0:
            game_data["game_id"] = data[0].get('apiSourceId')
            game_data["title"] = data[0].get('title')
            print(f"  Selected game: {game_data['title']} (ID: {game_data['game_id']})")
        results["get_games"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_games"] = False
    
    # Test get specific game
    print_test("Get Specific Game")
    if not game_data["game_id"]:
        print("  Skipped (no game ID)")
        results["get_game"] = False
    else:
        status, data = make_request('get', f"games/{game_data['game_id']}")
        
        if status == 200 and data and 'title' in data:
            print(f"  Got game: {data['title']}")
            results["get_game"] = True
        else:
            print(f"  Failed with status {status}: {data}")
            results["get_game"] = False
    
    # Test search games
    print_test("Search Games")
    search_term = "Dark"  # Likely to find games with this in the title
    status, data = make_request('get', 'games/search', params={"q": search_term})
    
    if status == 200 and isinstance(data, list):
        print(f"  Found {len(data)} games matching '{search_term}'")
        results["search_games"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["search_games"] = False
    
    # Summary
    print("\nGames Tests Summary:")
    for test, passed in results.items():
        print_test(test, passed)
    
    return all(results.values())

def test_users():
    """Test user-related endpoints"""
    print_header("TESTING USERS")
    results = {}
    
    # Skip all tests if no user ID
    if not auth_data["user_id"] or not auth_data["token"]:
        print("Skipping user tests (no valid authentication)")
        return False
    
    # Test get user profile
    print_test("Get User Profile")
    status, data = make_request('get', f"users/{auth_data['user_id']}")
    
    if status == 200 and data and 'userId' in data:
        print(f"  Got user profile: {data['username']}")
        results["get_profile"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_profile"] = False
    
    # Test update profile
    print_test("Update User Profile")
    update_data = {
        "bio": f"Test bio updated at {time.time()}",
        "profilePicture": "https://example.com/test-avatar.jpg"
    }
    status, data = make_request('put', f"users/{auth_data['user_id']}", update_data, auth_data["token"])
    
    if status == 200 and data:
        print(f"  Updated profile successfully")
        results["update_profile"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["update_profile"] = False
    
    # Test add favorite game
    print_test("Add Game to Favorites")
    if not game_data["game_id"]:
        print("  Skipped (no game ID)")
        results["add_favorite"] = False
    else:
        favorite_data = {"gameId": game_data["game_id"]}
        status, data = make_request(
            'post', 
            f"users/{auth_data['user_id']}/favorites", 
            favorite_data, 
            auth_data["token"]
        )
        
        if status in [200, 201]:
            print(f"  Added game to favorites")
            results["add_favorite"] = True
        else:
            print(f"  Failed with status {status}: {data}")
            results["add_favorite"] = False
    
    # Test get favorites
    print_test("Get User Favorites")
    status, data = make_request('get', f"users/{auth_data['user_id']}/favorites")
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} favorite games")
        results["get_favorites"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_favorites"] = False
    
    # Summary
    print("\nUsers Tests Summary:")
    for test, passed in results.items():
        print_test(test, passed)
    
    return all(results.values())

def test_reviews():
    """Test review-related endpoints"""
    print_header("TESTING REVIEWS")
    results = {}
    
    # Skip if no auth or game
    if not auth_data["token"] or not game_data["game_id"]:
        print("Skipping review tests (missing authentication or game)")
        return False
    
    # Test create review
    print_test("Create Review")
    review_content = {
        "gameId": game_data["game_id"],
        "rating": 4.5,
        "content": f"This is a test review created at {time.time()}. Great game!",
        "timestamp": time.time()
    }
    status, data = make_request('post', 'reviews', review_content, auth_data["token"])
    
    if status == 201 and data and 'reviewId' in data:
        review_data["review_id"] = data['reviewId']
        print(f"  Created review with ID: {review_data['review_id']}")
        results["create_review"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["create_review"] = False
    
    # Test get reviews for game
    print_test("Get Game Reviews")
    status, data = make_request('get', f"reviews/game/{game_data['game_id']}")
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} reviews for game")
        results["get_game_reviews"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_game_reviews"] = False
    
    # Test get user reviews
    print_test("Get User Reviews")
    status, data = make_request('get', f"reviews/user/{auth_data['user_id']}")
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} reviews by user")
        results["get_user_reviews"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_user_reviews"] = False
    
    # Summary
    print("\nReviews Tests Summary:")
    for test, passed in results.items():
        print_test(test, passed)
    
    return all(results.values())

def test_lists():
    """Test list-related endpoints"""
    print_header("TESTING LISTS")
    results = {}
    
    # Skip if no auth
    if not auth_data["token"]:
        print("Skipping list tests (no authentication)")
        return False
    
    # Test create list
    print_test("Create Game List")
    list_content = {
        "title": f"Test List {uuid.uuid4().hex[:6]}",
        "description": "This is a test game list created by the API test script",
        "games": [game_data["game_id"]] if game_data["game_id"] else [],
        "isPublic": True,
        "timestamp": time.time()
    }
    status, data = make_request('post', 'lists', list_content, auth_data["token"])
    
    if status == 201 and data and 'listId' in data:
        list_data["list_id"] = data['listId']
        print(f"  Created list with ID: {list_data['list_id']}")
        results["create_list"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["create_list"] = False
    
    # Test get specific list
    print_test("Get Specific List")
    if not list_data["list_id"]:
        print("  Skipped (no list ID)")
        results["get_list"] = False
    else:
        status, data = make_request('get', f"lists/{list_data['list_id']}")
        
        if status == 200 and data and 'title' in data:
            print(f"  Retrieved list: {data['title']}")
            results["get_list"] = True
        else:
            print(f"  Failed with status {status}: {data}")
            results["get_list"] = False
    
    # Test get user lists
    print_test("Get User Lists")
    status, data = make_request('get', f"lists/user/{auth_data['user_id']}")
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} lists for user")
        results["get_user_lists"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_user_lists"] = False
    
    # Summary
    print("\nLists Tests Summary:")
    for test, passed in results.items():
        print_test(test, passed)
    
    return all(results.values())

def test_activities():
    """Test activity-related endpoints"""
    print_header("TESTING ACTIVITIES")
    results = {}
    
    # Skip if no auth
    if not auth_data["token"] or not auth_data["user_id"]:
        print("Skipping activity tests (no authentication)")
        return False
    
    # Test get activity feed
    print_test("Get Activity Feed")
    status, data = make_request('get', f"activities/feed/{auth_data['user_id']}", token=auth_data["token"])
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} activities in feed")
        results["get_feed"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_feed"] = False
    
    # Test get user activities
    print_test("Get User Activities")
    status, data = make_request('get', f"activities/user/{auth_data['user_id']}")
    
    if status == 200 and isinstance(data, list):
        print(f"  Retrieved {len(data)} activities by user")
        results["get_user_activities"] = True
    else:
        print(f"  Failed with status {status}: {data}")
        results["get_user_activities"] = False
    
    # Summary
    print("\nActivities Tests Summary:")
    for test, passed in results.items():
        print_test(test, passed)
    
    return all(results.values())

def run_all_tests():
    """Run all test categories and report results"""
    test_results = {}
    
    # Run tests in sequence
    test_results["auth"] = test_auth()
    test_results["games"] = test_games()
    test_results["users"] = test_users()
    test_results["reviews"] = test_reviews()
    test_results["lists"] = test_lists()
    test_results["activities"] = test_activities()
    
    # Overall summary
    print_header("OVERALL TEST RESULTS")
    for category, passed in test_results.items():
        print_test(category.upper(), passed)
    
    # Final verdict
    success_count = sum(1 for result in test_results.values() if result)
    total_count = len(test_results)
    print(f"\n{success_count}/{total_count} test categories passed")
    
    return all(test_results.values())

# Allow running specific test categories
if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific test category
        category = sys.argv[1].lower()
        
        if category == "auth":
            test_auth()
        elif category == "games":
            test_games()
        elif category == "users":
            test_users()
        elif category == "reviews":
            test_reviews()
        elif category == "lists":
            test_lists()
        elif category == "activities":
            test_activities()
        else:
            print(f"Unknown test category: {category}")
            print("Available categories: auth, games, users, reviews, lists, activities")
    else:
        # Run all tests
        run_all_tests()
        
    """
    This comprehensive script tests:

    Authentication

        User registration
        Login
        Getting current user info


    Games

        Retrieving game list
        Getting a specific game
        Searching for games


    Users

        Getting user profiles
        Updating profiles
        Managing favorite games


    Reviews

        Creating reviews
        Getting game reviews
        Getting reviews by user


    Lists

        Creating game lists
        Getting lists
        Managing list content


    Activities

        Getting activity feeds
        Getting user activities

    """