const localEndTime = new Date("2024-05-27T18:57:21.029Z").getTime();
let category = '';
let timespan = '';
let lives = 5;
const maxLives = 5;
let isGuessProcessing = false; // Flag to prevent multiple submissions
const quizData = {
    songs: [],
    albums: [],
    artists: []
};
const quizDataCounts = {
    songs: [],
    albums: [],
    artists: []
};
const quizDataArtists = {
    songs: []
};

function showQuizOptions() {
    if (currentAudio) {
        currentAudio.pause();
    }
    resetGame(); // Ensure the game is reset when showing quiz options
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-options').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('stats-options').style.display = 'none';
    document.getElementById('stats-screen').style.display = 'none';
}

document.getElementById('timespan').addEventListener('change', function () {
    const customTimeRange = document.getElementById('custom-time-range');
    if (this.value === 'custom') {
        customTimeRange.style.display = 'block';
    } else {
        customTimeRange.style.display = 'none';
    }
});

function toProperCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function formatDateTime(dateTimeString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleString('en-US', options);
}

function setQuizTime(timespan) {
    if (timespan === 'week') {
        document.getElementById('quiz-time').innerText = "The Last 7 Days";
    } else if (timespan === 'month') {
        document.getElementById('quiz-time').innerText = "The Last 30 Days";
    } else if (timespan === '6months') {
        document.getElementById('quiz-time').innerText = "The Last 6 Months";
    } else if (timespan === 'year') {
        document.getElementById('quiz-time').innerText = "The Last Year";
    } else if (timespan === 'custom') {
        startDate = document.getElementById('custom-start').value;
        endDate = document.getElementById('custom-end').value;
        document.getElementById('quiz-time').innerText = `${formatDateTime(startDate)} to ${formatDateTime(endDate)}`;
    } else if (timespan === 'dear-april') {
        document.getElementById('quiz-time').innerText = "The Talking Stage";
    } else if (timespan === 'first-2-months') {
        document.getElementById('quiz-time').innerText = "Our First 2 Months Dating";
    } else if (timespan === 'year-1-ld') {
        document.getElementById('quiz-time').innerText = "Year 1 of Long Distance";
    } else if (timespan === 'year-2-ld') {
        document.getElementById('quiz-time').innerText = "Year 2 of Long Distance";
    } else if (timespan === 'year-3-ld') {
        document.getElementById('quiz-time').innerText = "Year 3 of Long Distance";
    } else if (timespan === '2017') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2018') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2019') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2020') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2021') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2022') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2023') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === '2024') {
        document.getElementById('quiz-time').innerText = timespan;
    } else if (timespan === 'eras-tour') {
        document.getElementById('quiz-time').innerText = "The Month Before The Eras Tour";
    } else {
        document.getElementById('quiz-time').innerText = "Your All Time Spotify History";
    }
}

async function startGame() {
    category = document.getElementById('category').value;
    timespan = document.getElementById('timespan').value;
    document.getElementById('quiz-category').innerText = toProperCase(category);
    setQuizTime(timespan);
    document.getElementById('quiz-options').style.display = 'none';
    document.getElementById('stats-options').style.display = 'none';
    document.getElementById('stats-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    lives = maxLives; // Reset lives at the start of the game
    document.getElementById('lives-count').innerText = lives;

    // Show loading screen
    showLoadingScreen();

    await populateQuiz();

    // Hide loading screen
    hideLoadingScreen();

    document.getElementById('guess-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default enter behavior
            submitGuess();
        }
    });

    addGiveUpButton(); // Add the "Give Up" button when the game starts
}

