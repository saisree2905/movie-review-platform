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
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("show");
    setTimeout(() => modal.style.display = "none", 300);
  });
  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("show");
      setTimeout(() => modal.style.display = "none", 300);
    }
  });
})();

// ---------- Open Movie Modal (Enhanced) ----------
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
        <button id="goToDetailsBtn">Go to Movie Page</button>
      </div>
    </div>
  `;

  // Button inside modal to navigate to movieDetail page
  document.getElementById("goToDetailsBtn").addEventListener("click", () => {
    sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
    window.location.href = "movieDetail.html";
  });

  modal.style.display = "flex";
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("show"), 10);
}


// ---------- Fetch Any 50 Movies with Hoverable Star Rating ----------
async function fetchAny50Movies() {
  const container = document.getElementById("reviewMovies");
  container.innerHTML = `<p>Loading movies...</p>`;

  try {
    const res = await fetch("http://localhost:5000/api/tmdb/any50");
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `<p>No movies found.</p>`;
      return;
    }

    container.innerHTML = "";

    data.results.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <div class="poster-container">
          <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
          <div class="poster-overlay">
            <div class="star-rating">
              <i class="fas fa-star" data-value="1"></i>
              <i class="fas fa-star" data-value="2"></i>
              <i class="fas fa-star" data-value="3"></i>
              <i class="fas fa-star" data-value="4"></i>
              <i class="fas fa-star" data-value="5"></i>
            </div>
          </div>
        </div>
        <p>${movie.title}</p>
      `;

      // Open modal on poster click
      card.querySelector("img").addEventListener("click", () => openMovieModal(movie));

      // Hover stars logic
      const stars = card.querySelectorAll(".star-rating i");
      stars.forEach(star => {
        star.addEventListener("mouseenter", () => {
          const val = star.dataset.value;
          stars.forEach(s => s.classList.toggle("fas", s.dataset.value <= val));
        });
        star.addEventListener("click", () => {
          const val = star.dataset.value;
          stars.forEach(s => {
            if (s.dataset.value <= val) s.classList.add("fas");
            else s.classList.remove("fas");
          });
          showToast(`You rated "${movie.title}" ${val} stars!`, "success");
        });
      });

      card.addEventListener("mouseleave", () => {
        stars.forEach(s => s.classList.remove("fas"));
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error fetching movies:", err);
    container.innerHTML = `<p>Failed to load movies</p>`;
    showToast("Failed to load movies", "error");
  }
}

// ---------- Initialize ----------
document.addEventListener("DOMContentLoaded", () => {
  fetchAny50Movies();
});
