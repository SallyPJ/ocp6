// ==========================
// 1. Configuration
// ==========================

/**
 * The base URL of the API for fetching movie data.
 * @constant {string}
 */
const apiBaseUrl = 'http://localhost:8000/api/v1/titles';

// ==========================
// 2. Data Fetching Functions (API)
// ==========================

/**
 * Generic function to fetch data from the API.
 * Handles HTTP errors and returns the parsed JSON data.
 *
 * @async
 * @param {string} [endpoint=''] - The API endpoint to fetch data from.
 * @returns {Promise<Object>} - A promise that resolves to the parsed JSON data from the API.
 * @throws {Error} - Throws an error if the API request fails.
 */
async function fetchApiData(endpoint = '') {
    const url = `${apiBaseUrl}/${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        throw error;
    }
}

/**
 * Fetches a list of movies with the specified query parameters.
 *
 * @param {string} [queryParams=''] - Query parameters to filter the list of movies.
 * @returns {Promise<Object>} - A promise that resolves to the list of movies.
 */
const fetchMovies = (queryParams = '') => fetchApiData(`?${queryParams}`);

/**
 * Fetches the details of a movie by its unique ID.
 *
 * @param {number} movieId - The unique identifier of the movie.
 * @returns {Promise<Object>} - A promise that resolves to the movie details.
 */
const fetchMovieDetails = (movieId) => fetchApiData(movieId);

// ==========================
// 3. Movie card et article Display Functions
// ==========================

/**
 * Displays the details of a single movie.
 * Updates the movie's image, title, summary, and binds the details button.
 *
 * @param {Object} movieDetails - The details of the movie to display.
 * @param {HTMLElement} container - The container element where the movie will be displayed.
 */
function displayMovie(movieDetails, container) {
    const template = document.querySelector('.template__best-movie').content.cloneNode(true);
    const movieImage = template.querySelector('.best-movie__image');
    const movieTitle = template.querySelector('.best-movie__title');
    const movieSummary = template.querySelector('.best-movie__summary');
    const detailsButton = template.querySelector('.best-movie__button--details');

    movieImage.src = movieDetails.image_url;
    movieImage.alt = `Affiche de ${movieDetails.title}`;
    movieTitle.textContent = movieDetails.title;
    movieSummary.textContent = movieDetails.description || 'Résumé non disponible.';
    detailsButton.addEventListener('click', () => openModal(movieDetails));

    container.innerHTML = '';
    container.appendChild(template);
}

/**
 * Displays a list of movies in the specified container.
 * Each movie is displayed as a card with an image, title, and details button.
 *
 * @param {Array<Object>} moviesDetails - An array of movie details to display.
 * @param {HTMLElement} container - The container element where the movies will be displayed.
 */
function displayMoviesList(moviesDetails, container) {
    container.innerHTML = '';
    moviesDetails.forEach(movie => container.appendChild(createMovieCard(movie)));
    manageToggleButton(container, moviesDetails.length);
}

/**
 * Creates a movie card for a given movie.
 * The card contains the movie's image, title, and a button to view details.
 *
 * @param {Object} movie - The movie details to create a card for.
 * @returns {HTMLElement} - The movie card element.
 */
function createMovieCard(movie) {
    const template = document.querySelector('.template__movie-card').content.cloneNode(true);
    const movieCard = template.querySelector('.movie-card');
    const movieImage = template.querySelector('.movie-card__image');
    const movieTitle = template.querySelector('.movie-card__title');
    const detailsButton = template.querySelector('.movie-card__button--details');

    movieImage.src = movie.image_url;
    movieImage.alt = `Affiche de ${movie.title}`;
    movieTitle.textContent = movie.title;

    detailsButton.addEventListener('click', () => openModal(movie));

    return movieCard;
}

/**
 * Creates a movie card for a given movie.
 * The card contains the movie's image, title, and a button to view details.
 *
 * @param {Object} movie - The movie details to create a card for.
 * @returns {HTMLElement} - The movie card element.
 */
async function displayTopMovie() {
    try {
        const moviesData = await fetchMovies('sort_by=-imdb_score,-votes&page_size=1');
        const topMovieDetails = await fetchMovieDetails(moviesData.results[0].id);
        displayMovie(topMovieDetails, document.querySelector('.best-movie__content'));
    } catch (error) {
        console.error('Erreur lors de l\'affichage du meilleur film :', error);
    }
}

/**
 * Fetches and displays top movies from all categories or a specific one.
 *
 * @async
 * @param {string} category - The category of movies (e.g., 'top', 'Comedy').
 * @param {string} containerSelector - The CSS selector of the container where the movies will be displayed.
 * @returns {Promise<void>} - A promise that resolves once the category movies are displayed.
 */
async function displayCategoryMovies(category, containerSelector) {
    let queryParams = '';
    if (category === 'top') {
        queryParams = 'sort_by=-imdb_score,-votes&page_size=7';
    } else {
        queryParams = `genre=${category}&sort_by=-imdb_score,-votes&page_size=6`;
    }

    try {
        const moviesData = await fetchMovies(queryParams);
        let moviesToDisplay = moviesData.results;
        if (category === 'top') {
            moviesToDisplay = moviesToDisplay.slice(1);
        }
        const categoryMoviesDetails = await Promise.all(
            moviesToDisplay.map(movie => fetchMovieDetails(movie.id))
        );
        displayMoviesList(categoryMoviesDetails, document.querySelector(containerSelector));
    } catch (error) {
        console.error(`Erreur lors de l'affichage des films pour la catégorie ${category} :`, error);
    }
}

