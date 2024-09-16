//App controls
const minButton = document.querySelector('#min-window');
const maxButton = document.querySelector('#max-window');
const closeButton = document.querySelector('#close-app');

minButton.addEventListener('click', () => {
    ipcRenderer.send('minApp');
});

maxButton.addEventListener('click', () => {
    ipcRenderer.send('maxApp');
});

closeButton.addEventListener('click', () => {
    ipcRenderer.send('closeApp');
});


// DOM references

const openfileButton = document.querySelector('#btn-openfile');
const openfolderButton = document.querySelector('#btn-openfolder');
const togglePlayButton = document.querySelector('#togglePlay');
const coverArt = document.querySelector('#cover-art');
const trackNameEl = document.querySelector('#track-name');
const trackArtistEl = document.querySelector('#track-artist');
const trackAlbumEl = document.querySelector('#track-album');
const playbackProgress = document.querySelector('#playback-progress');
const currentTimeEl = document.querySelector('.currentTime');
const durationEl = document.querySelector('.duration');
const volumeSlider = document.querySelector('#volume-slider');
const playlistEl = document.querySelector('#playlist');
const playlistStats = document.querySelector('#playlist-stats');
const nextTrackButton = document.querySelector('#nextTrack');
const prevTrackButton = document.querySelector('#prevTrack');
const shuffleButton = document.querySelector('#shuffle');
const repeatButton = document.querySelector('#repeat');

// global Variables
let currentTrack = new Audio();
let currentTrackLoaded = null;
let playing;
let totalDuration = 0;
let repeat = false;
let shuffle = false;
let shufflePlaylist = [];
let playlistItems = [];
let playlistLength = 0;
let draggedItem = null;
const pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6"> <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" /></svg>';
const playIcon = '<svg viewBox="0 0 24 24" fill="#fefeff" class="w-6 h-6"><path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" /></svg>';   

//global Functions
const play = () => {
    if(!currentTrackLoaded) return console.log('No song loaded');
    playing = true;
    togglePlayButton.innerHTML = pauseIcon;
    togglePlayButton.title = 'Pause'
    currentTrack.play();
};

const pause = () => {
    playing = false;
    togglePlayButton.innerHTML = playIcon;
    togglePlayButton.title = 'Play'
    currentTrack.pause();
};

const stop = () => {
    pause();
    currentTrack.currentTime = 0;
    playbackProgress.value = 0;
    currentTrack.src = "";   
    currentTrackLoaded = null;

    coverArt.setAttribute("src", "./img/music-placeholder.png");
    
    trackNameEl.innerText = '';
    trackNameEl.style.visibility = 'hidden'; // como mantener espacio en app?
    
    trackArtistEl.innerText = '';
    trackArtistEl.style.visibility = 'hidden';
    
    trackAlbumEl.innerText = '';
    trackAlbumEl.style.visibility = 'hidden';

    currentTimeEl.innerHTML = '0:00';
    durationEl.innerHTML = '0:00';

    playlistItems.forEach(e => e.classList.remove('active'));
};

const checkFile = async (filepath) => {
    try {
        const exists = await ipcRenderer.invoke('checkFilePath', filepath);
        return exists;
    } catch (error) {
        console.error(error);
    };
};

const getTrackData = async (id) => {
    try {
        return await ipcRenderer.invoke('requestTrackData', id);
    } catch (error) {
        console.error(error);
    }
};

