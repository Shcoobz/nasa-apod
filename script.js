const resultsNav = document.getElementById('resultsNav');
const favoritesNav = document.getElementById('favoritesNav');
const imagesContainer = document.querySelector('.images-container');
const saveConfirmed = document.querySelector('.save-confirmed');
const removeConfirmed = document.querySelector('.remove-confirmed');
const loader = document.querySelector('.loader');

// NASA API
const count = 10;
const apiKey = 'DEMO_KEY';
const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&count=${count}`;

let resultsArray = [];
let favorites = {};

function showContent(page) {
  window.scrollTo({ top: 0, behavior: 'instant' });

  if (page === 'results') {
    resultsNav.classList.remove('hidden');
    favoritesNav.classList.add('hidden');
  } else {
    resultsNav.classList.add('hidden');
    favoritesNav.classList.remove('hidden');
  }

  loader.classList.add('hidden');
}

function createDOMNodes(page) {
  const currentArray = page === 'results' ? resultsArray : Object.values(favorites);

  currentArray.forEach((result) => {
    // Card Container
    const card = document.createElement('div');
    card.classList.add('card');

    let mediaContainer;
    if (result.media_type === 'image') {
      mediaContainer = document.createElement('a');
      mediaContainer.href = result.hdurl;
      mediaContainer.title = 'View Full Image';
      mediaContainer.target = '_blank';

      const image = document.createElement('img');
      image.src = result.url;
      image.alt = 'NASA Picture of the Day';
      image.loading = 'lazy';
      image.classList.add('card-img-top');
      mediaContainer.appendChild(image);
    } else if (result.media_type === 'video') {
      mediaContainer = document.createElement('iframe');
      mediaContainer.src = result.url;
      mediaContainer.title = 'NASA Video of the Day';
      mediaContainer.classList.add('card-img-top');
      mediaContainer.classList.add('video-frame');
      mediaContainer.style.border = 'none';
      mediaContainer.style.width = '100%';
      mediaContainer.style.height = '500px';
    }

    // Card Body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    // Flex container for title and icon
    const titleAndIconContainer = document.createElement('div');
    titleAndIconContainer.classList.add('title-icon-container');

    // Card Title
    const cardTitle = document.createElement('h5');
    cardTitle.classList.add('card-title');
    cardTitle.textContent = result.title;

    // Save Text (Heart Icon)
    const saveText = document.createElement('span');
    saveText.classList.add('clickable');
    if (page === 'results') {
      saveText.innerHTML = `<i class="far fa-heart clickable" data-url="${result.url}" title="Add to Favorites"></i>`;
    } else {
      saveText.innerHTML = `<i class="fas fa-heart clickable" data-url="${result.url}" title="Remove from Favorites"></i>`;
    }
    saveText.onclick = () => {
      page === 'results' ? saveFavorite(result.url) : removeFavorite(result.url);
    };

    // Card Text
    const cardText = document.createElement('p');
    cardText.textContent = result.explanation;
    // Footer Container
    const footer = document.createElement('small');
    footer.classList.add('text-muted');
    // Date
    const date = document.createElement('strong');
    date.textContent = result.date;
    // Copyright
    const copyrightResult = result.copyright === undefined ? '' : result.copyright;
    const copyright = document.createElement('span');
    copyright.textContent = ` ${copyrightResult}`;

    // Append
    footer.append(date, copyright);
    titleAndIconContainer.append(cardTitle, saveText);

    cardBody.append(titleAndIconContainer, cardText, footer);

    card.append(mediaContainer, cardBody);
    imagesContainer.appendChild(card);
  });
}

//
function updateDOM(page) {
  // Get Favorites from LocalStorage
  if (localStorage.getItem('nasaFavorites')) {
    favorites = JSON.parse(localStorage.getItem('nasaFavorites'));
  }

  imagesContainer.textContent = '';

  createDOMNodes(page);
  showContent(page);
}

// Get 10 Images from NASA API
async function getNasaPictures() {
  // Show Loader
  loader.classList.remove('hidden');

  try {
    const response = await fetch(apiUrl);
    resultsArray = await response.json();
    updateDOM('results');
  } catch (error) {
    // Catch Error Here
    console.log(error);
  }
}

// Add result to Favorites
function saveFavorite(itemUrl) {
  // Loop through Results Array to select Favorite
  resultsArray.forEach((item) => {
    if (item.url.includes(itemUrl) && !favorites[itemUrl]) {
      favorites[itemUrl] = item;
      const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);
      if (iconElement) {
        iconElement.className = 'fas fa-heart clickable'; // Change to filled heart
        iconElement.title = 'Remove from Favorites'; // Update title
      }
      // Show Save Confirmation for 2 Seconds
      saveConfirmed.hidden = false;
      setTimeout(() => {
        saveConfirmed.hidden = true;
      }, 2000);
      // Set Favorites in localStorage
      localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    }
  });
}

// Remove item from Favorites
function removeFavorite(itemUrl) {
  if (favorites[itemUrl]) {
    delete favorites[itemUrl];
    const iconElement = document.querySelector(`.fa-heart[data-url="${itemUrl}"]`);
    if (iconElement) {
      iconElement.className = 'far fa-heart clickable'; // Change to outlined heart
      iconElement.title = 'Add to Favorites'; // Update title
    }
    // Show Remove Confirmation for 2 Seconds
    removeConfirmed.hidden = false;
    setTimeout(() => {
      removeConfirmed.hidden = true;
    }, 2000);
    // Set Favorites in localStorage
    localStorage.setItem('nasaFavorites', JSON.stringify(favorites));
    updateDOM('favorites');
  }
}

// On Load
// getNasaPictures();
