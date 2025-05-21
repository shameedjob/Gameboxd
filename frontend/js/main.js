document.addEventListener('DOMContentLoaded', function() {
    console.log('Gamebox frontend loaded');
    loadGames();
    loadRecentActivity();
    setTimeout(() => {
        setupDirectButtonListeners();
        handleHashChange();
        updateNavbarAuthUI();
    }, 50);
    
    window.addEventListener('hashchange', handleHashChange);
    
    console.log('Welcome to Gamebox!');

    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});

function setupDirectButtonListeners() {
    console.log('Setting up direct button listeners');
    
    document.querySelectorAll('a').forEach(element => {
        const text = element.textContent.trim();
        console.log(`Found element with text: "${text}"`);
        
        if (text.toUpperCase().includes('SIGN IN')) {
            console.log('Found SIGN IN button, attaching listener');
            element.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Sign In button clicked');
                window.location.hash = 'login';
            });
        }
        
        if (text.toUpperCase().includes('JOIN GAMEBOX')) {
            console.log('Found JOIN GAMEBOX button, attaching listener');
            element.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Join Gamebox button clicked');
                window.location.hash = 'register';
            });
        }
    });

    // Only attach to the navbar CREATE ACCOUNT button
    const registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navbar Create Account button clicked');
            window.location.hash = 'register';
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Setting up login form submission handler');
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('Setting up register form submission handler');
        registerForm.addEventListener('submit', handleRegister);
    }
}

function handleHashChange() {
    const hash = window.location.hash;
    console.log('Hash changed to:', hash);
    
    if (hash === '#login') {
        showLoginPage();
    } else if (hash === '#register') {
        showRegisterPage();
    } else if (hash.startsWith('#game/')) {
        const gameId = hash.substring(6);
        showGameDetails(gameId);
    } else {
        showHomePage();
    }
}

function showHomePage() {
    console.log('Showing home page');

    document.querySelectorAll('main > section, #login-page, #register-page').forEach(section => {
        section.classList.add('hidden');
    });

    const home = document.getElementById('home-page');
    if (home) {
        home.classList.remove('hidden');
    }
}

function showLoginPage() {
    console.log('Showing login page');
    document.querySelectorAll('main > section, #register-page').forEach(section => {
        section.classList.add('hidden');
    });
    
    const loginPage = document.getElementById('login-page');
    if (loginPage) {
        console.log('Found and displaying login page');
        loginPage.classList.remove('hidden');
    } else {
        console.error('Login page not found');
    }
}

function showRegisterPage() {
    console.log('Showing register page');
    document.querySelectorAll('main > section, #login-page').forEach(section => {
        section.classList.add('hidden');
    });
    
    const registerPage = document.getElementById('register-page');
    if (registerPage) {
        console.log('Found and displaying register page');
        registerPage.classList.remove('hidden');
    } else {
        console.error('Register page not found');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        console.log('Logging in...');
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        
        console.log('Login successful!');
        
        window.location.hash = '';
        window.location.reload();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.message || 'Please check your credentials'));
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('handleRegister called');
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        console.log('Creating account...');
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        console.log('Fetch sent to /api/auth/register');
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        console.log('Account created successfully!');
        alert('Account created successfully! Please log in.');
        window.location.hash = 'login';
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + (error.message || 'Please try again'));
    }
}

