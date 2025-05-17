const coverHTML = `
    <div class="grid grid-cols-2 gap-1 w-full">
        <div class="aspect-[2/3] bg-gray-700 rounded overflow-hidden">
            <img src="assets/img/placeholder.png" alt="" class="w-full h-full object-cover list-cover-img">
        </div>
        <div class="aspect-[2/3] bg-gray-700 rounded overflow-hidden">
            <img src="assets/img/placeholder.png" alt="" class="w-full h-full object-cover list-cover-img">
        </div>
        <div class="aspect-[2/3] bg-gray-700 rounded overflow-hidden">
            <img src="assets/img/placeholder.png" alt="" class="w-full h-full object-cover list-cover-img">
        </div>
        <div class="aspect-[2/3] bg-gray-700 rounded overflow-hidden">
            <img src="assets/img/placeholder.png" alt="" class="w-full h-full object-cover list-cover-img">
        </div>
    </div>
`;

// Add list details
listCard.innerHTML = `
    <div class="flex flex-col md:flex-row">
        <div class="md:w-1/4 mb-4 md:mb-0">
            ${coverHTML}
        </div>
        <div class="md:w-3/4 md:pl-4">
            <h3 class="text-xl font-bold text-white mb-2">${list.title}</h3>
            <p class="text-gray-300 mb-2 line-clamp-2 h-12 overflow-hidden">
                ${list.description || 'No description provided.'}
            </p>
            <div class="text-sm text-gray-400">
                <span>${list.games.length} games</span>
                <span class="mx-2">•</span>
                <span>${formatDate(list.timestamp)}</span>
            </div>
        </div>
    </div>
`;

// Add click event to navigate to the list
listCard.addEventListener('click', () => {
    window.location.hash = `list/${list.listId}`;
});

// Add to container
profileListsContainer.appendChild(listCard);

// Try to load game covers if there are games in the list
if (list.games && list.games.length > 0) {
    const gameIdsToShow = list.games.slice(0, 4);
    
    // Get the cover image elements within this list card
    const coverImgs = listCard.querySelectorAll('.list-cover-img');
    
    // Try to load each game and update its cover
    for (let i = 0; i < gameIdsToShow.length; i++) {
        try {
            const game = await GameboxAPI.getGameDetails(gameIdsToShow[i]);
            if (game && game.coverImage && coverImgs[i]) {
                coverImgs[i].src = game.coverImage;
            }
        } catch (error) {
            console.error('Error loading list game cover:', error);
        }
    }
}