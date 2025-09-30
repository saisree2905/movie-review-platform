// ---------- Toast ----------
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast " + type;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// ---------- Token & Logout ----------
const token = "dummy_token_123";
if (!token) { 
  showToast("Session expired, redirecting...", "error"); 
  setTimeout(() => { window.location.href = "login.html"; }, 1500); 
}

document.getElementById("logoutBtn").addEventListener("click", () => { 
  localStorage.removeItem("token");
  showToast("Logged out successfully!", "success");
  setTimeout(() => { window.location.href = "login.html"; }, 1000); 
});

// ---------- Fetch User Data ----------
async function fetchUserData() {
  try {
    const userNameElement = document.getElementById("userName");
    userNameElement.textContent = "Sree";
    const profilePic = document.querySelector('.profile-picture');
    profilePic.textContent = "sr"; 
  } catch (err) { 
    console.error(err); 
    showToast("Failed to fetch user data", "error"); 
  }
}
fetchUserData();
// remove later--------------------------------------------------------------------------===
// Navigate to profile page on profile picture click
document.querySelector('.profile-picture').addEventListener('click', () => {
    window.location.href = "profile.html";
});
// -------------------------------------------------------------------------------------====
// ---------- Global ----------
const SCROLL_LIMIT = 5;
const PLACEHOLDER_IMG = "https://via.placeholder.com/150x225?text=No+Image";
let currentIndex = 0;
let featuredMovies = [];

// ---------- Dynamic Modal Creation ----------
let modal, movieDetailsContainer;
(function createModal() {
  modal = document.createElement("div");
  modal.id = "movieModal";
  modal.className = "modal";

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
function openMovieModal(movie) { // pass full movie object
  if (!modal) return;

  movieDetailsContainer.innerHTML = `
    <div class="movie-details-modal">
      <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="movie-info">
        <h2>${movie.title || "N/A"}</h2>
        <p>${movie.overview || "No overview available."}</p>
        <p><strong>Rating:</strong> <span class="rating-badge">${movie.rating || movie.vote_average || "N/A"}</span></p>
        <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
        <button class="view-details-btn">View Details</button>
      </div>
    </div>
  `;
// Add click event to the "View Details" button
  document.querySelector(".view-details-btn").addEventListener("click", () => {
    // Save the full movie object temporarily in sessionStorage
    sessionStorage.setItem("selectedMovie", JSON.stringify(movie));
    // Navigate to full details page
    window.location.href = "movieDetail.html";
  });

  modal.style.display = "flex";
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("show"), 10);
}


// ---------- Populate Sections ----------
function populateSection(sectionId, movies) {
  const container = document.getElementById(sectionId);
  const section = container.closest('.section');
  container.innerHTML = '';

  const visibleMovies = movies.slice(0, SCROLL_LIMIT);
  visibleMovies.forEach(movie => {
    const div = document.createElement("div");
    div.className = "scroll-card";
    div.innerHTML = `
      <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
      <p>${movie.title}</p>
    `;
    div.addEventListener('click', () => openMovieModal(movie));
    container.appendChild(div);
  });

  if (movies.length > SCROLL_LIMIT) {
    const viewMoreBtn = document.createElement('button');
    viewMoreBtn.className = 'view-more-btn';
    viewMoreBtn.textContent = 'View More';

    const fullList = document.createElement('div');
    fullList.className = 'full-list';
    const remainingMovies = movies.slice(SCROLL_LIMIT);
    remainingMovies.forEach(movie => {
      const div = document.createElement("div");
      div.className = "scroll-card";
      div.innerHTML = `
        <img src="${movie.poster || PLACEHOLDER_IMG}" alt="${movie.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
        <p>${movie.title}</p>
      `;
      div.addEventListener('click', () => openMovieModal(movie));
      fullList.appendChild(div);
    });

    section.appendChild(viewMoreBtn);
    section.appendChild(fullList);

    viewMoreBtn.addEventListener('click', () => {
      if (fullList.classList.contains('show')) {
        fullList.classList.remove('show');
        viewMoreBtn.textContent = 'View More';
      } else {
        fullList.classList.add('show');
        viewMoreBtn.textContent = 'View Less';
      }
    });
  }
}

// ---------- Featured Carousel ----------
const featuredImg = document.getElementById("featuredImg");
const featuredTitle = document.getElementById("featuredTitle");

function showFeatured() {
  if (!featuredMovies.length) return;
  const movie = featuredMovies[currentIndex];
  featuredImg.src = movie.poster || PLACEHOLDER_IMG;
  featuredImg.onerror = () => { featuredImg.src = PLACEHOLDER_IMG; };
  featuredTitle.textContent = movie.title;
  featuredImg.style.opacity = '0';
  setTimeout(() => { featuredImg.style.opacity = '1'; }, 100);

  featuredImg.onclick = () => openMovieModal(movie);
}

// Carousel controls
document.getElementById("prevBtn").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + featuredMovies.length) % featuredMovies.length;
  showFeatured();
});
document.getElementById("nextBtn").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % featuredMovies.length;
  showFeatured();
});
setInterval(() => {
  currentIndex = (currentIndex + 1) % featuredMovies.length;
  showFeatured();
}, 5000);

