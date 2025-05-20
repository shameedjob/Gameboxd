import { getAuthToken, isAuthenticated, fetchWithAuth } from './auth.js';

// DOM Elements
const profileAvatar = document.getElementById('profile-avatar');
const profileUsername = document.getElementById('profile-username');
const profileBio = document.getElementById('profile-bio');
const gamesCount = document.getElementById('games-count');
const reviewsCount = document.getElementById('reviews-count');
const listsCount = document.getElementById('lists-count');
const recentActivity = document.getElementById('recent-activity');
const recentReviews = document.getElementById('recent-reviews');
const currentlyPlaying = document.getElementById('currently-playing');
const gameLists = document.getElementById('game-lists');
const loading = document.getElementById('loading');

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Format timestamp to relative time
function formatTimestamp(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
}

// Create activity item HTML
function createActivityItem(activity) {
    const activityTypes = {
        'review': 'wrote a review for',
        'favorite': 'added to favorites',
        'list': 'created a list'
    };

    return `
        <div class="flex items-start space-x-4 p-4 bg-gray-700 rounded-lg">
            <img src="${activity.user?.profilePicture || 'assets/img/placeholder.png'}" 
                 alt="User avatar" 
                 class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1">
                <p class="text-gray-300">
                    <span class="font-semibold text-white">${activity.user?.username || 'User'}</span>
                    ${activityTypes[activity.type] || 'performed an action on'}
                    <span class="font-semibold text-white">${activity.game?.title || 'a game'}</span>
                </p>
                <p class="text-sm text-gray-400">${formatTimestamp(activity.timestamp)}</p>
            </div>
        </div>
    `;
}

// Create review item HTML
function createReviewItem(review) {
    return `
        <div class="bg-gray-700 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <img src="${review.user?.profilePicture || 'assets/img/placeholder.png'}" 
                         alt="User avatar" 
                         class="w-8 h-8 rounded-full object-cover">
                    <span class="font-semibold text-white">${review.user?.username || 'User'}</span>
                </div>
                <div class="flex items-center">
                    <span class="text-yellow-400">★</span>
                    <span class="text-white ml-1">${review.rating}/5</span>
                </div>
            </div>
            <p class="text-gray-300 mb-2">${review.content}</p>
            <p class="text-sm text-gray-400">${formatTimestamp(review.timestamp)}</p>
        </div>
    `;
}

// Create game item HTML
function createGameItem(game) {
    return `
        <div class="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
            <img src="${game.coverImage || 'assets/img/placeholder.png'}" 
                 alt="${game.title}" 
                 class="w-16 h-16 object-cover rounded">
            <div>
                <h3 class="font-semibold text-white">${game.title}</h3>
                <p class="text-sm text-gray-400">${game.platforms?.join(', ') || 'Platform'}</p>
            </div>
        </div>
    `;
}

// Create list item HTML
function createListItem(list) {
    return `
        <div class="bg-gray-700 rounded-lg p-4">
            <h3 class="font-semibold text-white mb-2">${list.title}</h3>
            <p class="text-sm text-gray-400">${list.description || 'No description'}</p>
            <p class="text-sm text-gray-400 mt-2">${list.games?.length || 0} games</p>
        </div>
    `;
}

// Fetch user profile
async function fetchUserProfile(userId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/users/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch profile');
        return await response.json();
    } catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}

// Fetch user activities
async function fetchUserActivities(userId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/activities/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        return await response.json();
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
}

// Fetch user reviews
async function fetchUserReviews(userId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/reviews/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return await response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

// Fetch currently playing games
async function fetchCurrentlyPlaying(userId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/games/user/${userId}/currently-playing`);
        if (!response.ok) throw new Error('Failed to fetch currently playing games');
        return await response.json();
    } catch (error) {
        console.error('Error fetching currently playing games:', error);
        return [];
    }
}

// Add game to currently playing
async function addCurrentlyPlaying(userId, gameId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/games/user/${userId}/currently-playing`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gameId })
        });
        if (!response.ok) throw new Error('Failed to add game to currently playing');
        return await response.json();
    } catch (error) {
        console.error('Error adding game to currently playing:', error);
        throw error;
    }
}

// Remove game from currently playing
async function removeCurrentlyPlaying(userId, gameId) {
    try {
        const response = await fetchWithAuth(`${API_BASE_URL}/games/user/${userId}/currently-playing/${gameId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to remove game from currently playing');
        return await response.json();
    } catch (error) {
        console.error('Error removing game from currently playing:', error);
        throw error;
    }
}

// Initialize profile page
async function initializeProfile() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    loading.classList.remove('hidden');
    
    try {
        // Get user ID from token
        const token = getAuthToken();
        const userId = token.split('_')[2]; // Assuming token format: dev_token_<user_id>_<timestamp>

        // Fetch profile data
        const profile = await fetchUserProfile(userId);
        if (profile) {
            profileAvatar.src = profile.profilePicture || 'assets/img/placeholder.png';
            profileUsername.textContent = profile.username;
            profileBio.textContent = profile.bio || 'No bio yet';
            gamesCount.textContent = profile.games?.length || 0;
            reviewsCount.textContent = profile.reviews?.length || 0;
            listsCount.textContent = profile.lists?.length || 0;
        }

        // Fetch and display activities
        const activities = await fetchUserActivities(userId);
        recentActivity.innerHTML = activities
            .slice(0, 5)
            .map(createActivityItem)
            .join('');

        // Fetch and display reviews
        const reviews = await fetchUserReviews(userId);
        recentReviews.innerHTML = reviews
            .slice(0, 3)
            .map(createReviewItem)
            .join('');

        // Fetch and display currently playing games
        const currentlyPlayingGames = await fetchCurrentlyPlaying(userId);
        currentlyPlaying.innerHTML = currentlyPlayingGames
            .map(createGameItem)
            .join('');

        // TODO: Implement game lists section
        // This would require additional API endpoints

    } catch (error) {
        console.error('Error initializing profile:', error);
    } finally {
        loading.classList.add('hidden');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user menu dropdown
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('User menu clicked, toggling dropdown');
            userDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/frontend/index.html';
        });
    }

    // Initialize profile page
    initializeProfile();
}); 