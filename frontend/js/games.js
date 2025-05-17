if (!isAuthenticated()) {
    showToast('Please log in to submit a review', 'error');
    window.location.hash = 'login';
    return;
}

// Get form data
const rating = parseInt(reviewForm.dataset.rating || 0);
const content = document.getElementById('review-content').value.trim();

// Validate
if (rating === 0) {
    showToast('Please select a rating', 'error');
    return;
}

if (!content) {
    showToast('Please write a review', 'error');
    return;
}

// Create review data
const reviewData = {
    gameId: currentGameId,
    rating: rating,
    content: content,
    timestamp: Date.now()
};

try {
    showLoading();
    await GameboxAPI.createReview(reviewData);
    hideLoading();
    
    // Show success message
    showToast('Review submitted successfully!', 'success');
    
    // Hide review form
    reviewFormContainer.classList.add('hidden');
    
    // Reload reviews
    loadGameReviews(currentGameId);
} catch (error) {
    hideLoading();
    console.error('Error submitting review:', error);
    showToast('Failed to submit review', 'error');
}
}
