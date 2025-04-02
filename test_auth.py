import requests
import json
import time
import uuid

# Base URL for API
BASE_URL = "http://localhost:5001/api"

# Test data - make email unique to avoid conflicts
TEST_USER = {
    "username": f"testuser_{uuid.uuid4().hex[:8]}",
    "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
    "password": "TestPassword123!"
}

# Global variables to store auth data
user_id = None
auth_token = None

def test_register():
    """Test user registration endpoint"""
    print("\n=== Testing User Registration ===")
    
    # Make the request
    response = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    # Try to get the response text
    print(f"Raw Response: {response.text[:200]}...")
    
    # Try to parse as JSON
    try:
        data = response.json()
        print(f"JSON Response: {json.dumps(data, indent=2)}")
        
        # If successful, save the user ID
        global user_id
        if response.status_code == 201 and 'userId' in data:
            user_id = data['userId']
            print(f"✅ Registration successful! User ID: {user_id}")
            return True
        else:
            print(f"❌ Registration failed with status {response.status_code}")
            return False
            
    except json.JSONDecodeError:
        print("❌ Response is not valid JSON")
        return False

def test_login():
    """Test user login endpoint"""
    print("\n=== Testing User Login ===")
    
    login_data = {
        "email": TEST_USER["email"],
        "password": TEST_USER["password"]
    }
    
    # Make the request
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    
    # Try to get the response text
    print(f"Raw Response: {response.text[:200]}...")
    
    # Try to parse as JSON
    try:
        data = response.json()
        print(f"JSON Response: {json.dumps(data, indent=2)}")
        
        # If successful, save the token
        global auth_token
        if response.status_code == 200 and 'token' in data:
            auth_token = data['token']
            print(f"✅ Login successful! Token: {auth_token[:10]}...")
            return True
        else:
            print(f"❌ Login failed with status {response.status_code}")
            return False
            
    except json.JSONDecodeError:
        print("❌ Response is not valid JSON")
        return False

def test_get_me():
    """Test the 'me' endpoint to get current user info"""
    print("\n=== Testing Get Current User ===")
    
    # Skip if no token
    if not auth_token:
        print("❌ Cannot test /me endpoint without auth token")
        return False
    
    # Setup auth header
    headers = {"Authorization": f"Bearer {auth_token}"}
    
    # Make the request
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    # Try to parse as JSON
    try:
        data = response.json()
        print(f"JSON Response: {json.dumps(data, indent=2)}")
        
        if response.status_code == 200 and 'userId' in data:
            print("✅ Successfully retrieved user info")
            return True
        else:
            print(f"❌ Failed to get user info with status {response.status_code}")
            return False
            
    except json.JSONDecodeError:
        print("❌ Response is not valid JSON")
        print(f"Raw Response: {response.text[:200]}...")
        return False

def run_all_tests():
    """Run all auth tests in sequence"""
    print("Starting auth API tests...\n")
    
    # Store test results
    results = {
        "register": False,
        "login": False,
        "get_me": False
    }
    
    # Run tests in sequence
    results["register"] = test_register()
    
    if results["register"]:
        results["login"] = test_login()
        
        if results["login"]:
            results["get_me"] = test_get_me()
    
    # Print summary
    print("\n=== Test Summary ===")
    for test_name, passed in results.items():
        print(f"{test_name}: {'✅ PASSED' if passed else '❌ FAILED'}")
    
    # Return True only if all tests passed
    return all(results.values())

if __name__ == "__main__":
    success = run_all_tests()
    print(f"\nOverall result: {'✅ ALL TESTS PASSED' if success else '❌ SOME TESTS FAILED'}")