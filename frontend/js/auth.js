import GameboxAPI from './api.js'; import { showToast, showLoading, hideLoading } from './utils.js';

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (userDropdown.classList.contains('hidden') || 
        userMenuBtn.contains(event.target)) {
        return;
    }
    
    if (!userDropdown.contains(event.target)) {
        userDropdown.classList.add('hidden');
    }
});

// Check if user is already logged in
checkAuthState();
}

if (token && userId) {
    try {
        showLoading();
        const userData = await GameboxAPI.getCurrentUser();
        hideLoading();
        
        if (userData) {
            // User is authenticated
            updateAuthUI(true, userData);
            return userData;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            updateAuthUI(false);
        }
    } catch (error) {
        hideLoading();
        console.error('Auth check failed:', error);
        // Clear potentially invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        updateAuthUI(false);
    }
} else {
    updateAuthUI(false);
}

return null;
}

    usernameDisplay.textContent = userData.username;
    if (userData.profilePicture) {
        userAvatar.src = userData.profilePicture;
    }
} else {
    // User is not logged in
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');
}
}
document.querySelectorAll('main > section').forEach(section => {
    section.classList.add('hidden');
});

// Show auth pages
authPages.classList.remove('hidden');
loginPage.classList.remove('hidden');
registerPage.classList.add('hidden');

// Update URL hash
window.location.hash = 'login';

loginForm.reset();
}


document.querySelectorAll('main > section').forEach(section => {
    section.classList.add('hidden');
});

authPages.classList.remove('hidden');
registerPage.classList.remove('hidden');
loginPage.classList.add('hidden');

window.location.hash = 'register';

registerForm.reset();
}

const email = document.getElementById('login-email').value;
const password = document.getElementById('login-password').value;

try {
    showLoading();
    const response = await GameboxAPI.login({ email, password });
    hideLoading();
    
    if (response && response.token && response.userId) {
        // Save auth data
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        
        // Get user data
        const userData = await GameboxAPI.getCurrentUser();
        
        // Update UI
        updateAuthUI(true, userData);

        showToast('Login successful!', 'success');
        
        // Redirect to home
        window.location.hash = '';
    }
} catch (error) {
    hideLoading();
    console.error('Login error:', error);
    showToast(error.message || 'Login failed. Please check your credentials.', 'error');
}
}


const username = document.getElementById('register-username').value;
const email = document.getElementById('register-email').value;
const password = document.getElementById('register-password').value;

try {
    showLoading();
    const response = await GameboxAPI.register({ username, email, password });
    hideLoading();
    
    if (response && response.userId) {
        showToast('Registration successful! Please log in.', 'success');
        

        showLoginPage();
    }
} catch (error) {
    hideLoading();
    console.error('Registration error:', error);
    showToast(error.message || 'Registration failed. Please try again.', 'error');
}
}


// Clear auth data
localStorage.removeItem('token');
localStorage.removeItem('userId');

updateAuthUI(false);

showToast('You have been logged out.', 'success');

window.location.hash = '';
}

