const apiBaseUrl = 'http://localhost:8000/api/v1/titles';

// Fonction pour effectuer une requête dynamique
function fetchMovies(queryParams = '') {
    const apiUrl = `${apiBaseUrl}?${queryParams}`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
        });
}

// Fonction pour récupérer les détails d'un film
function fetchMovieDetails(movieId) {
    const movieDetailUrl = `${apiBaseUrl}/${movieId}`;

    return fetch(movieDetailUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des détails du film :', error);
        });
}

// Fonction pour afficher les informations d'un film
function displayMovie(movieDetails, container) {
    container.innerHTML = `
        <img src="${movieDetails.image_url}" alt="Affiche de ${movieDetails.title}" class="best-movie__image">
        <div class="best-movie__info">
            <h3 class="best-movie__title">${movieDetails.title}</h3>
            <p class="best-movie__summary">${movieDetails.description || 'Résumé non disponible.'}</p>
            <button class="button button--primary" aria-label="Voir les détails du film">Détails</button>
        </div>
    `;
}

// Fonction pour afficher une liste de films dans une grille
function displayMoviesList(moviesDetails, container) {
    container.innerHTML = '';
    moviesDetails.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <img src="${movie.image_url}" alt="Affiche de ${movie.title}">
            <h3>${movie.title}</h3>
            <button>Détails</button>
        `;
        container.appendChild(movieCard);
    });
}

// Fonction principale pour récupérer le top film
async function displayTopMovie() {
    // Récupérer le meilleur film
    const moviesData = await fetchMovies('sort_by=-imdb_score,-votes&page_size=1');
    const topMovieDetails = await fetchMovieDetails(moviesData.results[0].id);

    // Afficher le film dans la section "best-movie"
    const bestMovieContainer = document.querySelector('.best-movie__content');
    displayMovie(topMovieDetails, bestMovieContainer);
}

// Fonction principale pour récupérer les films les mieux notés (sans le top film)
async function displayTopMovies() {
    // Récupérer les 7 meilleurs films
    const moviesData = await fetchMovies('sort_by=-imdb_score,-votes&page_size=7');
    // Extraire les 6 meilleurs films (sans le top film)
    const topMoviesDetails = await Promise.all(
        moviesData.results.slice(1).map(movie => fetchMovieDetails(movie.id))
    );

    // Afficher les films dans la section "top-movies"
    const topMoviesContainer = document.querySelector('.top-movies .category__grid');
    displayMoviesList(topMoviesDetails, topMoviesContainer);
}

// Fonction pour afficher les films par catégorie
async function displayCategoryMovies(category, containerSelector) {
    // Récupérer les 6 meilleurs films par catégorie
    const moviesData = await fetchMovies(`genre=${category}&sort_by=-imdb_score,-votes&page_size=6`);
    const categoryMoviesDetails = await Promise.all(
        moviesData.results.map(movie => fetchMovieDetails(movie.id))
    );

    // Afficher les films dans la section correspondante
    const categoryContainer = document.querySelector(containerSelector);
    displayMoviesList(categoryMoviesDetails, categoryContainer);
}

// Appels de fonctions pour remplir chaque section
displayTopMovie();
displayTopMovies();
displayCategoryMovies('Action', '.category--1 .category__grid'); // Remplacez 'Action' par le genre de catégorie 1
displayCategoryMovies('Comedy', '.category--2 .category__grid'); // Remplacez 'Comedy' par le genre de catégorie 2