const loadTrack = async (id) => { 
    try {
        const trackData = await getTrackData(id);
        const { filePath, coverPicture, trackName, trackArtist, trackAlbum } = trackData;

        const fileExists = await checkFile(filePath);
        if(fileExists) {
            currentTrack.src = filePath;
            
            currentTrack.oncanplaythrough = () => {
                if(coverPicture) {
                const byteCharacters = atob(coverPicture.pictureBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                const blob = new Blob([byteArray], { type: coverPicture.mimeType });
                const imageUrl = URL.createObjectURL(blob);
                coverArt.setAttribute("src", imageUrl);

                } else {
                    coverArt.setAttribute("src", "./img/music-placeholder.png");
                };
            
                trackNameEl.innerText = trackName? trackName : 'Unknown';
                trackArtistEl.innerText = trackArtist? trackArtist : 'Unknown';
                trackAlbumEl.innerText = trackAlbum? trackAlbum : 'Unknown';
                trackNameEl.style.visibility = 'visible';
                trackArtistEl.style.visibility = 'visible';
                trackAlbumEl.style.visibility = 'visible';
                
                playlistItems.forEach(e => e.classList.remove('active'));
                currentTrackLoaded = id;
                const activeTrack = Array.from(playlistItems).find(e => e.dataset.trackId === currentTrackLoaded);
                activeTrack.classList.add('active');
            
                play();
            };
        } else {
            nextTrack();
        }
    } catch (error) {
        console.error(error);
    };
};

const shuffleTracks = () => {
    if(shufflePlaylist.length <= 0) return -1;

    const index = Math.floor(Math.random() * shufflePlaylist.length);
    shufflePlaylist.splice(index, 1);
    return index;
};

const nextTrack = () => {
    let nextTrackIndex;
    const playlistArray = Array.from(playlistItems);

    if(repeat) {
        nextTrackIndex = playlistArray.findIndex(e => e.dataset.trackId === currentTrackLoaded);
    } else if (shuffle) {
        nextTrackIndex = shuffleTracks()
    } else {
        const currentTrackIndex = playlistArray.findIndex(e => e.dataset.trackId === currentTrackLoaded);
        nextTrackIndex = (currentTrackIndex + 1) % playlistArray.length;
    };
    
    if(nextTrackIndex === -1) return stop();

    loadTrack(playlistItems[nextTrackIndex].dataset.trackId);
};

const prevTrack = () => {
    let prevTrackIndex;
    const playlistArray = Array.from(playlistItems);

    if(repeat) {
        prevTrackIndex = playlistArray.findIndex(e => e.dataset.trackId === currentTrackLoaded);
    } else if (shuffle) {
        prevTrackIndex = shuffleTracks()
    } else {
        const currentTrackIndex = playlistArray.findIndex(e => e.dataset.trackId === currentTrackLoaded);
        prevTrackIndex = (currentTrackIndex - 1 + playlistArray.length) % playlistArray.length;
    };

    if(prevTrackIndex === -1) return stop();

    loadTrack(playlistItems[prevTrackIndex].dataset.trackId);
};

const formatTime = (time) => {
    let hours = Math.floor(time / 3600);
    let minutes = Math.floor((time % 3600) / 60);
    let seconds = Math.floor(time % 60);

    minutes = minutes < 10 && hours > 0 ? `0${minutes}` : minutes;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    let formattedTime = hours > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
    return formattedTime;
};

const getDragAfterElement = (container, y) => {
    const draggableElements = [...container.querySelectorAll('.playlist-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y -box.top - box.height / 2;
        if(offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element
};

const playProgress = () => {
    if(playing) {
        let { duration, currentTime } = currentTrack;
    
        isNaN(duration) ? (duration = 0) : duration;
        isNaN(currentTime) ? (currentTime = 0) : currentTime;
    
        currentTimeEl.innerHTML = formatTime(currentTime);
        durationEl.innerHTML = formatTime(duration);
    
        let progressPercentage = (currentTime/duration) * 100;
        playbackProgress.value = progressPercentage;
    };
};

const setPlaybackProgress = (value) => {
        currentTrack.muted = true;
        const targetTime = currentTrack.duration * (value / 100);
        currentTrack.currentTime = targetTime;
};

const setVolume = (value) => {
    currentTrack.volume = value;
};

const setTrackInfo = (track, index) => {
    const { coverPicture, trackArtist, trackName, duration, _id } = track;

    const playlistItem = document.createElement('div');
    playlistItem.classList.add('playlist-item');
    playlistItem.setAttribute('draggable', true);
    playlistItem.dataset.trackId = track._id;
    
    playlistItem.addEventListener('dblclick', () => {
        loadTrack(_id);
    });

    playlistItem.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
        draggedItem.classList.add('dragging');
    });

    playlistItem.addEventListener('dragend', () => {
        draggedItem.classList.remove('dragging');
    });

    playlistEl.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(playlistEl, e.clientY)
        if(afterElement == null) {
            playlistEl.appendChild(draggedItem);
            playlistItems = document.querySelectorAll('.playlist-item');
            updateVisualOrder();
        } else {
            playlistEl.insertBefore(draggedItem, afterElement);
            playlistItems = document.querySelectorAll('.playlist-item');
            updateVisualOrder();
        }
    });
    
    const itemOrder = document.createElement('p');
    itemOrder.classList.add('item-order');
    const order = index + 1;
    itemOrder.textContent = `${order}.`;

    const itemPicture = document.createElement('img');
    itemPicture.classList.add('item-picture');
    if(coverPicture) {
        const byteCharacters = atob(coverPicture.pictureBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: coverPicture.mimeType });
        const imageUrl = URL.createObjectURL(blob);
        itemPicture.setAttribute("src", imageUrl);
    } else {
        itemPicture.setAttribute("src", "./img/music-placeholder.png");
    };
    
    const itemName = document.createElement('p');
    itemName.id = 'item-name';
    itemName.textContent =  trackName? ` ${trackName}` : 'Unknown';
    
    const itemArtist = document.createElement('p');
    itemArtist.classList.add('item-artist');
    itemArtist.textContent = trackArtist? `${trackArtist}` : 'Unknown';
    
    const itemDuration = document.createElement('p');
    itemDuration.id = 'item-duration';
    const trackDuration =  formatTime(duration);
    itemDuration.textContent = `${trackDuration}`

    const itemInfo = document.createElement('div');
    itemInfo.classList.add('item-info');
    itemInfo.appendChild(itemOrder);
    itemInfo.appendChild(itemName);
    itemInfo.appendChild(itemArtist);

    playlistItem.appendChild(itemPicture);
    playlistItem.appendChild(itemInfo);
    playlistItem.appendChild(itemDuration);

    return playlistItem;
};

