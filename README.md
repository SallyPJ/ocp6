# Project 6 : JustStreamIt
Development of a web application for viewing top-rated movies in real-time using the OCMovies API.  

## Prerequisites
 - Python 3.x installed on your machine
 - Clone the OCMovies API repository and follow the installation procedure:  https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR
 - Clone this repository :
```bash
 git clone https://github.com/SallyPJ/ocp6.git
```
   
## Installation
 - Run the OCMovies API locally : 
```bash
 python manage.py runserver
```
 - Open the JustStreamIt project, navigate to the ocp6 cloned folder and open `index.html` in your preferred browser.
   
## Usage
- **Featured Movie Display:** Shows the highest-rated movie across all categories with its poster, title and a summary.
- **Top-Rated Movies Section:** Displays a list of the 6 top-rated movies, excluding the highest-rated movie (already shown as the featured movie), across all categories based on their IMDb scores and votes.
- **Category Displays:** Each section shows the top-rated movies for Crime and Comedy category.
- **Dynamic Category Selection:** Displays a dropdown to select a category, updating the movie list based on the selected category through an API request.
- **Movie Modal:** Clicking a movie card opens a modal with detailed information such as genre, release date, IMDb rating, director, cast, duration, and box office results.
- **Responsive Web Design:** The interface is fully responsive, optimized for mobile, tablet, and desktop layouts.

## License
This project is licensed under the MIT License. See the LICENSE file for more information.
