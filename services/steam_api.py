# Description: This module provides a service to interact with the Steam API.

import requests
import time

class SteamAPI:
    """Steam API service for retrieving game data from Steam"""
    
    @staticmethod
    def get_all_games(limit=100):
        """Get a list of games from Steam"""
        url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                apps = data.get('applist', {}).get('apps', [])
                
                # Filter out entries with empty names and limit the results
                valid_apps = [app for app in apps if app.get('name')]
                return valid_apps[:limit]
            else:
                print(f"Error fetching game list: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error in get_all_games: {e}")
            return []
    
    @staticmethod
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
    
    @staticmethod
    def search_games(query, limit=20):
        """Search for games by name"""
        # First get the app list
        all_games = SteamAPI.get_all_games(1000)  # Get a larger list to search through
        
        # Filter games by name containing the query (case-insensitive)
        matching_games = []
        query = query.lower()
        
        for game in all_games:
            if query in game.get('name', '').lower():
                matching_games.append(game)
                if len(matching_games) >= limit:
                    break
        
        return matching_games
    
    @staticmethod
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