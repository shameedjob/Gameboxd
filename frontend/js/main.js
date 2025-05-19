document.addEventListener('DOMContentLoaded', function() {
    console.log('Gamebox frontend loaded');
    loadGames();
    setTimeout(() => {
        setupDirectButtonListeners();
        handleHashChange();
    }, 50);
    
    window.addEventListener('hashchange', handleHashChange);
    
    console.log('Welcome to Gamebox!');
});

function setupDirectButtonListeners() {
    console.log('Setting up direct button listeners');
    
    document.querySelectorAll('a, button').forEach(element => {
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
        
        if (text.toUpperCase().includes('CREATE ACCOUNT')) {
            console.log('Found CREATE ACCOUNT button, attaching listener');
            element.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Create Account button clicked');
                window.location.hash = 'register';
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
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        console.log('Creating account...');
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
    alert('Game details view not implemented yet');
}

async function loadGames() {
    console.log('Loading games...');
    
    const gamesContainer = document.getElementById('popular-games');
    if (!gamesContainer) {
        console.error('Popular games container not found');
        return;
    }
    
    try {
        const response = await fetch('http://127.0.0.1:5001/api/games');
        
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