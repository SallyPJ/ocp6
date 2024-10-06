// Définition de la base de l'URL de l'API
const apiBaseUrl = 'http://localhost:8000/api/v1/titles';

// Fonction générique pour effectuer une requête à l'API
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

// Fonctions de récupération de données
const fetchMovies = (queryParams = '') => fetchApiData(`?${queryParams}`);
const fetchMovieDetails = (movieId) => fetchApiData(movieId);

function displayMovie(movieDetails, container) {
    // Récupérer le template
    const template = document.getElementById('best-movie-template').content.cloneNode(true);

    // Mettre à jour les éléments avec les données du film
    const movieImage = template.querySelector('.best-movie__image');
    const movieTitle = template.querySelector('.best-movie__title');
    const movieSummary = template.querySelector('.best-movie__summary');
    const detailsButton = template.querySelector('.button--primary');

    movieImage.src = movieDetails.image_url;
    movieImage.alt = `Affiche de ${movieDetails.title}`;
    movieTitle.textContent = movieDetails.title;
    movieSummary.textContent = movieDetails.description || 'Résumé non disponible.';

    // Attacher l'événement d'ouverture de la modale
    detailsButton.addEventListener('click', () => openModal(movieDetails));

    // Vider le conteneur et y ajouter le template cloné
    container.innerHTML = '';
    container.appendChild(template);
}

// Fonction d'affichage de plusieurs films sous forme de cartes
function displayMoviesList(moviesDetails, container) {
    container.innerHTML = '';
    moviesDetails.forEach(movie => container.appendChild(createMovieCard(movie)));
}

// Création d'une carte de film
function createMovieCard(movie) {
    // Récupérer le template
    const template = document.getElementById('movie-card-template').content.cloneNode(true);

    // Mettre à jour les éléments avec les données du film
    const movieCard = template.querySelector('.movie-card');
    const movieImage = template.querySelector('.movie-card__image');
    const movieTitle = template.querySelector('.movie-card__title');
    const detailsButton = template.querySelector('.movie-card__details-button');

    movieImage.src = movie.image_url;
    movieImage.alt = `Affiche de ${movie.title}`;
    movieTitle.textContent = movie.title;

    // Attacher l'événement d'ouverture de la modale
    detailsButton.addEventListener('click', () => openModal(movie));

    return movieCard;
}

// Fonction d'affichage du meilleur film
async function displayTopMovie() {
    try {
        const moviesData = await fetchMovies('sort_by=-imdb_score,-votes&page_size=1');
        const topMovieDetails = await fetchMovieDetails(moviesData.results[0].id);
        displayMovie(topMovieDetails, document.querySelector('.best-movie__content'));
    } catch (error) {
        console.error('Erreur lors de l\'affichage du meilleur film :', error);
    }
}

// Fonction d'affichage des films les mieux notés
async function displayTopMovies() {
    try {
        const moviesData = await fetchMovies('sort_by=-imdb_score,-votes&page_size=7');
        const topMoviesDetails = await Promise.all(
            moviesData.results.slice(1).map(movie => fetchMovieDetails(movie.id))
        );
        displayMoviesList(topMoviesDetails, document.querySelector('.top-movies .category__grid'));
    } catch (error) {
        console.error('Erreur lors de l\'affichage des films les mieux notés :', error);
    }
}

// Fonction d'affichage des films par catégorie
async function displayCategoryMovies(category, containerSelector) {
    try {
        const moviesData = await fetchMovies(`genre=${category}&sort_by=-imdb_score,-votes&page_size=6`);
        const categoryMoviesDetails = await Promise.all(
            moviesData.results.map(movie => fetchMovieDetails(movie.id))
        );
        displayMoviesList(categoryMoviesDetails, document.querySelector(containerSelector));
    } catch (error) {
        console.error(`Erreur lors de l'affichage des films pour la catégorie ${category} :`, error);
    }
}

// Fonction d'ouverture de la modale
function openModal(movieDetails) {
    const modal = document.getElementById('modal');

    // Mise à jour du contenu de la modale
    modal.querySelector('.modal__title').textContent = movieDetails.title;
    modal.querySelector('.modal__image').src = movieDetails.image_url;
    modal.querySelector('.modal__image').alt = `Affiche de ${movieDetails.title}`;
    modal.querySelector('.modal__year').textContent = movieDetails.year;
    modal.querySelector('.modal__genres').textContent = movieDetails.genres.join(', ');
    modal.querySelector('.modal__rated').textContent = movieDetails.rated;
    modal.querySelector('.modal__duration--value').textContent = movieDetails.duration;
    modal.querySelector('.modal__countries').textContent = movieDetails.countries.join(', ');
    modal.querySelector('.modal__imdb_score--value').textContent = movieDetails.imdb_score || 'Non noté';
    modal.querySelector('.modal__worldwide-gross-income--value').textContent = movieDetails.worldwide_gross_income || 'Inconnue';
    modal.querySelector('.modal__director--name').textContent = movieDetails.directors.join(', ') || 'Inconnu';
    modal.querySelector('.modal__long_description').textContent = movieDetails.long_description;
    modal.querySelector('.modal__actors--list').textContent = movieDetails.actors.join(', ');

    // Afficher la modale
    modal.classList.remove('modal--hidden');
}

// Fonction d'initialisation des événements de fermeture de la modale
function initializeModalCloseEvents() {
    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.modal__close-button');

    // Fermer la modale au clic sur le bouton de fermeture
    closeButton.addEventListener('click', () => modal.classList.add('modal--hidden'));

    // Fermer la modale si clic à l'extérieur de la zone de contenu
    window.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.add('modal--hidden');
    });
}

// Fonction de récupération de tous les genres
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

// Fonction de remplissage de la liste déroulante avec les genres
function populateGenreDropdown(genres) {
    const dropdown = document.getElementById('categories-select');
    dropdown.innerHTML = '<option value="">Sélectionnez un genre</option>';

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.toLowerCase();
        option.textContent = genre;
        dropdown.appendChild(option);
    });
}

// Gestion du changement de catégorie dans la liste déroulante
document.getElementById('categories-select').addEventListener('change', (event) => {
    const selectedGenre = event.target.value;
    if (selectedGenre) displayCategoryMovies(selectedGenre, '.category--genres .category__grid');
});

// Initialisation des événements et affichage des films
initializeModalCloseEvents();
displayTopMovie();
displayTopMovies();
displayCategoryMovies('Crime', '.category--1 .category__grid');
displayCategoryMovies('Comedy', '.category--2 .category__grid');
fetchAllGenres();
