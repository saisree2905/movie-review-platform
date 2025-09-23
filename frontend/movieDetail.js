// -------------------
// Elements
// -------------------
const backdrop = document.getElementById("backdrop");
const poster = document.getElementById("poster");
const titleEl = document.querySelector(".title");
const taglineEl = document.querySelector(".tagline");
const overviewEl = document.querySelector(".overview");
const runtimeEl = document.querySelector(".runtime");
const releaseEl = document.querySelector(".release-date");
const ratingEl = document.querySelector(".rating");
const genresEl = document.querySelector(".genres");
const castList = document.getElementById("castList");
const crewList = document.getElementById("crewList");
const trailerEl = document.getElementById("trailer");
const watchlistBtn = document.getElementById("watchlistBtn");
const toast = document.getElementById("toast");
const reviewForm = document.getElementById("reviewForm");
const reviewInput = document.getElementById("reviewInput");
const reviewsContainer = document.getElementById("reviewsContainer");

// -------------------
// Config
// -------------------
const movieData = JSON.parse(localStorage.getItem("selectedMovie"));
const token = localStorage.getItem("token");
const BASE_URL = "http://localhost:5000"; // Your backend

// -------------------
// Toast
// -------------------
function showToast(msg, type = "success") {
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 3000);
}

// -------------------
// Render movie details
// -------------------
function renderMovieDetails(data) {
  backdrop.src = data.backdrop || "";
  poster.src = data.poster || "";
  titleEl.textContent = data.title || "";
  taglineEl.textContent = data.tagline || "";
  overviewEl.textContent = data.overview || "No overview available";
  runtimeEl.textContent = `⏱ ${data.runtime || "N/A"} min`;
  releaseEl.textContent = `📅 ${data.release_date || "N/A"}`;
  ratingEl.textContent = `⭐ ${data.vote_average || "N/A"}`;
  genresEl.innerHTML = (data.genres || []).map(g => `<span>${g}</span>`).join(" ");
}

// -------------------
// Load extras: cast, crew, trailer
// -------------------
async function loadExtras(movieId) {
  try {
    const res = await fetch(`${BASE_URL}/movie/${movieId}`);
    if (!res.ok) throw new Error("Failed to fetch movie extras");
    const data = await res.json();

    // Cast & Crew
    if (data.credits) {
      castList.innerHTML = (data.credits.cast || []).slice(0, 10).map(actor => `
        <div class="actor">
          <img src="${actor.profile_path ? "https://image.tmdb.org/t/p/w200" + actor.profile_path : ""}" alt="${actor.name}">
          <p>${actor.name}<br><small>${actor.character}</small></p>
        </div>
      `).join("");

      crewList.innerHTML = (data.credits.crew || []).filter(c => ["Director","Producer"].includes(c.job))
        .map(c => `<p>${c.name} - ${c.job}</p>`).join("");
    }

    // Trailer
    if (data.videos) {
      const trailer = data.videos.results.find(v => v.type === "Trailer");
      if (trailer) trailerEl.src = `https://www.youtube.com/embed/${trailer.key}`;
    }

  } catch(err) {
    console.error("Failed to load extras", err);
  }
}

// -------------------
// Watchlist toggle
// -------------------
async function toggleWatchlist() {
  if (!token) return showToast("Login required", "error");
  try {
    const res = await fetch(`${BASE_URL}/api/movies/${movieData.id}/favorite`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();

    if (res.ok) {
      showToast("Added to Watchlist!", "success");
    } else if (res.status === 400 && data.message === "Already in watchlist") {
      // Remove if already in watchlist
      const removeRes = await fetch(`${BASE_URL}/api/movies/${movieData.id}/favorite`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const removeData = await removeRes.json();
      if (removeRes.ok) showToast("Removed from Watchlist", "success");
      else showToast(removeData.error || "Failed to remove", "error");
    } else {
      showToast(data.error || "Failed to add to Watchlist", "error");
    }
  } catch(err) {
    showToast("Failed to update Watchlist", "error");
  }
}

watchlistBtn.addEventListener("click", toggleWatchlist);

// -------------------
// Load reviews
// -------------------
async function loadReviews() {
  try {
    const res = await fetch(`${BASE_URL}/api/reviews/movie/${movieData.id}`);
    const reviews = await res.json();
    reviewsContainer.innerHTML = reviews.map(r => `
      <div class="review-card">
        <strong>${r.user_name}</strong>: ${r.comment} ⭐ ${r.rating}
      </div>
    `).join("");
  } catch(err) {
    reviewsContainer.innerHTML = "<p>Failed to load reviews.</p>";
  }
}

// -------------------
// Add review
// -------------------
reviewForm.addEventListener("submit", async e => {
  e.preventDefault();
  const content = reviewInput.value.trim();
  if (!content) return;

  if (!token) return showToast("Login required", "error");

  try {
    const res = await fetch(`${BASE_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ movie_id: movieData.id, rating: 5, comment: content })
    });

    const data = await res.json();
    if (res.ok) {
      reviewInput.value = "";
      showToast("Review added!", "success");
      loadReviews();
    } else {
      showToast(data.message || "Failed to add review", "error");
    }
  } catch(err) {
    showToast("Failed to add review", "error");
  }
});

// -------------------
// Initialize
// -------------------
if (movieData) {
  renderMovieDetails(movieData);
  if (movieData.id) {
    loadExtras(movieData.id);
    loadReviews();
  }
} else {
  showToast("No movie selected!", "error");
}
