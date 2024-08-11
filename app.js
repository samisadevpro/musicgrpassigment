const clientId = 'f46b9fed372c4d9a866ba0de4f7498ab'; 
const clientSecret = 'f38a3f71df1645f5b8cebd9641977d74';
const unsplashAccessKey = 'pejkxVMTZQQray2bT4-S7ajocLQjkyGMYWovDsgfibQ'; 

let token;

//  Get the Spotify API token
async function getToken() {
    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    token = data.access_token;
}

// Search for tracks using the Spotify API
async function searchTracks() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    document.getElementById('loading').style.display = 'block';

    // Fetch tracks from Spotify
    const spotifyResult = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=5`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const spotifyData = await spotifyResult.json();
    displayResults(spotifyData.tracks.items);

    // Fetch background image from Unsplash
    searchUnsplash(query);

    document.getElementById('loading').style.display = 'none';
}

//  Display the search results
function displayResults(tracks) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    tracks.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.classList.add('track');

        const trackName = document.createElement('h3');
        trackName.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;

        const trackImage = document.createElement('img');
        trackImage.src = track.album.images[0]?.url || '';
        trackImage.width = 150;

        trackDiv.appendChild(trackImage);
        trackDiv.appendChild(trackName);

        // Add event listener to play the track and highlight it when clicked
        trackDiv.addEventListener('click', () => {
            playTrack(track.id);
            highlightTrack(trackDiv);
        });

        resultsDiv.appendChild(trackDiv);
    });
}

// Search for a background image using Unsplash API
async function searchUnsplash(query) {
    const unsplashResult = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${unsplashAccessKey}&orientation=landscape&per_page=10`, {
        method: 'GET'
    });

    const unsplashData = await unsplashResult.json();
    // Choose the best image from the results
    const imageUrl = chooseBestImage(unsplashData.results);
    document.body.style.backgroundImage = `url(${imageUrl})`;
}

// Function to choose the best image based on size and relevance
function chooseBestImage(images) {
    if (images.length === 0) return '';

    // For simplicity, choose the largest image
    return images.reduce((largest, image) => {
        return (image.width * image.height > largest.width * largest.height) ? image : largest;
    }).urls.regular;
}

// Play the selected track using Spotify embed
function playTrack(trackId) {
    const playerDiv = document.getElementById('player');
    playerDiv.innerHTML = `<iframe src="https://open.spotify.com/embed/track/${trackId}" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
}

//  Highlight the selected track
function highlightTrack(trackDiv) {
    const allTracks = document.querySelectorAll('.track');
    allTracks.forEach(track => track.style.backgroundColor = '');

    trackDiv.style.backgroundColor = 'rgba(30, 215, 96, 0.2)';
}

// Add event listener for Enter key press
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchTracks();
    }
});

// Initialize the app
getToken();
