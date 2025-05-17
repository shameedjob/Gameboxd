document.addEventListener('DOMContentLoaded', function() {
    console.log('Gamebox frontend loaded');
    
    loadGames();
    
    setupNavigation();
    
    showToast('Welcome to Gamebox!', 'success');
});

function setupNavigation() {
    // Sign In button
    const signInBtn = document.querySelector('.SIGN.IN') || document.getElementById('sign-in-btn');
    if (signInBtn) {
        signInBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Sign In button clicked');
            window.location.hash = 'login';
            showLoginPage();
        });
    } else {
        console.warn('Sign In button not found');
    }
    
    // Create Account button
    const createAccountBtn = document.querySelector('.CREATE.ACCOUNT') || document.getElementById('create-account-btn');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Create Account button clicked');
            window.location.hash = 'register';
            showRegisterPage();
        });
    } else {
        console.warn('Create Account button not found');
    }
    
    // Join Gamebox button
    const joinBtn = document.querySelector('.JOIN.GAMEBOX') || document.getElementById('join-gamebox');
    if (joinBtn) {
        joinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Join Gamebox button clicked');
            window.location.hash = 'register';
            showRegisterPage();
        });
    } else {
        console.warn('Join Gamebox button not found');
    }
    
    window.addEventListener('hashchange', handleHashChange);
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

// Show login page
function showLoginPage() {
    console.log('Showing login page');
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show login section
    const loginSection = document.getElementById('login-page');
    if (loginSection) {
        loginSection.classList.remove('hidden');
    } else {
        // If login section doesn't exist yet, create it
        createLoginPage();
    }
}

// Show register page
function showRegisterPage() {
    console.log('Showing register page');
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show register section
    const registerSection = document.getElementById('register-page');
    if (registerSection) {
        registerSection.classList.remove('hidden');
    } else {
        // If register section doesn't exist yet, create it
        createRegisterPage();
    }
}

// Show home page
function showHomePage() {
    console.log('Showing home page');
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show home section
    const homeSection = document.getElementById('home-page');
    if (homeSection) {
        homeSection.classList.remove('hidden');
    }
}

// Create login page if it doesn't exist
function createLoginPage() {
    const main = document.querySelector('main');
    if (!main) return;
    
    const loginSection = document.createElement('section');
    loginSection.id = 'login-page';
    loginSection.classList.add('max-w-md', 'mx-auto', 'bg-gray-800', 'p-8', 'rounded-lg', 'shadow-lg', 'mt-8');
    
    loginSection.innerHTML = `
        <h2 class="text-2xl font-bold mb-6 text-white text-center">Sign In</h2>
        <form id="login-form">
            <div class="mb-4">
                <label for="login-email" class="block text-gray-300 mb-2">Email</label>
                <input type="email" id="login-email" class="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" required>
            </div>
            <div class="mb-6">
                <label for="login-password" class="block text-gray-300 mb-2">Password</label>
                <input type="password" id="login-password" class="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" required>
            </div>
            <button type="submit" class="w-full bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium">SIGN IN</button>
        </form>
        <div class="mt-4 text-center text-gray-400">
            <p>Don't have an account? <a href="#register" id="switch-to-register" class="text-green-500 hover:text-green-400">Create one</a></p>
        </div>
    `;
    
    main.appendChild(loginSection);
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const switchToRegister = document.getElementById('switch-to-register');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            showRegisterPage();
        });
    }
}

// Create register page if it doesn't exist
function createRegisterPage() {
    const main = document.querySelector('main');
    if (!main) return;
    
    const registerSection = document.createElement('section');
    registerSection.id = 'register-page';
    registerSection.classList.add('max-w-md', 'mx-auto', 'bg-gray-800', 'p-8', 'rounded-lg', 'shadow-lg', 'mt-8');
    
    registerSection.innerHTML = `
        <h2 class="text-2xl font-bold mb-6 text-white text-center">Create Account</h2>
        <form id="register-form">
            <div class="mb-4">
                <label for="register-username" class="block text-gray-300 mb-2">Username</label>
                <input type="text" id="register-username" class="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" required>
            </div>
            <div class="mb-4">
                <label for="register-email" class="block text-gray-300 mb-2">Email</label>
                <input type="email" id="register-email" class="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" required>
            </div>
            <div class="mb-6">
                <label for="register-password" class="block text-gray-300 mb-2">Password</label>
                <input type="password" id="register-password" class="w-full bg-gray-700 text-white rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" required>
            </div>
            <button type="submit" class="w-full bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md font-medium">CREATE ACCOUNT</button>
        </form>
        <div class="mt-4 text-center text-gray-400">
            <p>Already have an account? <a href="#login" id="switch-to-login" class="text-green-500 hover:text-green-400">Sign in</a></p>
        </div>
    `;
    
    main.appendChild(registerSection);
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginPage();
        });
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        showToast('Logging in...', 'info');
        
        // Call login API
        const response = await fetch('http://127.0.0.1:5001/api/auth/login', {
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
        
        // Show success message
        showToast('Login successful!', 'success');
        
        // Redirect to home page
        window.location.hash = '';
        window.location.reload();
    } catch (error) {
        console.error('Login error:', error);
        showToast(error.message || 'Login failed. Please check your credentials.', 'error');
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        // Show loading indicator
        showToast('Creating account...', 'info');
        
        // Call register API
        const response = await fetch('http://127.0.0.1:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        // Show success message
        showToast('Account created successfully! Please log in.', 'success');
        
        // Redirect to login page
        showLoginPage();
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error');
    }
}

// Show game details
function showGameDetails(gameId) {
    console.log('Showing game details for:', gameId);
    showToast('Game details view not implemented yet', 'info');
}

function showToast(message, type = 'info') {
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.position = 'fixed';
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px)';
    
    if (type === 'success') {
        toast.style.backgroundColor = '#15803d';
        toast.style.color = 'white';
    } else if (type === 'error') {
        toast.style.backgroundColor = '#dc2626';
        toast.style.color = 'white';
    } else {
        toast.style.backgroundColor = '#1e40af';
        toast.style.color = 'white';
    }
    
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Load games function
async function loadGames() {
    const gamesContainer = document.getElementById('popular-games');
    if (!gamesContainer) return;
    
    try {
        const response = await fetch('http://127.0.0.1:5001/api/games');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const games = await response.json();
        
        if (!games || games.length === 0) {
            gamesContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-gray-400">No games found. Check back later!</p>
                </div>
            `;
            return;
        }
        
        gamesContainer.innerHTML = '';
        
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
                window.location.hash = `game/${game.apiSourceId}`;
            });
            
            gamesContainer.appendChild(gameCard);
        });
    } catch (error) {
        console.error('Error loading games:', error);
        gamesContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">Failed to load games. Please try again later.</p>
            </div>
        `;
    }
}