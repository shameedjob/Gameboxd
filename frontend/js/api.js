// api.js
// API service for Gamebox

class GameboxAPI {
    static BASE_URL = '/api';
    
    static async request(endpoint, options = {}) {
        try {
            console.log(`Making request to: ${this.BASE_URL}/${endpoint}`);
            
            const token = localStorage.getItem('token');
            if (token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${token}`
                };
            }
            
            const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getGames(limit = 12) {
        return this.request(`games?limit=${limit}`);
    }

    static async searchGames(query, limit = 12) {
        return this.request(`games/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    }
    
    static async getGameDetails(gameId) {
        return this.request(`games/${gameId}`);
    }

    static async login(credentials) {
        return this.request('auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }
    
    static async register(userData) {
        return this.request('auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }
    
    static async getCurrentUser() {
        return this.request('auth/me');
    }
}

export default GameboxAPI;