function showGameDetails(gameId) {
    console.log('Showing game details for:', gameId);
    
    // Hide all sections
    document.querySelectorAll('main > section, #login-page, #register-page').forEach(section => {
        section.classList.add('hidden');
    });

    // Create game details section if it doesn't exist
    let gameDetailsSection = document.getElementById('game-details-page');
    if (!gameDetailsSection) {
        gameDetailsSection = document.createElement('section');
        gameDetailsSection.id = 'game-details-page';
        gameDetailsSection.className = 'container mx-auto px-4 py-8';
        document.querySelector('main').appendChild(gameDetailsSection);
    }

    // Show loading state
    gameDetailsSection.innerHTML = `
        <div class="animate-pulse">
            <div class="bg-gray-700 rounded-md h-96 mb-4"></div>
            <div class="bg-gray-700 h-8 rounded w-1/3 mb-4"></div>
            <div class="bg-gray-700 h-4 rounded w-2/3 mb-2"></div>
            <div class="bg-gray-700 h-4 rounded w-1/2"></div>
        </div>
    `;
    gameDetailsSection.classList.remove('hidden');

    // Fetch game details
    fetch(`/api/games/${gameId}`)
        .then(response => response.json())
        .then(game => {
            gameDetailsSection.innerHTML = `
                <div class="flex flex-col md:flex-row gap-8">
                    <div class="md:w-1/3">
                        <img src="${game.coverImage || 'assets/img/placeholder.png'}" 
                             alt="${game.title}" 
                             class="w-full rounded-lg shadow-lg">
                    </div>
                    <div class="md:w-2/3">
                        <h1 class="text-3xl font-bold text-white mb-4">${game.title}</h1>
                        <div class="text-gray-300 mb-6">
                            <p class="mb-2">${game.description || 'No description available.'}</p>
                            <p class="text-sm text-gray-400">Released: ${game.releaseDate || 'Unknown'}</p>
                        </div>
                        
                        <!-- Review Form -->
                        <div id="review-form-container" class="mb-8">
                            <h2 class="text-xl font-bold text-white mb-4">Write a Review</h2>
                            <form id="review-form" class="space-y-4">
                                <div class="flex items-center space-x-2">
                                    <span class="text-gray-300">Rating:</span>
                                    <div class="flex space-x-1">
                                        ${[1,2,3,4,5].map(num => `
                                            <button type="button" class="text-2xl text-gray-400 hover:text-green-500 rating-star" data-rating="${num}">☆</button>
                                        `).join('')}
                                    </div>
                                </div>
                                <textarea id="review-content" 
                                          class="w-full bg-gray-800 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-600" 
                                          rows="4" 
                                          placeholder="Write your review..."></textarea>
                                <button type="submit" 
                                        class="bg-green-700 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium">
                                    Submit Review
                                </button>
                            </form>
                        </div>

                        <!-- Reviews Section -->
                        <div id="reviews-container">
                            <h2 class="text-xl font-bold text-white mb-4">Reviews</h2>
                            <div id="reviews-list" class="space-y-4">
                                <!-- Reviews will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners for rating stars
            const stars = gameDetailsSection.querySelectorAll('.rating-star');
            stars.forEach(star => {
                star.addEventListener('click', () => {
                    const rating = parseInt(star.dataset.rating);
                    stars.forEach(s => {
                        s.textContent = parseInt(s.dataset.rating) <= rating ? '★' : '☆';
                        s.classList.toggle('text-green-500', parseInt(s.dataset.rating) <= rating);
                    });
                    document.getElementById('review-form').dataset.rating = rating;
                });
            });

            // Add event listener for review form
            const reviewForm = document.getElementById('review-form');
            reviewForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const rating = parseInt(reviewForm.dataset.rating || 0);
                const content = document.getElementById('review-content').value.trim();

                if (rating === 0) {
                    alert('Please select a rating');
                    return;
                }

                if (!content) {
                    alert('Please write a review');
                    return;
                }

                try {
                    const response = await fetch('/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({
                            gameId,
                            rating,
                            content
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Failed to submit review');
                    }

                    // Clear form
                    reviewForm.reset();
                    stars.forEach(s => {
                        s.textContent = '☆';
                        s.classList.remove('text-green-500');
                    });
                    delete reviewForm.dataset.rating;

                    // Reload reviews
                    loadGameReviews(gameId);
                } catch (error) {
                    console.error('Error submitting review:', error);
                    alert('Failed to submit review. Please try again.');
                }
            });

            // Load reviews
            loadGameReviews(gameId);
        })
        .catch(error => {
            console.error('Error loading game details:', error);
            gameDetailsSection.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-400">Failed to load game details. Please try again later.</p>
                    <p class="text-gray-500">${error.message}</p>
                </div>
            `;
        });
}