// ==========================
//4. Modal Management Functions
// ==========================

/**
 * Opens a modal window with the details of the selected movie.
 * Updates the modal's content with the movie's title, image, genres, etc.
 *
 * @param {Object} movieDetails - The details of the movie to display in the modal.
 */
function openModal(movieDetails) {
    const modal = document.getElementById('modal');

    modal.querySelector('.modal__title').textContent = movieDetails.title;
    modal.querySelector('.modal__image').src = movieDetails.image_url;
    modal.querySelector('.modal__image').alt = `Affiche de ${movieDetails.title}`;
    modal.querySelector('.modal__year').textContent = `Année : ${movieDetails.year} `;
    modal.querySelector('.modal__genres').textContent = movieDetails.genres.join(', ');
    modal.querySelector('.modal__rated').textContent = movieDetails.rated && movieDetails.rated.toLowerCase().includes('not rated') ? 'PG Inconnu ' : `PG: ${movieDetails.rated} `;
    modal.querySelector('.modal__duration--value').textContent = movieDetails.duration;
    modal.querySelector('.modal__countries').textContent = `(${movieDetails.countries.join('/ ')})`;
    modal.querySelector('.modal__imdb_score--value').textContent = movieDetails.imdb_score || 'Non noté';
    modal.querySelector('.modal__worldwide-gross-income--value').textContent = movieDetails.worldwide_gross_income ? `${movieDetails.worldwide_gross_income} dollars` : 'Inconnue';
    modal.querySelector('.modal__director--name').textContent = movieDetails.directors.join(', ') || 'Inconnu';
    modal.querySelector('.modal__long_description').textContent = movieDetails.long_description;
    modal.querySelector('.modal__actors--list').textContent = movieDetails.actors.join(', ');

    modal.classList.remove('modal--hidden');
}


/**
 * Initializes the modal's close events.
 * Closes the modal when clicking outside of it or on the close button.
 */
function initializeModalCloseEvents() {
    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.modal__button--close');
    closeButton.addEventListener('click', () => modal.classList.add('modal--hidden'));
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.add('modal--hidden');
    });
}

// ==========================
// 5. Genre Management and Dropdown
// ==========================

/**
 * Fetches all available genres from the API and populates the genre dropdown.
 *
 * @async
 * @returns {Promise<void>} - A promise that resolves once all genres are fetched and populated.
 */
async function fetchAllGenres() {
    let url = `http://localhost:8000/api/v1/genres/`;
    let allGenres = [];

    try {
        while (url) {
            const response = await fetch(url);
            const data = await response.json();
            allGenres = [...allGenres, ...data.results.map(genre => genre.name)];
            url = data.next; // Mettre à jour l'URL pour la page suivante
        }
        populateGenreDropdown(allGenres);
    } catch (error) {
        console.error('Erreur lors de la récupération des genres :', error);
    }
}

