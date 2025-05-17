class GameboxAPI {
    static BASE_URL = 'http://127.0.0.1:5001';
    
    static async getGames() {
        try {
            console.log('Fetching games from:', `${this.BASE_URL}/api/games`);
            
            const response = await fetch(`${this.BASE_URL}/api/games`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Games data received:', data);
            
            return data;
        } catch (error) {
            console.error('Error fetching games:', error);
            return [];
        }
    }
}

export default GameboxAPI;