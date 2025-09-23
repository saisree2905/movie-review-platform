// ---------- Toast ----------
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast " + type;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// ---------- Global ----------
const PLACEHOLDER_IMG = "https://via.placeholder.com/150x225?text=No+Image";
let defaultActionGenreId = null;
let activeGenreCard = null;
let modal, movieDetailsContainer;

// ---------- Dynamic Modal Creation ----------
(function createModal() {
  modal = document.createElement("div");
  modal.id = "movieModal";
  modal.className = "modal";
  modal.style.display = "none";

  modal.innerHTML = `
    <div class="modal-content">
      <span class="closeBtn">&times;</span>
      <div id="movieDetailsContainer"></div>
    </div>
  `;
  document.body.appendChild(modal);
  movieDetailsContainer = document.getElementById("movieDetailsContainer");

  const closeBtn = modal.querySelector(".closeBtn");
  closeBtn.addEventListener("click", () => { modal.classList.remove("show"); setTimeout(()=> modal.style.display="none",300); });
  window.addEventListener("click", e => { if (e.target === modal) { modal.classList.remove("show"); setTimeout(()=> modal.style.display="none",300); }});
})();

// ---------- Open Movie Modal ----------
function openMovieModal(movie) {
  if (!modal) return;
  movieDetailsContainer.innerHTML = `
    <div class="movie-details-modal" style="display:flex;gap:20px;flex-wrap:wrap;">
      <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" style="flex:1 1 300px; max-width:300px;" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div style="flex:2 1 500px;">
        <h2>${movie.title || "N/A"}</h2>
        <p>${movie.overview || "No overview available."}</p>
        <p><strong>Rating:</strong> ${movie.rating || movie.vote_average || "N/A"}</p>
        <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
        <button class="view-details-btn">View Details</button>
      </div>
    </div>
  `;
  document.querySelector(".view-details-btn").addEventListener("click", () => {
    sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
    window.location.href = "movieDetail.html";
  });

  modal.style.display = "flex";
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("show"), 10);
}

// ---------- Fetch Genres ----------
async function loadGenres() {
  try {
    const res = await fetch('http://localhost:5000/genres');
    const data = await res.json();
    const genresContainer = document.getElementById('genresContainer');
    genresContainer.innerHTML = '';

    data.genres.forEach(genre => {
      const div = document.createElement('div');
      div.className = 'genre-card';
      div.textContent = genre.name;

      div.addEventListener('click', () => {
        setActiveGenreCard(div);
        loadMoviesByGenre(genre.id, genre.name);
      });

      genresContainer.appendChild(div);

      if (genre.name.toLowerCase() === 'action') {
        defaultActionGenreId = genre.id;
        setActiveGenreCard(div);
      }
    });

    if (defaultActionGenreId) {
      loadMoviesByGenre(defaultActionGenreId, 'Action');
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to load genres", "error");
  }
}

// ---------- Highlight Active Genre ----------
function setActiveGenreCard(card) {
  if (activeGenreCard) activeGenreCard.classList.remove('active');
  activeGenreCard = card;
  activeGenreCard.classList.add('active');
}

// ---------- Fetch Movies by Genre ----------
async function loadMoviesByGenre(genreId, genreName) {
  try {
    const res = await fetch(`http://localhost:5000/movies/genre/${genreId}`);
    const data = await res.json();
    const moviesContainer = document.getElementById('moviesContainer');
    const moviesTitle = document.getElementById('moviesTitle');
    moviesTitle.textContent = `Movies: ${genreName}`;
    moviesContainer.innerHTML = '';

    if (!data.results || data.results.length === 0) {
      moviesContainer.innerHTML = '<p>No movies found for this genre.</p>';
      return;
    }

    data.results.forEach(movie => {
      const div = document.createElement('div');
      div.className = 'scroll-card';
      div.innerHTML = `
        <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
        <p>${movie.title}</p>
      `;
      div.addEventListener('click', () => openMovieModal(movie));
      moviesContainer.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    showToast("Failed to load movies", "error");
  }
}

// ---------- Initialize ----------
window.addEventListener('load', () => {
  loadGenres();
});
