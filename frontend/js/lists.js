
import GameboxAPI from './api.js'; import { showToast, showLoading, hideLoading, formatDate } from './utils.js'; import { isAuthenticated, getCurrentUserId } from './auth.js'; import { loadGameDetails } from './games.js';


if (window.location.hash.startsWith('#list/')) {
    const listId = window.location.hash.split('/')[1];
    if (listId) {
        loadListDetails(listId);
    }
}


if (window.location.hash === '#create-list') {
    showCreateListPage();
}
}


currentListId = listId;


showLoading();

try {
    // Fetch list details
    const list = await GameboxAPI.getList(listId);
    
    if (!list) {
        throw new Error('List not found');
    }
    
    updateListDetailsUI(list);
    
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    listPage.classList.remove('hidden');
    
    window.location.hash = `list/${listId}`;
    
    // Hide loading
    hideLoading();
} catch (error) {
    hideLoading();
    console.error('Error loading list details:', error);
    showToast('Failed to load list details', 'error');
    
    // Redirect to home page
    window.location.hash = '';
}
}

try {
    const creator = await GameboxAPI.getUserProfile(list.userId);
    listCreator.textContent = creator.username;
    listCreator.href = `#profile/${creator.userId}`;
} catch (error) {
    console.error('Error loading list creator:', error);
    listCreator.textContent = 'Unknown';
    listCreator.href = '#';
}

const currentUserId = getCurrentUserId();
if (currentUserId && currentUserId === list.userId) {
    editListBtn.classList.remove('hidden');
} else {
    editListBtn.classList.add('hidden');
}

await loadListGames(list.games);

updateListCovers(list.games);
}

if (!gameIds || gameIds.length === 0) {
    listGames.innerHTML = `
        <div class="col-span-full text-center text-gray-400 py-8">
            This list doesn't contain any games yet.
        </div>
    `;
    return;
}

// Loading skeletons
const skeletonCount = Math.min(gameIds.length, 10);
for (let i = 0; i < skeletonCount; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'animate-pulse';
    skeleton.innerHTML = `
        <div class="bg-gray-700 rounded-md h-56 mb-2"></div>
        <div class="bg-gray-700 h-4 rounded w-3/4 mb-2"></div>
        <div class="bg-gray-700 h-4 rounded w-1/2"></div>
    `;
    listGames.appendChild(skeleton);
}

// Load game details for each game
try {
    const gamePromises = gameIds.map(id => GameboxAPI.getGameDetails(id));
    const games = await Promise.all(gamePromises);
    
    // Clear loading skeletons
    listGames.innerHTML = '';
    

    games.forEach(game => {
        if (!game) return;
        
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card cursor-pointer';
        gameCard.innerHTML = `
            <div class="bg-gray-800 rounded-md overflow-hidden">
                <img src="${game.coverImage || 'assets/img/placeholder.png'}" alt="${game.title}" class="w-full aspect-[2/3] object-cover game-poster">
                <div class="p-2">
                    <h3 class="text-white font-semibold truncate">${game.title}</h3>
                    <p class="text-gray-400 text-sm">${game.releaseDate ? formatDate(game.releaseDate) : 'Unknown'}</p>
                </div>
            </div>
        `;
        
        gameCard.addEventListener('click', () => {
            loadGameDetails(game.apiSourceId);
        });
        
        listGames.appendChild(gameCard);
    });
} catch (error) {
    console.error('Error loading list games:', error);
    listGames.innerHTML = `
        <div class="col-span-full text-center text-gray-400 py-8">
            Failed to load games. Please try again later.
        </div>
    `;
}
}

if (!gameIds || gameIds.length === 0) {
    return;
}

const gamesToShow = gameIds.slice(0, 4);

try {
    const gamePromises = gamesToShow.map(id => GameboxAPI.getGameDetails(id));
    const games = await Promise.all(gamePromises);
    
    // Update cover images
    games.forEach((game, index) => {
        if (game && game.coverImage && listCovers[index]) {
            listCovers[index].src = game.coverImage;
        }
    });
} catch (error) {
    console.error('Error loading list cover images:', error);
}
}

document.querySelectorAll('main > section').forEach(section => {
    section.classList.add('hidden');
});

createListPage.classList.remove('hidden');

createListForm.reset();

window.location.hash = 'create-list';
}

if (!isAuthenticated()) {
    showToast('Please log in to create a list', 'error');
    window.location.hash = 'login';
    return;
}

// Get form data
const title = document.getElementById('list-title-input').value.trim();
const description = document.getElementById('list-description-input').value.trim();
const isPublic = document.getElementById('list-public-checkbox').checked;

// Validate
if (!title) {
    showToast('Please enter a title', 'error');
    return;
}

const listData = {
    title,
    description,
    isPublic,
    games: [],
    timestamp: Date.now()
};

try {
    showLoading();
    const response = await GameboxAPI.createList(listData);
    hideLoading();
    
    if (!response || !response.listId) {
        throw new Error('Failed to create list');
    }
    
    showToast('List created successfully!', 'success');
    
    window.location.hash = `list/${response.listId}`;
} catch (error) {
    hideLoading();
    console.error('Error creating list:', error);
    showToast('Failed to create list', 'error');
}
}

const tempInput = document.createElement('input');
tempInput.value = `${window.location.origin}${window.location.pathname}#list/${currentListId}`;
document.body.appendChild(tempInput);
tempInput.select();
document.execCommand('copy');
document.body.removeChild(tempInput);

showToast('List URL copied to clipboard!', 'success');
}

showToast('List editing will be implemented in a future update', 'info');
}

Export functions export { showCreateListPage };

