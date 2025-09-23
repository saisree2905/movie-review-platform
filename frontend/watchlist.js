const watchlistContainer = document.getElementById("watchlistContainer");

// Dummy data for watchlist
const dummyWatchlist = []; // Empty to show empty state message
// const dummyWatchlist = [
//   { title: "Inception", poster: "https://via.placeholder.com/150x225?text=Inception" },
//   { title: "Dune", poster: "https://via.placeholder.com/150x225?text=Dune" },
// ];

function loadWatchlist() {
  watchlistContainer.innerHTML = "";

  if (dummyWatchlist.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "empty-watchlist";
    emptyMsg.textContent = "Your watchlist is currently empty.";
    watchlistContainer.appendChild(emptyMsg);
    return;
  }

  dummyWatchlist.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.className = "scroll-card";
    movieCard.innerHTML = `
      <img src="${movie.poster}" alt="${movie.title}">
      <p>${movie.title}</p>
    `;
    watchlistContainer.appendChild(movieCard);
  });
}

loadWatchlist();
