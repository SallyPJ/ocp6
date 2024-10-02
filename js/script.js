const apiUrl = 'http://localhost:8000/api/v1/titles?genre=Action&sort_by=-imdb_score,-votes&limit=7';

function fetchMovies() {
    fetch(apiUrl)
        .then(response => {
            // Vérifier si la réponse est correcte
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            // Convertir la réponse en JSON
            return response.json();
        })
        .then(data => {
            // Afficher les données récupérées
            console.log(data);
            // Traiter les données selon tes besoins
            displayMovies(data);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données :', error);
        });
}

// Fonction pour afficher les données (à adapter selon ton cas d'utilisation)
function displayMovies(data) {
    // Par exemple, affichage des titres dans la console
    data.results.forEach(movie => {
        console.log(`Titre : ${movie.title}, Note IMDb : ${movie.imdb_score}`);
    });
}

// Appel de la fonction pour récupérer les données
fetchMovies();
