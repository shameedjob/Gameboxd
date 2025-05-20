# Description: This module provides a service to interact with the Steam API.

import requests
import time
import sortedcontainers

def ord_key(value):
    return ord(value.get("name").lower())

class SteamAPI:
    """Steam API service for retrieving game data from Steam"""
    def __init__(self):
        self.apps = []
    @staticmethod
    def get_all_games(limit=100):
        """Get a list of games from Steam"""
        url = "https://api.steampowered.com/ISteamApps/GetAppList/v2/"
        
        try:
            print(len(SteamAPI.apps))
            if len(SteamAPI.apps) == 0:
                response = requests.get(url)
                if response.status_code == 200:
                    data = response.json()
                    SteamAPI.apps = data.get('applist', {}).get('apps', [])
                    print(len(SteamAPI.apps))
                else:
                    print(f"Error fetching game list: {response.status_code}")
                    return []

            valid_apps = [app for app in SteamAPI.apps if app.get('name')]
            print(len(valid_apps))
            sorted_apps = sortedcontainers.SortedList(key=lambda x: x['name'].lower())
            sorted_apps.update(valid_apps)
            print("sorted_apps", len(sorted_apps))
            # Filter out entries with empty names and limit the results
            return sorted_apps[:limit]
        except Exception as e:
            print(f"Error in get_all_games: {e}")
            return []
    
    @staticmethod
    def search_games(query, limit=20):
        """Search for games by name"""
        print("query", query)
        if len(query) < 3:
            return []
        
        query = query.lower()
        all_games = SteamAPI.get_all_games(-1)  # Get a larger list to search through
        print("all_games", len(all_games))
        # query_max = chr(ord(query[0])+1)+query[1:]
        # it = all_games.irange({'name': query}, {'name': query_max})
        return [game for game in all_games if query in game.get('name', '').lower()][:limit]
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
        

SteamAPI.apps = []