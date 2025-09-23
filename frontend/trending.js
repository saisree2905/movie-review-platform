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
let modal, movieDetailsContainer;

// ---------- Dynamic Modal ----------
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

// ---------- Fetch Trending ----------
async function fetchTrending(type = "day") {
  const trendingContainer = document.getElementById("trendingMovies");
  const trendingTitle = document.getElementById("trendingTitle");

  try {
    trendingContainer.innerHTML = `<p>Loading...</p>`;
    const res = await fetch(`http://localhost:5000/api/tmdb/trending/${type}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      trendingContainer.innerHTML = `<p>No movies found.</p>`;
      return;
    }

    trendingContainer.innerHTML = "";
    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.classList.add("scroll-card");
      card.innerHTML = `
        <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
        <p>${movie.title}</p>
      `;
      card.addEventListener('click', () => openMovieModal(movie));
      trendingContainer.appendChild(card);
    });

    trendingTitle.textContent = type === "day" ? "Trending Today" : "Trending This Week";

  } catch (err) {
    console.error("Error fetching trending movies:", err);
    trendingContainer.innerHTML = `<p>Failed to load movies</p>`;
    showToast("Failed to load trending movies", "error");
  }
}

// ---------- DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {
  const todayBtn = document.getElementById("todayBtn");
  const weekBtn = document.getElementById("weekBtn");

  fetchTrending("day");
  todayBtn.classList.add("active");

  todayBtn.addEventListener("click", () => {
    todayBtn.classList.add("active");
    weekBtn.classList.remove("active");
    fetchTrending("day");
  });

  weekBtn.addEventListener("click", () => {
    weekBtn.classList.add("active");
    todayBtn.classList.remove("active");
    fetchTrending("week");
  });
});