async function fetchLocalData(startTime, endTime) {
    const years = [];
    for (let year = new Date(startTime).getFullYear(); year <= new Date(endTime).getFullYear(); year++) {
        years.push(year);
    }

    let allData = [];
    for (const year of years) {
        try {
            const response = await fetch(`spotify_data_${year}.json`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            allData = allData.concat(data);
        } catch (error) {
            console.error('Error fetching local data:', error);
        }
    }

    return allData;
}

async function fetchAPIAndLocalData(startTime, endTime) {
    const userId = 'kyliepaige718'; // Replace with the actual userId
    const limit = 200;
    let allData = [];
    let before = endTime;

    while (before > startTime && before > localEndTime) {
        const url = `https://api.stats.fm/api/v1/users/${userId}/streams?limit=${limit}&before=${before}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any necessary headers here, such as authorization tokens if needed
                },
            });
            if (response.status === 503) {
                alert('Server returned a 503 error. Refresh, wait a minute, and try again lol.');
            }

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            allData = allData.concat(data.items);

            if (data.items.length === 0) {
                break; // No more data available
            }

            before = new Date(data.items[data.items.length - 1].endTime).getTime();
        } catch (error) {
            console.error('Error fetching streaming data:', error);
            break;
        }
    }

    const localData = await fetchLocalData(startTime, localEndTime);
    allData = allData.concat(localData);
    // Remove duplicates based on unique identifier
    const uniqueData = Array.from(new Map(allData.map(item => [item.id, item])).values());
    return uniqueData;
}

async function populateQuiz() {
    let endTime = timespan === 'custom' ? new Date(document.getElementById('custom-end').value).getTime() : Date.now();
    let startTime;

    if (timespan === 'week') {
        startTime = endTime - (7 * 24 * 60 * 60 * 1000);
    } else if (timespan === 'month') {
        startTime = endTime - (30 * 24 * 60 * 60 * 1000);
    } else if (timespan === '6months') {
        startTime = endTime - (180 * 24 * 60 * 60 * 1000); // Last 6 months
    } else if (timespan === 'year') {
        startTime = endTime - (365 * 24 * 60 * 60 * 1000);
    } else if (timespan === 'custom') {
        startTime = new Date(document.getElementById('custom-start').value).getTime();
    } else if (timespan === 'dear-april') {
        startTime = new Date('2021-01-15T00:00:00').getTime();
        endTime = new Date('2021-06-06T23:59:59').getTime();
    } else if (timespan === 'first-2-months') {
        startTime = new Date('2021-06-07T00:00:00').getTime();
        endTime = new Date('2021-08-09T23:59:59').getTime();
    } else if (timespan === 'year-1-ld') {
        startTime = new Date('2021-09-05T00:00:00').getTime();
        endTime = new Date('2022-05-23T23:59:59').getTime();
    } else if (timespan === 'year-2-ld') {
        startTime = new Date('2022-08-13T00:00:00').getTime();
        endTime = new Date('2023-05-09T23:59:59').getTime();
    } else if (timespan === 'year-3-ld') {
        startTime = new Date('2023-08-14T00:00:00').getTime();
        endTime = new Date('2024-05-06T23:59:59').getTime();
    } else if (timespan === '2017') {
        startTime = new Date('2017-01-01T00:00:00').getTime();
        endTime = new Date('2017-12-31T23:59:59').getTime();
    } else if (timespan === '2018') {
        startTime = new Date('2018-01-01T00:00:00').getTime();
        endTime = new Date('2018-12-31T23:59:59').getTime();
    } else if (timespan === '2019') {
        startTime = new Date('2019-01-01T00:00:00').getTime();
        endTime = new Date('2019-12-31T23:59:59').getTime();
    } else if (timespan === '2020') {
        startTime = new Date('2020-01-01T00:00:00').getTime();
        endTime = new Date('2020-12-31T23:59:59').getTime();
    } else if (timespan === '2021') {
        startTime = new Date('2021-01-01T00:00:00').getTime();
        endTime = new Date('2021-12-31T23:59:59').getTime();
    } else if (timespan === '2022') {
        startTime = new Date('2022-01-01T00:00:00').getTime();
        endTime = new Date('2022-12-31T23:59:59').getTime();
    } else if (timespan === '2023') {
        startTime = new Date('2023-01-01T00:00:00').getTime();
        endTime = new Date('2023-12-31T23:59:59').getTime();
    } else if (timespan === '2024') {
        startTime = new Date('2024-01-01T00:00:00').getTime();
        endTime = new Date('2024-12-31T23:59:59').getTime();
    } else if (timespan === 'eras-tour') {
        startTime = new Date('2023-03-30T12:00:00').getTime();
        endTime = new Date('2023-04-30T23:59:59').getTime();
    } else {
        startTime = new Date('2017-05-02').getTime(); // Start from May 2, 2017 for "All Time"
    }

    let allData = [];
    if (endTime > localEndTime) {
        allData = await fetchAPIAndLocalData(startTime, endTime);
    } else {
        allData = await fetchLocalData(startTime, endTime);
    }

    const filteredSongs = allData.filter(song => {
        const songEndTime = new Date(song.endTime).getTime();
        return songEndTime >= startTime && songEndTime <= endTime;
    });

    await calculateTopItems(filteredSongs);
}

async function calculateTopItems(songs) {
    const trackCount = {};
    const trackNames = {};
    const albumCount = {};
    const artistCount = {};

    songs.forEach(song => {
        const trackId = song.trackId;
        const albumId = song.albumId;
        const artistIds = song.artistIds;

        if (category === 'songs') {
            if (!trackCount[trackId]) {
                trackCount[trackId] = 0;
                trackNames[trackId] = song.trackName;
            }
            trackCount[trackId]++;
        }

        if (category === 'albums') {
            if (!albumCount[albumId]) albumCount[albumId] = 0;
            albumCount[albumId]++;
        }

        if (category === 'artists') {
            artistIds.forEach(artistId => {
                if (!artistCount[artistId]) artistCount[artistId] = 0;
                artistCount[artistId]++;
            });
        }
    });

    const topTracks = category === 'songs' ? Object.entries(trackCount).sort((a, b) => b[1] - a[1]).slice(0, 10) : [];
    const topAlbums = category === 'albums' ? Object.entries(albumCount).sort((a, b) => b[1] - a[1]).slice(0, 10) : [];
    const topArtists = category === 'artists' ? Object.entries(artistCount).sort((a, b) => b[1] - a[1]).slice(0, 10) : [];

    await fillQuizData(topTracks, topAlbums, topArtists, trackNames);
}

// Global lookup tables
const artistNameLookup = {};
const trackArtistNameLookup = {};
const albumDataLookup = {};

// searches id of an artist to get their name using the artistId
async function fetchArtistData(artistId) {
    if (artistNameLookup[artistId]) {
        return artistNameLookup[artistId];
    }

    const response = await fetch(`https://api.stats.fm/api/v1/artists/${artistId}`);
    if (response.status === 503) {
        alert('Server returned a 503 error. Refresh, wait a minute, and try again lol.');
        return null;
    }
    const data = await response.json();
    const artistData = {
        name: data.item.name || `Artist ${artistId}`,
        image: data.item.image || ''
    };

    artistNameLookup[artistId] = artistData;
    return artistData;
}

async function fetchTrackData(trackId) {
    if (trackArtistNameLookup[trackId]) {
        return trackArtistNameLookup[trackId];
    }

    const response = await fetch(`https://api.stats.fm/api/v1/tracks/${trackId}`);
    if (response.status === 503) {
        alert('Server returned a 503 error. Refresh, wait a minute, and try again lol.');
        return null;
    }
    const data = await response.json();

    const trackData = {
        artistName: data.item.artists[0]?.name || `Artist ${trackId}`,
        albumImage: data.item.albums[0]?.image || '',
        preview: data.item.spotifyPreview || data.item.appleMusicPreview || ''
    };


    trackArtistNameLookup[trackId] = trackData;
    return trackData;
}


// searches album id to get the album and artist name for that album
async function fetchAlbumData(albumId) {
    if (albumDataLookup[albumId]) {
        return albumDataLookup[albumId];
    }

    const response = await fetch(`https://api.stats.fm/api/v1/albums/${albumId}`);
    if (response.status === 503) {
        alert('Server returned a 503 error. Refresh, wait a minute, and try again lol.');
        return null;
    }
    const data = await response.json();
    const albumData = {
        name: data.item.name || `Album ${albumId}`,
        artist: data.item.artists[0]?.name || `Artist ${albumId}`,
        albumImage: data.item.image || ''
    };

    albumDataLookup[albumId] = albumData;
    return albumData;
}



async function fillQuizData(topTracks, topAlbums, topArtists, trackNames) {
    if (category === 'albums') {
        const albumDataPromises = topAlbums.map(async album => ({
            id: album[0],
            data: await fetchAlbumData(album[0])
        }));
        const albumData = await Promise.all(albumDataPromises);
        const albumDataMap = albumData.reduce((acc, album) => {
            acc[album.id] = album.data;
            return acc;
        }, {});
        quizData.albums = topAlbums.map(album => albumDataMap[album[0]].name);
        quizDataCounts.albums = topAlbums.map(album => ({
            count: album[1],
            artist: albumDataMap[album[0]].artist,
            albumImage: albumDataMap[album[0]].albumImage
        }));
    }


    if (category === 'artists') {
        const artistNamesPromises = topArtists.map(async artist => ({
            id: artist[0],
            data: await fetchArtistData(artist[0])
        }));
        const artistData = await Promise.all(artistNamesPromises);
        const artistDataMap = artistData.reduce((acc, artist) => {
            acc[artist.id] = artist.data;
            return acc;
        }, {});
        quizData.artists = topArtists.map(artist => artistDataMap[artist[0]].name || artist[0]);
        quizDataCounts.artists = topArtists.map(artist => ({
            count: artist[1],
            artistImage: artistDataMap[artist[0]].image
        }));
    }

    if (category === 'songs') {
        const trackDataPromises = topTracks.map(async track => ({
            id: track[0],
            data: await fetchTrackData(track[0]) // Fetch complete track data
        }));
        const trackData = await Promise.all(trackDataPromises);
        const trackDataMap = trackData.reduce((acc, track) => {
            acc[track.id] = track.data;
            return acc;
        }, {});
        quizData.songs = topTracks.map(track => trackNames[track[0]] || track[0]);
        quizDataCounts.songs = topTracks.map(track => ({
            count: track[1],
            artist: trackDataMap[track[0]].artistName,
            albumImage: trackDataMap[track[0]].albumImage, // Store album image
            preview: trackDataMap[track[0]].preview // Store Spotify preview
        }));
    }

    populateQuizList();
}

function populateQuizList() {
    const quizList = document.getElementById('quiz-list');
    quizList.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerText = '';
        listItem.style.color = ''; // Reset color to default
        quizList.appendChild(listItem);
    }
}

function normalizeString(str) {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function levenshtein(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function fuzzyMatch(input, target) {
    const normalizedInput = normalizeString(input);
    const normalizedTarget = normalizeString(target);
    const distance = levenshtein(normalizedInput, normalizedTarget);
    const threshold = 2; // Allow up to 2 character changes
    return distance <= threshold;
}

function flashInputBox(color) {
    const guessInput = document.getElementById('guess-input');
    if (color === 'green') {
        guessInput.style.backgroundColor = 'rgba(144, 238, 144)'; // Light green, translucent
    } else if (color === 'red') {
        guessInput.style.backgroundColor = 'rgba(255, 127, 127)'; // Lighter red, translucent
    }
    setTimeout(() => {
        guessInput.style.backgroundColor = ''; // Reset the background color
    }, 300); // Duration of the flash in milliseconds
}

let currentAudio = null;

function playPreview(previewUrl) {
    // Stop the current audio if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0; // Reset the playback time to the beginning
    }

    // Play the new preview
    currentAudio = new Audio(previewUrl);
    currentAudio.play();

    // Optionally, add an event listener to clear currentAudio when it ends
    currentAudio.addEventListener('ended', () => {
        currentAudio = null;
    });
}


function submitGuess() {
    if (isGuessProcessing) return; // Prevent multiple submissions
    isGuessProcessing = true;

    const guessInput = document.getElementById('guess-input');
    let guess = guessInput.value.trim().toLowerCase();

    if (guess === '') {
        isGuessProcessing = false;
        return; // Do not process empty guesses
    }

    // Function to clean the title
    const cleanTitle = (title) => {
        return title
            .replace(/\(we'll all be here forever\).*/i, '')
            .replace(/\(wait for your love\).*/i, '')
            .replace(/\(feat[^\)]+\).*/i, '')
            .replace(/\[feat[^\]]+\].*/i, '')
            .replace(/\(with[^\)]+\).*/i, '')
            .replace(/\[with[^\]]+\].*/i, '')
            .replace(/\(from[^\)]+\).*/i, '')
            .replace(/\[from[^\]]+\].*/i, '')
            .replace(/\(ft[^\)]+\).*/i, '')
            .replace(/\[ft[^\]]+\].*/i, '')
            .replace(/\(Deluxe.*$/i, '')
            .replace(/\[Deluxe[^\]]+\].*/i, '')
            .replace(/\(Expanded[^\)]+\).*/i, '')
            .replace(/\(Original.*$/i, '')
            .replace(/\[Original[^\]]+\].*/i, '')
            .replace(/\(We'll[^\)]+\).*/i, '')
            .replace(/\(wait[^\)]+\).*/i, '')
            .replace(/: THE[^\:]+.*$/i, '')
            .replace(/ - from[^\-]+.*$/i, '')
            .replace(/: Deluxe.*$/i, '')
            .replace(/ - Single.*$/i, '')
            .replace(/\(Extended.*$/i, '')
            .replace(/\[Extended[^\]]+\].*/i, '')
            .replace(/\(The.*$/i, '')
            .replace(/The Movie.*$/i, '')
            .trim();
    };




    // Clean the guess
    const cleanGuess = cleanTitle(guess);

    const answers = quizData[category];
    const answersCounts = quizDataCounts[category];
    const quizList = document.getElementById('quiz-list');
    const listItems = quizList.getElementsByTagName('li');
    let found = false;

    for (let i = 0; i < answers.length; i++) {
        // Clean the answer
        const cleanAnswer = cleanTitle(answers[i].toLowerCase());
        //console.log("comparing " + guess + " with " + answers[i].toLowerCase());
        //console.log("comparing " + cleanGuess + " with " + cleanAnswer);
         if (fuzzyMatch(cleanGuess, cleanAnswer) || fuzzyMatch(guess, answers[i].toLowerCase())) {
             //console.log("MATCH");
             let alreadyDisplayed = false;
            let displayText = `${answers[i]} - ${answersCounts[i].toLocaleString("en-US")} streams`;

             if (category === 'songs') {
                 displayText = `${answers[i]} (${answersCounts[i].artist}) - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
             } else if (category === 'albums') {
                 displayText = `${answers[i]} (${answersCounts[i].artist}) - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
             } else if (category === 'artists') {
                 displayText = `${answers[i]} - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
             }

            // Check if this answer is already displayed
            for (let j = 0; j < listItems.length; j++) {
                if (listItems[j].innerText.toLowerCase() === displayText.toLowerCase()) {
                    alreadyDisplayed = true;
                    break;
                }
            }

            // If not already displayed, update the correct list item
             if (!alreadyDisplayed) {
                 let imgSrc = category === 'artists' ? answersCounts[i].artistImage : answersCounts[i].albumImage;
                 listItems[i].innerHTML = `<img src="${imgSrc}" alt="${answers[i]}" style="width:50px;height:50px;margin-right:10px;">${displayText}`;
                 if (category === 'songs') {
                     if (answersCounts[i].preview) {
                         listItems[i].innerHTML += ` <button class="preview-button" onclick="playPreview('${answersCounts[i].preview}')">Play</button>`;
                     }
                 }
                 found = true;
             }
        }
    }


    if (!found) {
        lives--;
        document.getElementById('lives-count').innerText = lives;
        flashInputBox('red');
        if (lives === 0) {
            showMissingAnswers(answers, answersCounts, listItems);
            showPlayAgainButton();
            removeGiveUpButton(); // Remove the button when lives run out
            hideGuessInput();
        }
    } else {
        flashInputBox('green');
        let allFilled = true;
        for (let i = 0; i < listItems.length; i++) {
            if (listItems[i].innerText === '') {
                allFilled = false;
                break;
            }
        }
        if (allFilled) {
            showAllCorrectAnswers(listItems);
            showPlayAgainButton();
            removeGiveUpButton(); // Remove the button when the player wins
            hideGuessInput();
        }
    }
    guessInput.value = '';
    isGuessProcessing = false; // Reset the flag
}



function giveUp() {
    const answers = quizData[category];
    const answersCounts = quizDataCounts[category];
    const quizList = document.getElementById('quiz-list');
    const listItems = quizList.getElementsByTagName('li');
    showMissingAnswers(answers, answersCounts, listItems);
    showPlayAgainButton();
    removeGiveUpButton(); // Remove the button when the player gives up
    hideGuessInput();
}

function hideGuessInput() {
    const guessInput = document.getElementById('guess-input');
    guessInput.style.display = 'none';
}

function removeGiveUpButton() {
    const giveUpButton = document.querySelector('#game-screen .btn-secondary');
    if (giveUpButton) {
        giveUpButton.remove();
    }
}

function showMissingAnswers(answers, answersCounts, listItems) {
    for (let i = 0; i < answers.length; i++) {
        if (listItems[i].innerText === '') {
            let displayText = `${answers[i]} - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
            if (category === 'songs') {
                displayText = `${answers[i]} (${answersCounts[i].artist}) - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
            } else if (category === 'albums') {
                displayText = `${answers[i]} (${answersCounts[i].artist}) - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
            } else if (category === 'artists') {
                displayText = `${answers[i]} - ${answersCounts[i].count.toLocaleString("en-US")} streams`;
            }

            let imgSrc = category === 'artists' ? answersCounts[i].artistImage : answersCounts[i].albumImage;
            listItems[i].innerHTML = `<img src="${imgSrc}" alt="${answers[i]}" style="width:50px;height:50px;margin-right:10px;">${displayText}`;
            if (category === 'songs') {
                if (answersCounts[i].preview) {
                    listItems[i].innerHTML += ` <button class="preview-button" onclick="playPreview('${answersCounts[i].preview}')">Play</button>`;
                }
            }
            listItems[i].style.color = 'red';
        }
    }
}

function showAllCorrectAnswers(listItems) {
    for (let i = 0; i < listItems.length; i++) {
        listItems[i].style.color = 'green';
    }
}

function showPlayAgainButton() {
    const playAgainButton = document.createElement('button');
    playAgainButton.className = 'btn btn-primary mt-3';
    playAgainButton.innerText = 'Play a New Quiz';
    playAgainButton.onclick = showQuizOptions;
    document.getElementById('game-screen').appendChild(playAgainButton);
}

function resetGame() {
    lives = maxLives;
    isGuessProcessing = false; // Reset the flag
    document.getElementById('lives-count').innerText = lives;
    const guessInput = document.getElementById('guess-input');
    guessInput.value = '';
    guessInput.style.display = 'block';
    const quizList = document.getElementById('quiz-list');
    quizList.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';
        listItem.innerText = '';
        listItem.style.color = ''; // Reset color to default
        quizList.appendChild(listItem);
    }
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('quiz-options').style.display = 'none';
    document.getElementById('stats-screen').style.display = 'none';
    document.getElementById('stats-options').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';

    // Remove the "Play a New Quiz" button if it exists
    const playAgainButton = document.querySelector('#game-screen .btn-primary');
    if (playAgainButton) {
        playAgainButton.remove();
    }
    removeGiveUpButton(); // Remove the "Give Up" button
}

