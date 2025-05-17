// Format the date
const reviewDate = formatDate(review.timestamp);

// Create star display
const starDisplay = `<span class="text-green-600">${'★'.repeat(Math.floor(review.rating))}${'☆'.repeat(5 - Math.floor(review.rating))}</span>`;

reviewCard.innerHTML = `
    <div class="flex items-center mb-4">
        <img src="${user.profilePicture || 'assets/img/placeholder.png'}" alt="${user.username}" 
            class="h-10 w-10 rounded-full mr-3 object-cover">
        <div>
            <a href="#profile/${user.userId}" class="font-medium text-green-600 hover:text-green-500">${user.username}</a>
            <div class="text-gray-400 text-sm">${reviewDate}</div>
        </div>
        <div class="ml-auto text-green-600 font-bold">
            ${review.rating}/5 <i class="fas fa-star text-sm"></i>
        </div>
    </div>
    <p class="text-gray-300">${review.content}</p>
    <div class="mt-3 text-sm text-gray-500">
        <button class="hover:text-green-500 mr-4 like-review-btn" data-review-id="${review.reviewId}">
            <i class="far fa-thumbs-up mr-1"></i> 
            <span class="like-count">${review.likes ? review.likes.length : 0}</span>
        </button>
        <button class="hover:text-green-500 comment-review-btn" data-review-id="${review.reviewId}">
            <i class="far fa-comment mr-1"></i> Comment
        </button>
    </div>
`;

// Add event listeners for like and comment buttons
const likeBtn = reviewCard.querySelector('.like-review-btn');
likeBtn.addEventListener('click', () => handleLikeReview(review.reviewId, likeBtn));

const commentBtn = reviewCard.querySelector('.comment-review-btn');
commentBtn.addEventListener('click', () => handleCommentReview(review.reviewId));

return reviewCard;