const updateVisualOrder = () => {
    playlistItems.forEach((item, index) => {
        const order = item.querySelector('.item-order');
        order.textContent = `${index + 1}`;
    });
}

// Events

togglePlayButton.addEventListener('click', e => {
    e.preventDefault();
    playing? pause() : play();
});

openfileButton.addEventListener('click', e => {
    ipcRenderer.send('tryToAddFile')
});

nextTrackButton.addEventListener('click', () => {
    nextTrack();
});

prevTrackButton.addEventListener('click', () => {
    if(playing && currentTrack.currentTime > 1) {
        currentTrack.currentTime = 0;
    } else {
        prevTrack();
    }
});

shuffleButton.addEventListener('click', () =>{
    if(shuffle) {
        shuffle = false;
        shuffleButton.classList.remove('activeBtn');
        shufflePlaylist = [];
    } else {
        shuffle = true;
        shuffleButton.classList.add('activeBtn');
        shufflePlaylist = Array.from(playlistItems);
    }
});


repeatButton.addEventListener('click', () => {
    if(repeat) {
        repeat = false;
        repeatButton.classList.remove('activeBtn');
    } else {
        repeat = true;
        repeatButton.classList.add('activeBtn');
    }
});

currentTrack.addEventListener('timeupdate', playProgress);
currentTrack.onended = () => {
    if(Array.from(playlistItems).findIndex(e => e.dataset.trackId === currentTrackLoaded) + 1 === playlistLength) {
        stop()
    } else {
        nextTrack();
    };
};

playbackProgress.addEventListener('input', () => {
    if(currentTrackLoaded) {
        setPlaybackProgress(playbackProgress.value)
    } else {
        playbackProgress.value = 0;
    };
});

playbackProgress.addEventListener('change', () => {
    currentTrack.muted = false;
    if(!playing) {
        playbackProgress.value = 0;
    }
});

volumeSlider.addEventListener('input', () => setVolume(volumeSlider.value / 100) );  


// IPC
ipcRenderer.on('addFilesToPlaylist', data => {
    if(!data || data.length === 0) return console.log('error');

    data.forEach((element, index) => {
        let newItem = setTrackInfo(element, index + playlistItems.length);
        totalDuration = totalDuration + +element.duration;
        playlistEl.appendChild(newItem);
        if(shuffle) {
            shufflePlaylist.push(newItem);
        }
    });

    playlistItems = document.querySelectorAll('.playlist-item');

    playlistLength = playlistItems.length;
    playlistStats.textContent = `${playlistLength} tracks | ${formatTime(totalDuration)}`;
});

// 'About' window
// Eliminar track de la playlist
// Elimiar todos los tracks?
// Omitir track cuando no se encuentra el archivo
// Guardar el último track activo
// Play in input event on slider when playback is in pause
// Search track function
// Custom cursor?
// Hide playlist
// Nice frontend
// Change colors?
// No arrastrar imagen
// Play con offset y pausa sin offset