async function loadGameReviews(gameId) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;

    try {
        const response = await fetch(`/api/games/${gameId}/reviews`);
        const reviews = await response.json();

        if (!reviews || reviews.length === 0) {
            reviewsList.innerHTML = `
                <p class="text-gray-400 text-center py-4">No reviews yet. Be the first to review!</p>
            `;
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
            <div class="bg-gray-800 rounded-lg p-4">
                <div class="flex items-center mb-2">
                    <img src="${review.user.profilePicture || 'assets/img/placeholder.png'}" 
                         alt="${review.user.username}" 
                         class="w-8 h-8 rounded-full mr-2">
                    <span class="text-white font-medium">${review.user.username}</span>
                    <span class="ml-auto text-green-500">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                </div>
                <p class="text-gray-300">${review.content}</p>
                <div class="text-sm text-gray-400 mt-2">
                    ${new Date(review.timestamp).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = `
            <p class="text-gray-400 text-center py-4">Failed to load reviews. Please try again later.</p>
        `;
    }
}

async function loadGames() {
    console.log('Loading games...');
    
    const gamesContainer = document.getElementById('popular-games');
    if (!gamesContainer) {
        console.error('Popular games container not found');
        return;
    }
    
    try {
        const response = await fetch('/api/games');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const games = await response.json();
        console.log(`Fetched ${games.length} games`);
        
        gamesContainer.innerHTML = '';
        
        if (!games || games.length === 0) {
            gamesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-400">No games found. Check back later!</p>
                </div>
            `;
            return;
        }
        
        games.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card cursor-pointer';
            gameCard.innerHTML = `
                <div class="bg-gray-800 rounded-md overflow-hidden">
                    <img src="${game.coverImage || 'assets/img/placeholder.png'}" alt="${game.title}" 
                         class="w-full aspect-[2/3] object-cover">
                    <div class="p-2">
                        <h3 class="text-white font-semibold truncate">${game.title}</h3>
                        <p class="text-gray-400 text-sm">${game.releaseDate || 'Unknown'}</p>
                    </div>
                </div>
            `;
        
            gameCard.addEventListener('click', () => {
                console.log('Game clicked:', game.title);
                window.location.hash = `game/${game.apiSourceId}`;
            });
            
            gamesContainer.appendChild(gameCard);
        });
        
        console.log('Games loaded successfully');
    } catch (error) {
        console.error('Error loading games:', error);
        gamesContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">Failed to load games. Please try again later.</p>
                <p class="text-gray-500">${error.message}</p>
            </div>
        `;
    }
}

function updateNavbarAuthUI() {
    const token = localStorage.getItem('token');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const usernameDisplay = document.getElementById('username-display');
    const userAvatar = document.getElementById('user-avatar');

    if (token) {
        // Fetch user info from backend
        fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(user => {
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (usernameDisplay) usernameDisplay.textContent = user.username;
            if (userAvatar && user.profilePicture) userAvatar.src = user.profilePicture;
        })
        .catch(() => {
            // If error, show auth buttons
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        });
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}
async function handleSearch() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
        loadGames();
        return;
    }
    const gamesContainer = document.getElementById('popular-games');
    gamesContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-400">Searching...</p></div>';
    try {
        const response = await fetch('/api/games/search?q='+encodeURIComponent(searchTerm));
        const filteredGames = await response.json();
        // const filteredGames = games.filter(game => game.title && game.title.toLowerCase().startsWith(searchTerm));
        gamesContainer.innerHTML = '';
        if (filteredGames.length === 0) {
            gamesContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-400">No games found.</p></div>';
            return;
        }
        filteredGames.forEach(game => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card cursor-pointer';
            gameCard.innerHTML = `
                <div class="bg-gray-800 rounded-md overflow-hidden">
                    <img src="${game.coverImage || 'assets/img/placeholder.png'}" alt="${game.title}" class="w-full aspect-[2/3] object-cover">
                    <div class="p-2">
                        <h3 class="text-white font-semibold truncate">${game.title}</h3>
                        <p class="text-gray-400 text-sm">${game.releaseDate || 'Unknown'}</p>
                    </div>
                </div>
            `;
            gameCard.addEventListener('click', () => {
                window.location.hash = `game/${game.apiSourceId}`;
            });
            gamesContainer.appendChild(gameCard);
        });
    } catch (error) {
        gamesContainer.innerHTML = '<div class="col-span-full text-center py-8"><p class="text-gray-400">Failed to search games.</p></div>';
    }
}

async function loadRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    activityContainer.innerHTML = '';

    let userId = localStorage.getItem('userId');
    if (!userId) {
        activityContainer.innerHTML = '<p class="text-gray-400 text-center py-4">Sign in to see your recent activity.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/activities/feed/${userId}`);
        const activities = await response.json();

        if (!activities || activities.length === 0) {
            activityContainer.innerHTML = '<p class="text-gray-400 text-center py-4">No recent activity yet.</p>';
            return;
        }

        activityContainer.innerHTML = activities.map(activity => {
            let icon = '<i class="fas fa-star text-green-500"></i>';
            let text = '';
            if (activity.type === 'review') {
                text = `Reviewed <b>${activity.gameId}</b>`;
            } else if (activity.type === 'list') {
                text = `Created a new list`;
            } else {
                text = `Did something cool!`;
            }
            return `
                <div class="flex items-center p-4 bg-gray-800 rounded-lg mb-2">
                    <div class="rounded-full bg-gray-700 h-10 w-10 mr-4 flex items-center justify-center">${icon}</div>
                    <div>
                        <div class="text-white font-medium">${text}</div>
                        <div class="text-gray-400 text-sm">${new Date(activity.timestamp * 1000).toLocaleString()}</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        activityContainer.innerHTML = '<p class="text-gray-400 text-center py-4">Failed to load recent activity.</p>';
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
            // Only prevent default if clicking on the menu button itself
            if (e.target.closest('.flex.items-center')) {
                // e.preventDefault();
                console.log('User menu clicked, toggling dropdown');
                userDropdown.classList.toggle('hidden');
            }
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
    // initializeProfile();
}); 