// ---------- Search ----------
async function performSearch(scrollToResults = true, event) {
  if (event) event.preventDefault();
  const input = document.querySelector('.search-container input');
  const query = input.value.trim();
  if (!query) return;

  localStorage.setItem("lastSearchQuery", query);
  showToast(`Searching for "${query}"...`, 'success');

  try {
    const res = await fetch(`http://localhost:5000/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    populateSection("searchResultsSection", data.results || []);

    if (scrollToResults) {
      document.getElementById("searchResultsSection").scrollIntoView({ behavior: 'smooth' });
    }
  } catch (err) {
    console.error(err);
    showToast("Search failed", "error");
  }
}

document.querySelector('.search-container input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch(true, e);
});
document.querySelector('.search-container button').addEventListener('click', (e) => performSearch(true, e));

window.addEventListener('load', () => {
  const lastQuery = localStorage.getItem("lastSearchQuery");
  if (lastQuery) {
    document.querySelector('.search-container input').value = lastQuery;
    performSearch(false);
  }
});

// ---------- Sidebar Navigation ----------
document.querySelectorAll('.sidebar a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    if(href && href !== "#") {
      window.location.href = href;
    } else {
      document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      showToast(`Navigating to ${link.textContent.trim()}...`, 'success');
    }
  });
});

// ---------- Profile Picture Click ----------
document.querySelector('.profile-picture').addEventListener('click', () => {
  showToast('Opening profile settings...', 'success');
});

// ---------- Load Homepage Movies ----------
async function loadHomepage() {
  try {
    const res = await fetch("http://localhost:5000/movies/homepage");
    // const res = await fetch(`${API_BASE}/movies/homepage`);
    const data = await res.json();

    populateSection("trendingSection", data.popular || []);
    populateSection("suggestedSection", data.top_rated || []);

    featuredMovies = data.popular.slice(0, 5);
    currentIndex = 0;
    showFeatured();
  } catch (err) {
    console.error(err);
    showToast("Failed to load homepage movies", "error");
  }
}

// ---------- Load Latest Movie ----------
async function loadLatest() {
  try {
    const res = await fetch("http://localhost:5000/movies/latest");
    const latest = await res.json();
    const latestContainer = document.getElementById("latestMovieSection");
    if(latestContainer) {
      latestContainer.innerHTML = `
        <div class="scroll-card">
          <img src="${latest.poster || PLACEHOLDER_IMG}" alt="${latest.title}" onerror="this.src='${PLACEHOLDER_IMG}'">
          <p>${latest.title}</p>
        </div>
      `;
    }
  } catch (err) {
    console.error(err);
    showToast("Failed to load latest movie", "error");
  }
}

// ---------- Initialize ----------
loadHomepage();
loadLatest();