/**
 * Populates the genre dropdown with the fetched genres.
 *
 * @param {Array<string>} genres - The list of genres to populate the dropdown.
 */
function populateGenreDropdown(genres) {
    const dropdown = document.querySelector('.category__select');
    dropdown.innerHTML = ''; // Clear any existing options

    // Populate with genres
    genres.forEach((genre, index) => {
        const option = document.createElement('option');
        option.value = genre.toLowerCase();
        option.textContent = genre;

        // Automatically select the first genre
        if (index === 0) {
            option.selected = true;
            displayCategoryMovies(option.value, '.category--genres .category__grid');
        }

        dropdown.appendChild(option);
    });
}

/**
 * Event listener for the genre dropdown change event.
 * Fetches and displays movies for the selected genre.
 */
document.querySelector('.category__select').addEventListener('change', (event) => {
    const selectElement = event.target;
    const selectedGenre = selectElement.value;

    // Reset all options by removing the emoji
    Array.from(selectElement.options).forEach(option => {
        option.textContent = option.textContent.replace('✅ ', '');
    });

    // Add emoji to the newly selected option
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    selectedOption.textContent = `${selectedOption.textContent}✅ `;

    // Display movies for the selected genre
    if (selectedGenre) {
        displayCategoryMovies(selectedGenre, '.category--genres .category__grid');
    }
});


// ==========================
// 6. "Show More" Button Management Functions
// ==========================

/**
 * Manages the "Show More" button for movie lists.
 * Adds the button if the number of movies exceeds the visible threshold.
 *
 * @param {HTMLElement} container - The container holding the movie cards.
 * @param {number} totalMovies - The total number of movies in the list.
 */
function manageToggleButton(container, totalMovies) {

    let visibleMovies;
    if (window.innerWidth <= 600) {
        visibleMovies = 2; // Mobile
    } else if (window.innerWidth <= 1024) {
        visibleMovies = 4; // Tablet
    } else {
        visibleMovies = 6; // Desktop
    }

    const existingButton = container.parentNode.querySelector('.category__button--toggle');

    if (!existingButton && totalMovies > visibleMovies && window.innerWidth < 1024) {
        const button = document.createElement('button');
        button.classList.add('category__button--toggle');
        button.textContent = 'Voir plus';
        container.parentNode.appendChild(button); // Add bouton at the end of the movies grid

        // Add event to the button to display/masque hidden movies
        button.addEventListener('click', () => toggleMovies(container, visibleMovies, button));
    }
}

/**
 * Toggles the visibility of hidden movie cards when the "Show More" button is clicked.
 *
 * @param {HTMLElement} container - The container holding the movie cards.
 * @param {number} visibleMovies - The number of movies visible without scrolling.
 * @param {HTMLElement} button - The "Show More" button element.
 */
function toggleMovies(container, visibleMovies, button) {
    const hiddenMovies = container.querySelectorAll(`.movie-card:nth-child(n+${visibleMovies + 1})`);

    if (button.textContent === 'Voir plus') {
        // Display hidden movies
        hiddenMovies.forEach(movie => movie.style.display = 'block');
        button.textContent = 'Voir moins';
    } else {
        // Go back to the initial state (hidden movies)
        hiddenMovies.forEach(movie => movie.style.display = 'none');
        button.textContent = 'Voir plus';
    }
}

// ==========================
// 7. Global Events and Initialization
// ==========================

/**
 * Sets up the necessary event listeners and initializes the app by displaying movies.
 */
window.addEventListener('resize', () => {
    document.querySelectorAll('.category__grid').forEach(container => {
        const totalMovies = container.children.length;
        manageToggleButton(container, totalMovies); // Recalcule l'affichage du bouton selon la taille de l'écran
    });
});


initializeModalCloseEvents();
displayTopMovie();
displayCategoryMovies('top', '.top-movies .category__grid')
displayCategoryMovies('Crime', '.category--1 .category__grid');
displayCategoryMovies('Comedy', '.category--2 .category__grid');
fetchAllGenres();