function addGiveUpButton() {
    const giveUpButton = document.createElement('button');
    giveUpButton.className = 'btn btn-secondary mt-3';
    giveUpButton.innerText = 'Give Up';
    giveUpButton.onclick = giveUp;
    document.getElementById('game-screen').appendChild(giveUpButton);
}

function showLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loadingScreen.style.color = '#fff';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.fontSize = '2rem';
    loadingScreen.innerText = 'Loading...';
    document.body.appendChild(loadingScreen);
}

function hideLoadingScreen() {
    setTimeout(function () {
        // Code to be executed after 1 second
    }, 500);
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

function goBack() {
    if (currentAudio) {
        currentAudio.pause();
    }
    document.getElementById('billboard-charts-screen').style.display = 'none';
    document.getElementById('billboard-charts-options').style.display = 'none';
    document.getElementById('quiz-options').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('stats-options').style.display = 'none';
    document.getElementById('stats-screen').style.display = 'none';
    window.scrollTo({ top: 0});
}


function showStatsOptions() {
    resetStats(); // Ensure the stats are reset when showing stats options
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('quiz-options').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('stats-options').style.display = 'block';
    document.getElementById('stats-screen').style.display = 'none';
}

document.getElementById('stats-timespan').addEventListener('change', function () {
    const customStatsTimeRange = document.getElementById('custom-stats-time-range');
    if (this.value === 'custom') {
        customStatsTimeRange.style.display = 'block';
    } else {
        customStatsTimeRange.style.display = 'none';
    }
});

async function fetchDataForStats(startTime, endTime) {
    let allData = [];
    if (endTime > localEndTime) {
        allData = await fetchAPIAndLocalData(startTime, endTime);
    } else {
        allData = await fetchLocalData(startTime, endTime);
    }
    return allData;
}

function showStats() {
    const timespan = document.getElementById('stats-timespan').value;
    let endTime = timespan === 'custom' ? new Date(document.getElementById('stats-custom-end').value).getTime() : Date.now();
    let startTime;


    if (timespan === 'week') {
        startTime = endTime - (7 * 24 * 60 * 60 * 1000);
        document.getElementById('stats-time-range').innerText = "The Last 7 Days";
    } else if (timespan === 'month') {
        startTime = endTime - (30 * 24 * 60 * 60 * 1000);
        document.getElementById('stats-time-range').innerText = "The Last 30 Days";
    } else if (timespan === '6months') {
        startTime = endTime - (180 * 24 * 60 * 60 * 1000); // Last 6 months
        document.getElementById('stats-time-range').innerText = "The Last 6 Months";
    } else if (timespan === 'year') {
        startTime = endTime - (365 * 24 * 60 * 60 * 1000);
        document.getElementById('stats-time-range').innerText = "The Last Year";
    } else if (timespan === 'custom') {
        startTime = new Date(document.getElementById('stats-custom-start').value).getTime();
        document.getElementById('stats-time-range').innerText = formatDateTime(startTime) + " to " + formatDateTime(endTime);
    } else if (timespan === 'dear-april') {
        startTime = new Date('2021-01-15T00:00:00').getTime();
        endTime = new Date('2021-06-06T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "The Talking Stage";
    } else if (timespan === 'first-2-months') {
        startTime = new Date('2021-06-07T00:00:00').getTime();
        endTime = new Date('2021-08-09T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "Our First 2 Months Dating";
    } else if (timespan === 'year-1-ld') {
        startTime = new Date('2021-09-05T00:00:00').getTime();
        endTime = new Date('2022-05-23T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "Year 1 of Long Distance";
    } else if (timespan === 'year-2-ld') {
        startTime = new Date('2022-08-13T00:00:00').getTime();
        endTime = new Date('2023-05-09T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "Year 2 of Long Distance";
    } else if (timespan === 'year-3-ld') {
        startTime = new Date('2023-08-14T00:00:00').getTime();
        endTime = new Date('2024-05-06T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "Year 3 of Long Distance";
    } else if (timespan === '2017') {
        startTime = new Date('2017-01-01T00:00:00').getTime();
        endTime = new Date('2017-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2017";
    } else if (timespan === '2018') {
        startTime = new Date('2018-01-01T00:00:00').getTime();
        endTime = new Date('2018-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2018";
    } else if (timespan === '2019') {
        startTime = new Date('2019-01-01T00:00:00').getTime();
        endTime = new Date('2019-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2019";
    } else if (timespan === '2020') {
        startTime = new Date('2020-01-01T00:00:00').getTime();
        endTime = new Date('2020-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2020";
    } else if (timespan === '2021') {
        startTime = new Date('2021-01-01T00:00:00').getTime();
        endTime = new Date('2021-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2021";
    } else if (timespan === '2022') {
        startTime = new Date('2022-01-01T00:00:00').getTime();
        endTime = new Date('2022-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2022";
    } else if (timespan === '2023') {
        startTime = new Date('2023-01-01T00:00:00').getTime();
        endTime = new Date('2023-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2023";
    } else if (timespan === '2024') {
        startTime = new Date('2024-01-01T00:00:00').getTime();
        endTime = new Date('2024-12-31T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "2024";
    } else if (timespan === 'eras-tour') {
        startTime = new Date('2023-03-30T12:00:00').getTime();
        endTime = new Date('2023-04-30T23:59:59').getTime();
        document.getElementById('stats-time-range').innerText = "The Month Before The Eras Tour";
    } else {
        startTime = new Date('2017-05-02').getTime(); // Start from May 2, 2017 for "All Time"
        document.getElementById('stats-time-range').innerText = "Your All Time Spotify History";
    }

    document.getElementById('stats-options').style.display = 'none';
    document.getElementById('stats-screen').style.display = 'block';

    calculateStatsForTimeframe(startTime, endTime);
}

async function calculateStatsForTimeframe(startTime, endTime) {
    showLoadingScreen();
    const data = await fetchDataForStats(startTime, endTime);
    const filteredSongs = data.filter(song => {
        const songEndTime = new Date(song.endTime).getTime();
        return songEndTime >= startTime && songEndTime <= endTime;
    });
    await calculateAndDisplayStats(filteredSongs, startTime, endTime);
    hideLoadingScreen();
}

async function getTopItems(data, key, isArray = false) {
    const counts = {};
    data.forEach(item => {
        const ids = isArray ? item[key] : [item[key]];
        ids.forEach(id => {
            if (!counts[id]) counts[id] = 0;
            counts[id]++;
        });
    });
    const topItems = Object.entries(counts)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Fetch names for top items
    if (key === 'trackId') {
        const trackNames = data.reduce((acc, item) => {
            acc[item.trackId] = item.trackName;
            return acc;
        }, {});

        const trackDataPromises = topItems.map(async item => {
            const trackData = await fetchTrackData(item.id);
            return {
                id: item.id,
                name: trackNames[item.id],
                artist: trackData.artistName,
                albumImage: trackData.albumImage,
                preview: trackData.preview,
                count: item.count
            };
        });
        return await Promise.all(trackDataPromises);
    } else if (key === 'albumId') {
        const albumDataPromises = topItems.map(async item => {
            const albumData = await fetchAlbumData(item.id);
            return {
                id: item.id,
                name: albumData.name,
                artist: albumData.artist,
                albumImage: albumData.albumImage,
                count: item.count
            };
        });
        return await Promise.all(albumDataPromises);
    } else if (key === 'artistIds') {
        const artistDataPromises = topItems.map(async item => {
            const artistData = await fetchArtistData(item.id);
            return {
                id: item.id,
                name: artistData.name,
                image: artistData.image,
                count: item.count
            };
        });
        return await Promise.all(artistDataPromises);
    }
    return topItems;
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    const date = new Date(dateString + 'T00:00:00Z'); // Treat dateString as UTC
    return date.toLocaleDateString('en-US', options);
}

function formatDateRange(startDateString, endDateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const formattedStartDate = startDate.toLocaleDateString('en-US', options);
    const formattedEndDate = endDate.toLocaleDateString('en-US', options);
    return `${formattedStartDate} - ${formattedEndDate}`;
}

function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function calculateAndDisplayStats(data, startTime, endTime) {
    const numStreams = data.length;
    const numMinutesStreamed = data.reduce((acc, item) => acc + item.playedMs / 60000, 0).toFixed(2);
    const numHoursStreamed = (numMinutesStreamed / 60).toFixed(2);
    const diffTracks = new Set(data.map(item => item.trackId)).size;
    const diffArtists = new Set(data.flatMap(item => item.artistIds)).size;
    const diffAlbums = new Set(data.map(item => item.albumId)).size;

    const numDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

    const avgStreamsPerSong = (numStreams / diffTracks).toFixed(2);
    const avgStreamsPerArtist = (numStreams / diffArtists).toFixed(2);
    const avgStreamsPerAlbum = (numStreams / diffAlbums).toFixed(2);
    const avgStreamsPerDay = (numStreams / numDays).toFixed(2);

    const streamsPerHour = new Array(24).fill(0);
    data.forEach(item => {
        const hour = new Date(item.endTime).getHours();
        streamsPerHour[hour]++;
    });

    const avgStreamsPerHour = streamsPerHour.map(streams => (streams));

    const streamsPerDay = {};
    data.forEach(item => {
        const localTime = new Date(item.endTime);
        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const day = String(localTime.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        if (!streamsPerDay[date]) {
            streamsPerDay[date] = 0;
        }
        streamsPerDay[date]++;
    });

    const mostStreamsDay = Object.entries(streamsPerDay).reduce((max, current) => current[1] > max[1] ? current : max);
    const [mostStreamsDate, mostStreamsCount] = mostStreamsDay;
    const formattedMostStreamsDate = formatDate(mostStreamsDate);

    const topSongsForDay = data.filter(item => {
        const localTime = new Date(item.endTime);
        const year = localTime.getFullYear();
        const month = String(localTime.getMonth() + 1).padStart(2, '0');
        const day = String(localTime.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;

        return date === mostStreamsDate;
    });
    const topSongsCounts = {};
    topSongsForDay.forEach(item => {
        if (!topSongsCounts[item.trackId]) {
            topSongsCounts[item.trackId] = {
                name: item.trackName,
                count: 0
            };
        }
        topSongsCounts[item.trackId].count++;
    });

    const top10Songs = Object.entries(topSongsCounts)
        .map(([id, info]) => ({ id, ...info }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Fetch artist names for top 10 songs
    const top10SongsWithArtists = await Promise.all(top10Songs.map(async song => {
        const trackData = await fetchTrackData(song.id);
        return {
            ...song,
            artist: trackData.artistName,
            albumImage: trackData.albumImage,
            preview: trackData.preview
        };
    }));

    const sortedDates = Object.keys(streamsPerDay).sort();
    let longestStreak = 1;
    let currentStreak = 1;
    let longestStreakStart = sortedDates[0];
    let longestStreakEnd = sortedDates[0];
    let currentStreakStart = sortedDates[0];

    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);
        const diffTime = currentDate - previousDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            currentStreak++;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
                longestStreakStart = currentStreakStart;
                longestStreakEnd = sortedDates[i];
            }
        } else {
            currentStreak = 1;
            currentStreakStart = sortedDates[i];
        }
    }

    const formattedLongestStreakStart = formatDate(longestStreakStart);
    const formattedLongestStreakEnd = formatDate(longestStreakEnd);
    if (document.getElementById('stats-time-range').innerText == "Your All Time Spotify History") {
        document.getElementById('top-new-track').hidden = true;
        document.getElementById('top-new-artist').hidden = true;
        document.getElementById('top-new-album').hidden = true;
        document.getElementById('percent-new-tracks').hidden = true;
        document.getElementById('percent-new-artists').hidden = true;
        document.getElementById('percent-new-albums').hidden = true;
    }
    else {
        document.getElementById('top-new-track').hidden = false;
        document.getElementById('top-new-artist').hidden = false;
        document.getElementById('top-new-album').hidden = false;
        document.getElementById('percent-new-tracks').hidden = false;
        document.getElementById('percent-new-artists').hidden = false;
        document.getElementById('percent-new-albums').hidden = false;
        // Fetch all data from May 2, 2017, until the startTime
        const unfilteredInitialData = await fetchAPIAndLocalData(new Date('2017-05-02').getTime(), startTime);
        const initialData = unfilteredInitialData.filter(song => {
            const songEndTime = new Date(song.endTime).getTime();
            return songEndTime < startTime;
        });
        // Create lists of discovered tracks, artists, and albums
        const discoveredTracks = new Set(initialData.map(item => item.trackId));
        const discoveredArtists = new Set(initialData.flatMap(item => item.artistIds));
        const discoveredAlbums = new Set(initialData.map(item => item.albumId));

        // Create lists to track new tracks, artists, and albums
        const newTracks = {};
        const newArtists = {};
        const newAlbums = {};

        // Check for new tracks, artists, and albums in the given time period
        data.forEach(item => {
            if (!discoveredTracks.has(item.trackId)) {
                if (!newTracks[item.trackId]) {
                    newTracks[item.trackId] = {
                        name: item.trackName,
                        count: 0
                    };
                }
                newTracks[item.trackId].count++;
            }

            item.artistIds.forEach(artistId => {
                if (!discoveredArtists.has(artistId)) {
                    if (!newArtists[artistId]) {
                        newArtists[artistId] = {
                            count: 0
                        };
                    }
                    newArtists[artistId].count++;
                }
            });

            if (!discoveredAlbums.has(item.albumId)) {
                if (!newAlbums[item.albumId]) {
                    newAlbums[item.albumId] = {
                        count: 0
                    };
                }
                newAlbums[item.albumId].count++;
            }
        });

        // Calculate the top new tracks, artists, and albums
        const topNewTracks = Object.entries(newTracks).map(([id, info]) => ({ id, ...info })).sort((a, b) => b.count - a.count).slice(0, 10);
        const topNewArtists = Object.entries(newArtists).map(([id, info]) => ({ id, ...info })).sort((a, b) => b.count - a.count).slice(0, 10);
        const topNewAlbums = Object.entries(newAlbums).map(([id, info]) => ({ id, ...info })).sort((a, b) => b.count - a.count).slice(0, 10);

        // Fetch artist and album names for top new tracks, artists, and albums

        const topNewTracksWithNames = await Promise.all(topNewTracks.map(async track => {
            const trackData = await fetchTrackData(track.id);
            return {
                ...track,
                artist: trackData.artistName,
                albumImage: trackData.albumImage,
                preview: trackData.preview
            };
        }));

        const topNewArtistsWithNames = await Promise.all(topNewArtists.map(async artist => {
            const artistData = await fetchArtistData(artist.id);
            return {
                ...artist,
                name: artistData.name,
                image: artistData.image
            };
        }));

        const topNewAlbumsWithNames = await Promise.all(topNewAlbums.map(async album => {
            const albumData = await fetchAlbumData(album.id);
            return {
                ...album,
                name: albumData.name,
                artist: albumData.artist,
                albumImage: albumData.albumImage
            };
        }));

        const percentNewTrackStreams = (Object.entries(newTracks).length / diffTracks * 100).toFixed(2);
        const percentNewArtistStreams = (Object.entries(newArtists).length / diffArtists * 100).toFixed(2);
        const percentNewAlbumStreams = (Object.entries(newAlbums).length / diffAlbums * 100).toFixed(2);

        // Display the top new tracks, artists, and albums
        document.getElementById('top-new-track-value').innerHTML = topNewTracksWithNames.map(track => `<p><img src="${track.albumImage}" alt="${track.name}" style="width:30px;height:30px;margin-right:10px;">${track.name} (${track.artist}) - ${track.count.toLocaleString("en-US")} streams ${track.preview ? `<button class="preview-button" onclick="playPreview('${track.preview}')">Play</button>` : ''}</p>`).join('');
        document.getElementById('top-new-artist-value').innerHTML = topNewArtistsWithNames.map(artist => `<p><img src="${artist.image}" alt="${artist.name}" style="width:30px;height:30px;margin-right:10px;">${artist.name} - ${artist.count.toLocaleString("en-US")} streams</p>`).join('');
        document.getElementById('top-new-album-value').innerHTML = topNewAlbumsWithNames.map(album => `<p><img src="${album.albumImage}" alt="${album.name}" style="width:30px;height:30px;margin-right:10px;">${album.name} (${album.artist}) - ${album.count.toLocaleString("en-US")} streams</p>`).join('');

        // Display the percentage of streams from new tracks, artists, and albums
        document.getElementById('percent-new-tracks-value').innerText = `${percentNewTrackStreams}%`;
        document.getElementById('percent-new-artists-value').innerText = `${percentNewArtistStreams}%`;
        document.getElementById('percent-new-albums-value').innerText = `${percentNewAlbumStreams}%`;
    }

    document.getElementById('num-streams-value').innerText = numStreams.toLocaleString("en-US");
    document.getElementById('num-minutes-streamed-value').innerText = Number(numMinutesStreamed).toLocaleString("en-US");
    document.getElementById('num-hours-streamed-value').innerText = Number(numHoursStreamed).toLocaleString("en-US");
    document.getElementById('diff-tracks-value').innerText = diffTracks.toLocaleString("en-US");
    document.getElementById('diff-artists-value').innerText = diffArtists.toLocaleString("en-US");
    document.getElementById('diff-albums-value').innerText = diffAlbums.toLocaleString("en-US");
    document.getElementById('avg-streams-per-song-value').innerText = avgStreamsPerSong.toLocaleString("en-US");
    document.getElementById('avg-streams-per-artist-value').innerText = avgStreamsPerArtist.toLocaleString("en-US");
    document.getElementById('avg-streams-per-album-value').innerText = avgStreamsPerAlbum.toLocaleString("en-US");
    document.getElementById('avg-streams-per-day-value').innerText = avgStreamsPerDay.toLocaleString("en-US");
    //document.getElementById('listening-clock-value').innerHTML = avgStreamsPerHour.map((streams, hour) => `<p>${hour}:00-${hour}:59 - ${streams} streams</p>`).join('');
   
    //document.getElementById('streams-most-active-day-value').innerHTML = `${formattedMostStreamsDate} - ${mostStreamsCount.toLocaleString("en-US") } streams`;
    //document.getElementById('streams-most-active-day-value').innerHTML += "<br />";
    //// Update DOM element for top 10 songs of the day with the most streams
    //document.getElementById('streams-most-active-day-value').innerHTML += top10SongsWithArtists.map(song => `<p>${song.name} (${song.artist}) - ${song.count.toLocaleString("en-US") } streams</p>`).join('');
    document.getElementById('streams-most-active-day-value').innerHTML = `${formattedMostStreamsDate} - ${mostStreamsCount.toLocaleString("en-US")} streams<br /><br />`;
    // Update DOM element for top 10 songs of the day with the most streams
    //document.getElementById('streams-most-active-day-value').innerHTML += top10SongsWithArtists.map(song => `${song.name} (${song.artist}) - ${song.count.toLocaleString("en-US")} streams<br />`).join('');
    document.getElementById('streams-most-active-day-value').innerHTML += top10SongsWithArtists.map(track => `<p><img src="${track.albumImage}" alt="${track.name}" style="width:30px;height:30px;margin-right:10px;">${track.name} (${track.artist}) - ${track.count.toLocaleString("en-US")} streams ${track.preview ? `<button class="preview-button" onclick="playPreview('${track.preview}')">Play</button>` : ''}</p>`).join('');

    document.getElementById('longest-streak-value').innerText = `${longestStreak.toLocaleString("en-US")} days (${formattedLongestStreakStart} - ${formattedLongestStreakEnd})`;

    const topTracks = await getTopItems(data, 'trackId');
    const topAlbums = await getTopItems(data, 'albumId');
    const topArtists = await getTopItems(data, 'artistIds', true);

    document.getElementById('top-tracks-value').innerHTML = topTracks.map(item => `<p><img src="${item.albumImage}" alt="${item.name}" style="width:30px;height:30px;margin-right:10px;">${item.name} (${item.artist}) - ${item.count.toLocaleString("en-US")} streams ${item.preview ? `<button class="preview-button" onclick="playPreview('${item.preview}')">Play</button>` : ''}</p>`).join('');
    document.getElementById('top-artists-value').innerHTML = topArtists.map(item => `<p><img src="${item.image}" alt="${item.name}" style="width:30px;height:30px;margin-right:10px;">${item.name} - ${item.count.toLocaleString("en-US")} streams</p>`).join('');
    document.getElementById('top-albums-value').innerHTML = topAlbums.map(item => `<p><img src="${item.albumImage}" alt="${item.name}" style="width:30px;height:30px;margin-right:10px;">${item.name} (${item.artist}) - ${item.count.toLocaleString("en-US")} streams</p>`).join('');
    createListeningClock(avgStreamsPerHour);
}

function createListeningClock(avgStreamsPerHour) {
    $(function () {
        $('[data-toggle="tooltip"]').tooltip()
    })

    //const data = avgStreamsPerHour.map((scrobbles, hour) => ({ hour, scrobbles }));
    let data = [
        { hour: 0, scrobbles: 0 },
        { hour: 1, scrobbles: 0 },
        { hour: 2, scrobbles: 0 },
        { hour: 3, scrobbles: 0 },
        { hour: 4, scrobbles: 0 },
        { hour: 5, scrobbles: 0 },
        { hour: 6, scrobbles: 0 },
        { hour: 7, scrobbles: 0 },
        { hour: 8, scrobbles: 0 },
        { hour: 9, scrobbles: 0 },
        { hour: 10, scrobbles: 0 },
        { hour: 11, scrobbles: 0 },
        { hour: 12, scrobbles: 0 },
        { hour: 13, scrobbles: 0 },
        { hour: 14, scrobbles: 0 },
        { hour: 15, scrobbles: 0 },
        { hour: 16, scrobbles: 0 },
        { hour: 17, scrobbles: 0 },
        { hour: 18, scrobbles: 0 },
        { hour: 19, scrobbles: 0 },
        { hour: 20, scrobbles: 0 },
        { hour: 21, scrobbles: 0 },
        { hour: 22, scrobbles: 0 },
        { hour: 23, scrobbles: 0 }
    ];
    for (let hour = 0; hour < 24; hour++) {
        data[hour].scrobbles = avgStreamsPerHour[hour];
    }

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    const innerRadiusBase = 60;
    const maxScrobbles = d3.max(data, d => d.scrobbles);

    const svg = d3.select("#clock")
        .html("") // Clear previous contents
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("data-toggle", "tooltip")
        // .attr("data-placement", "top")
        .attr("title", "Test")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("visibility", "hidden");

    // Create the base clock outline
    const baseArc = d3.arc()
        .innerRadius(innerRadiusBase)
        .outerRadius(radius)
        .startAngle(d => (d.hour / 24) * 2 * Math.PI)
        .endAngle(d => ((d.hour + 1) / 24) * 2 * Math.PI)
        .padAngle(0.01)
        .padRadius(innerRadiusBase);

    svg.selectAll(".base-arc")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "base-arc")
        .attr("d", baseArc)
        .attr("fill", "#2c2c2c")
        .attr("stroke", "#1a1b1e")
        .attr("stroke-width", 2);

    // Create the arcs for scrobbles
    const scrobbleArc = d3.arc()
        .innerRadius(innerRadiusBase)
        .outerRadius(d => innerRadiusBase + (radius - innerRadiusBase) * (d.data.scrobbles / maxScrobbles))
        .startAngle(d => (d.data.hour / 24) * 2 * Math.PI)
        .endAngle(d => ((d.data.hour + 1) / 24) * 2 * Math.PI)
        .padAngle(0.01)
        .padRadius(innerRadiusBase);

    const pie = d3.pie()
        .value(() => 1)
        .sort(null);

    svg.selectAll(".scrobble-arc")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("class", "scrobble-arc")
        .attr("d", scrobbleArc)
        .attr("fill", "#1DB954")  // Set all bars to the same green color
        .attr("stroke", "#1a1b1e")
        .attr("stroke-width", 2)
        .on("mouseover", function (event, d) {
            // Re-initialize Bootstrap tooltip with the updated title
            $('[data-toggle="tooltip"]').tooltip("dispose");
            $('[data-toggle="tooltip"]').tooltip(
                {
                    title: d.data.scrobbles + " streams",
                    html: true,
                    // placement: 'bottom', // Replace 'right' with 'top', 'bottom', or 'left' to set a different position
                    // offset: [window.event.pageX, window.event.pageY]
                }
            );
            $('[data-toggle="tooltip"]').tooltip("show");

        })
        .on("mousemove", function (event) {
            // tooltip.style("top", (event.pageY - 10) + "px")
            //     .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            // tooltip.style("visibility", "hidden");
            // $(tooltip.node()).tooltip('hide');
            $('[data-toggle="tooltip"]').tooltip("dispose");
        });

    // Add clock hands
    const clockHands = [
        { hour: 0, label: "00" },
        { hour: 6, label: "06" },
        { hour: 12, label: "12" },
        { hour: 18, label: "18" }
    ];

    svg.selectAll(".clock-hand")
        .data(clockHands)
        .enter()
        .append("line")
        .attr("class", "clock-hand")
        .attr("x1", d => innerRadiusBase * Math.cos((d.hour / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("y1", d => innerRadiusBase * Math.sin((d.hour / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("x2", d => (innerRadiusBase - 10) * Math.cos((d.hour / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("y2", d => (innerRadiusBase - 10) * Math.sin((d.hour / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("stroke", "#fff")
        .attr("stroke-width", 2);

    svg.selectAll(".clock-label")
        .data(clockHands)
        .enter()
        .append("text")
        .attr("class", "clock-label")
        .attr("x", d => (innerRadiusBase - 20) * Math.cos((d.hour / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("y", d => (innerRadiusBase - 20) * Math.sin((d.hour / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .text(d => d.label);

    // Add ticks for every hour
    const ticks = d3.range(24);

    svg.selectAll(".tick")
        .data(ticks)
        .enter()
        .append("line")
        .attr("class", "tick")
        .attr("x1", d => (innerRadiusBase - 2) * Math.cos((d / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("y1", d => (innerRadiusBase - 2) * Math.sin((d / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("x2", d => (innerRadiusBase - 8) * Math.cos((d / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("y2", d => (innerRadiusBase - 8) * Math.sin((d / 24) * 2 * Math.PI - Math.PI / 2))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);
}

function resetStats() {
    document.getElementById('stats-timespan').value = 'week';
    document.getElementById('custom-stats-time-range').style.display = 'none';
    document.getElementById('stats-time-range').innerText = '';
    const statsItems = document.querySelectorAll('#stats-visualizations .stats-item p');
    statsItems.forEach(item => item.innerText = '');
}

function goBackStats() {
    if (currentAudio) {
        currentAudio.pause();
    }
    document.getElementById('stats-screen').style.display = 'none';
    document.getElementById('stats-options').style.display = 'block';
}



async function showBillboardChartsOptions() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('billboard-charts-options').style.display = 'block';
    document.getElementById('billboard-charts-screen').style.display = 'none';
    document.getElementById('quiz-options').style.display = 'none';
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('stats-options').style.display = 'none';
    document.getElementById('stats-screen').style.display = 'none';
    window.scrollTo({ top: 0});
}

function prepareBillboardCharts(data, timePeriod) {
    const chartsData = {};
    const rankHistory = {}; // To track the rank history of each track
    const periods = timePeriod === 'months' ? getMonthsPeriods() : getYearsPeriods();

    periods.forEach((period, index) => {
        const dateKey = period.label;
        chartsData[dateKey] = [];

        // Calculate top songs for the current period
        const topSongs = calculateTopSongs(data, periods[0].start, period.end)
            .slice(0, 100);

        topSongs.forEach(([trackId, trackData], rank) => {
            // Track the rank history of each track
            if (!rankHistory[trackId]) {
                rankHistory[trackId] = new Array(periods.length).fill(null);
            }
            rankHistory[trackId][index] = rank;

            chartsData[dateKey].push({
                trackId,
                name: trackData.name,
                artist: trackData.artist,
                streams: trackData.streams
            });

        });
    });

    return { chartsData, rankHistory };
}

function displayBillboardCharts({ chartsData, rankHistory }, timeSpan) {
    const billboardCharts = document.getElementById('billboard-charts');
    billboardCharts.innerHTML = '';

    // Add headers
    const headerRow = document.createElement('tr');
    const rankHeader = document.createElement('th');
    rankHeader.innerText = 'Rank';
    headerRow.appendChild(rankHeader);

    const dateKeys = Object.keys(chartsData).filter(key => !key.startsWith('2016')); // Filter out 2016
    dateKeys.forEach(dateKey => {
        const dateHeader = document.createElement('th');
        dateHeader.innerText = dateKey.split('-')[0]; // Display only the year or month
        headerRow.appendChild(dateHeader);
    });

    billboardCharts.appendChild(headerRow);

    // Add rows for each rank (1 to 100)
    for (let rank = 0; rank < 100; rank++) {
        const row = document.createElement('tr');

        // Rank column
        const rankCell = document.createElement('td');
        rankCell.innerText = rank + 1;
        row.appendChild(rankCell);

        // Song columns for each time period
        dateKeys.forEach((dateKey, index) => {
            const track = chartsData[dateKey][rank]; // Get the track at this rank for the current time period
            const dataCell = document.createElement('td');

            if (track) {
                let rankChangeIcon = '';

                if (index > 0) {
                    let previousRank;
                    if (timeSpan == "months") {
                        previousRank = rankHistory[track.trackId][index - 1];
                    }
                    else {
                        previousRank = rankHistory[track.trackId][index];
                    }
                    const currentRank = rank;

                    if (previousRank === null) {
                        rankChangeIcon = 'NEW';
                    } else if (currentRank < previousRank) {
                        rankChangeIcon = '▲';
                    } else if (currentRank > previousRank) {
                        rankChangeIcon = '▼';
                    } else {
                        rankChangeIcon = '➔';
                    }
                }
                dataCell.innerText = `${rankChangeIcon} ${track.name} - ${track.streams.toLocaleString()}`;
            } else {
                dataCell.innerText = '';
            }

            row.appendChild(dataCell);
        });

        billboardCharts.appendChild(row);
    }
}

async function showBillboardCharts() {
    try {
        showLoadingScreen();

        const timeSpan = document.getElementById('chart-timespan').value;
        const data = await fetchAPIAndLocalData(new Date('2017-05-01').getTime(), new Date().getTime());

        if (!data) {
            throw new Error('No data fetched');
        }

        const { chartsData, rankHistory } = prepareBillboardCharts(data, timeSpan);
        displayBillboardCharts({ chartsData, rankHistory }, timeSpan);

        document.getElementById('billboard-charts-options').style.display = 'none';
        document.getElementById('billboard-charts-screen').style.display = 'block';

        hideLoadingScreen();
    } catch (error) {
        console.error('Error in showBillboardCharts:', error);
    }
}

function calculateTopSongs(data, startTime, endTime) {
    const filteredData = data.filter(item => {
        const songEndTime = new Date(item.endTime).getTime();
        return songEndTime >= startTime && songEndTime < endTime;
    });

    const songCounts = filteredData.reduce((acc, item) => {
        if (!acc[item.trackId]) {
            acc[item.trackId] = {
                name: item.trackName,
                artist: item.artistName,
                streams: 0
            };
        }
        acc[item.trackId].streams += 1;
        return acc;
    }, {});

    const sortedSongs = Object.entries(songCounts).sort((a, b) => b[1].streams - a[1].streams);
    return sortedSongs;
}

function getMonthsPeriods() {
    const periods = [];
    const start = new Date('2017-05-02'); // Start from May 2017
    const end = new Date();

    for (let d = start; d <= end; d.setMonth(d.getMonth() + 1)) {
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        periods.push({ label: startOfMonth.toLocaleString('default', { month: 'short', year: 'numeric' }), start: startOfMonth, end: endOfMonth });
    }

    return periods;
}

function getYearsPeriods() {
    const periods = [];
    const start = new Date('2017-01-01');
    const end = new Date();

    for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        periods.push({ label: year, start: startOfYear, end: endOfYear });
    }

    return periods;
}
