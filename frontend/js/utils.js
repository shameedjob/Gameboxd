// DOM Elements
const loading = document.getElementById('loading');

// Show loading spinner
export function showLoading() {
    if (loading) {
        loading.classList.remove('hidden');
    }
}

// Hide loading spinner
export function hideLoading() {
    if (loading) {
        loading.classList.add('hidden');
    }
}

// Show toast notification
export function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type} fixed top-4 right-4 px-4 py-2 rounded-md text-white transform transition-all duration-300 ease-in-out`;
    toast.textContent = message;

    // Add to document
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Format date to relative time
export function formatDate(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
}

// Format number with suffix (e.g., 1.2k, 3.4m)
export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'm';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// Truncate text with ellipsis
export function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

// Debounce function for search inputs
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Validate email format
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
export function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Get URL parameters
export function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params.entries()) {
        result[key] = value;
    }
    return result;
}

// Update URL parameters without reload
export function updateUrlParams(params) {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
}

export async function loadUserReviews(userId) {
    const response = await fetch(`/api/user/${userId}`);
    const reviews = await response.json();

    const reviewsContainer = document.getElementById('recent-reviews');
    reviewsContainer.innerHTML = '';

    // Update the reviews count in the profile header
    const reviewsCountElem = document.getElementById('reviews-count');
    if (reviewsCountElem) {
        reviewsCountElem.textContent = reviews.length;
    }

    if (!reviews.length) {
        reviewsContainer.innerHTML = '<p class="text-gray-400">No reviews yet.</p>';
        return;
    }

    reviews.forEach(review => {
        const reviewDiv = document.createElement('div');
        reviewDiv.className = 'review-item bg-gray-800 p-4 rounded mb-2';
        reviewDiv.innerHTML = `
            <div class="font-bold text-white">${review.gameId}</div>
            <div class="text-gray-300">${review.content}</div>
            <div class="text-gray-500 text-sm">${new Date(review.timestamp * 1000).toLocaleString()}</div>
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}

// Call this function with the current user's ID when the profile loads
// loadUserReviews(currentUserId); 