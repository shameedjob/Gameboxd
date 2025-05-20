// Profile screen functionality
class ProfileScreen {
    constructor() {
        this.userData = null;
        this.init();
    }

    async init() {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/frontend/index.html';
            return;
        }

        await this.loadUserProfile();
        this.setupEventListeners();
    }

    async loadUserProfile() {
        try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load profile');
            }

            this.userData = await response.json();
            this.renderProfile();
        } catch (error) {
            console.error('Error loading profile:', error);
            // Handle error appropriately
        }
    }

    renderProfile() {
        const profileContainer = document.getElementById('profile-container');
        if (!profileContainer) return;

        profileContainer.innerHTML = `
            <div class="profile-header">
                <h1>${this.userData.username}'s Profile</h1>
            </div>
            <div class="profile-content">
                <div class="profile-section">
                    <h2>Account Information</h2>
                    <p>Email: ${this.userData.email}</p>
                    <p>Member since: ${new Date(this.userData.created_at).toLocaleDateString()}</p>
                </div>
                <div class="profile-section">
                    <h2>Activity</h2>
                    <div class="activity-stats">
                        <div class="stat">
                            <span class="stat-value">${this.userData.reviews_count || 0}</span>
                            <span class="stat-label">Reviews</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.userData.lists_count || 0}</span>
                            <span class="stat-label">Lists</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Add event listeners for profile interactions
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.handleEditProfile());
        }
    }

    handleEditProfile() {
        // Implement edit profile functionality
        console.log('Edit profile clicked');
    }
}

// Initialize profile screen when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProfileScreen();
}); 