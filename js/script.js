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
    const detailsButton = template.querySelector('.button__details--primary');

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
    // Vérifier s'il est nécessaire d'ajouter le bouton "Voir plus"
    manageToggleButton(container, moviesDetails.length);
}

// Création d'une carte de film
function createMovieCard(movie) {
    // Récupérer le template
    const template = document.getElementById('movie-card-template').content.cloneNode(true);

    // Mettre à jour les éléments avec les données du film
    const movieCard = template.querySelector('.movie-card');
    const movieImage = template.querySelector('.movie-card__image');
    const movieTitle = template.querySelector('.movie-card__title');
    const detailsButton = template.querySelector('.button__details--secondary');

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

async function displayCategoryMovies(category, containerSelector) {
    let queryParams = '';

    // Si la catégorie est "top", ajuster la requête pour afficher les films les mieux notés
    if (category === 'top') {
        queryParams = 'sort_by=-imdb_score,-votes&page_size=7';
    } else {
        // Si une catégorie spécifique est sélectionnée, filtrer par genre
        queryParams = `genre=${category}&sort_by=-imdb_score,-votes&page_size=6`;
    }

    try {
        // Récupérer les films de la catégorie ou les films les mieux notés
        const moviesData = await fetchMovies(queryParams);
        // Si on est dans la catégorie "top", exclure le premier film
        let moviesToDisplay = moviesData.results;
        if (category === 'top') {
            moviesToDisplay = moviesToDisplay.slice(1); // Exclure le premier résultat
        }

        // Récupérer les détails des films (sauf le premier si 'top')
        const categoryMoviesDetails = await Promise.all(
            moviesToDisplay.map(movie => fetchMovieDetails(movie.id))
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
    modal.querySelector('.modal__year').textContent = `Année : ${movieDetails.year} `;
    modal.querySelector('.modal__genres').textContent = movieDetails.genres.join(', ');
    modal.querySelector('.modal__rated').textContent = movieDetails.rated && movieDetails.rated.toLowerCase().includes('not rated') ? 'PG Inconnu ' : `PG: ${movieDetails.rated} -`;
    modal.querySelector('.modal__duration--value').textContent = movieDetails.duration;
    modal.querySelector('.modal__countries').textContent = `(${movieDetails.countries.join('/ ')})`;
    modal.querySelector('.modal__imdb_score--value').textContent = movieDetails.imdb_score || 'Non noté';
    modal.querySelector('.modal__worldwide-gross-income--value').textContent = movieDetails.worldwide_gross_income ? `${movieDetails.worldwide_gross_income} dollars` : 'Inconnue';
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



// Fonction pour gérer l'ajout du bouton "Voir plus" si nécessaire
function manageToggleButton(container, totalMovies) {
    // Nombre de films visibles par défaut en fonction de la taille de l'écran
    let visibleMovies;
    if (window.innerWidth <= 600) {
        visibleMovies = 2; // Mobile
    } else if (window.innerWidth <= 1024) {
        visibleMovies = 4; // Tablette
    } else {
        visibleMovies = 6; // Ordinateur
    }
// Vérifier si un bouton "Voir plus" existe déjà pour cette catégorie
    const existingButton = container.parentNode.querySelector('.toggle-button');

    // Ajouter un bouton "Voir plus" seulement si aucun bouton n'existe déjà et qu'il y a plus de films que visibles
    if (!existingButton && totalMovies > visibleMovies && window.innerWidth < 1024) {
        const button = document.createElement('button');
        button.classList.add('toggle-button');
        button.textContent = 'Voir plus';
        container.parentNode.appendChild(button); // Ajouter le bouton après la grille des films

        // Ajouter l'événement au bouton pour afficher/masquer les films cachés
        button.addEventListener('click', () => toggleMovies(container, visibleMovies, button));
    }
}

// Fonction pour afficher les films cachés
function showMoreMovies(container, visibleMovies, button) {
    // Afficher les films cachés
    const hiddenMovies = container.querySelectorAll(`.movie-card:nth-child(n+${visibleMovies + 1})`);
    hiddenMovies.forEach(movie => movie.style.display = 'block');

    // Masquer le bouton après l'affichage des films cachés
    button.style.display = 'none';
}
function toggleMovies(container, visibleMovies, button) {
    const hiddenMovies = container.querySelectorAll(`.movie-card:nth-child(n+${visibleMovies + 1})`);

    if (button.textContent === 'Voir plus') {
        // Afficher les films cachés
        hiddenMovies.forEach(movie => movie.style.display = 'block');
        button.textContent = 'Voir moins';
    } else {
        // Revenir à l'état initial (masquer les films)
        hiddenMovies.forEach(movie => movie.style.display = 'none');
        button.textContent = 'Voir plus';
    }
}

window.addEventListener('resize', () => {
    document.querySelectorAll('.category__grid').forEach(container => {
        const totalMovies = container.children.length;
        manageToggleButton(container, totalMovies); // Recalcule l'affichage du bouton selon la taille de l'écran
    });
});
// Initialisation des événements et affichage des films
initializeModalCloseEvents();
displayTopMovie();
displayCategoryMovies('top', '.top-movies .category__grid')
displayCategoryMovies('Crime', '.category--1 .category__grid');
displayCategoryMovies('Comedy', '.category--2 .category__grid');
fetchAllGenres();
