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

    // Ajouter l'écouteur d'événement pour ouvrir la modale
    const detailsButton = container.querySelector('.button--primary');
    detailsButton.addEventListener('click', () => {
        openModal(movieDetails);
    });
}

// Fonction pour afficher une liste de films dans une grille
function displayMoviesList(moviesDetails, container) {
    container.innerHTML = ''; // Vide le conteneur existant

    moviesDetails.forEach(movie => {
        // Créer la carte du film
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // Créer l'image du film
        const image = document.createElement('img');
        image.src = movie.image_url;
        image.alt = `Affiche de ${movie.title}`;
        image.classList.add('movie-card__image');

        // Créer l'overlay contenant le titre et le bouton "Détails"
        const overlay = document.createElement('div');
        overlay.classList.add('movie-card__overlay');

        const title = document.createElement('h3');
        title.textContent = movie.title;
        title.classList.add('movie-card__title');

        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Détails';
        detailsButton.classList.add('movie-card__details-button', 'button', 'button--primary');
        detailsButton.setAttribute('aria-label', 'Voir les détails du film');

        // Ajouter l'écouteur d'événement pour ouvrir la modale
        detailsButton.addEventListener('click', () => {
            openModal(movie);
        });

        // Ajouter les éléments à l'overlay
        overlay.appendChild(title);
        overlay.appendChild(detailsButton);

        // Ajouter l'image et l'overlay à la carte du film
        movieCard.appendChild(image);
        movieCard.appendChild(overlay);

        // Ajouter la carte au conteneur de la grille
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
function openModal(movieDetails) {
    console.log('Ouverture de la modale', movieDetails); // Vérification du clic

    // Sélectionner les éléments de la modale
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalImage = document.getElementById('modal-image');
    const modalSummary = document.getElementById('modal-summary');

    // Remplir la modale avec les informations du film
    modalTitle.textContent = movieDetails.title;
    modalImage.src = movieDetails.image_url;
    modalImage.alt = `Affiche de ${movieDetails.title}`;
    modalSummary.textContent = movieDetails.description || 'Résumé non disponible.';

    // Afficher la modale
    modal.classList.remove('modal--hidden');
}

function initializeModalCloseEvents() {
    const modal = document.getElementById('modal');
    const closeButton = document.querySelector('.modal__close-button');

    // Ajouter un écouteur d'événement pour fermer la modale
    closeButton.addEventListener('click', () => {
        modal.classList.add('modal--hidden');
    });

    // Fermer la modale si l'utilisateur clique en dehors de la modale
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('modal--hidden');
        }
    });
}

// Initialiser les événements de fermeture de la modale au chargement de la page
initializeModalCloseEvents();

displayTopMovie();
displayTopMovies();
displayCategoryMovies('Action', '.category--1 .category__grid'); // Remplacez 'Action' par le genre de catégorie 1
displayCategoryMovies('Comedy', '.category--2 .category__grid'); // Remplacez 'Comedy' par le genre de catégorie 2