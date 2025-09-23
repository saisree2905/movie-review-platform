// ---------- Toast ----------
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast " + type;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// ---------- Logout ----------
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  showToast("Logged out successfully!", "success");
  setTimeout(() => { window.location.href = "login.html"; }, 1000);
});

// ---------- Populate Profile ----------
function populateProfile() {
  const token = localStorage.getItem("token");

  // Only check for token and basic user info
  if (!token || !user ) {
    window.location.href = "login.html";
    return;
  }

  // Header initials
  const initials = user.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";
  document.getElementById("headerProfilePic").textContent = initials;

  // Avatar
  const avatarEl = document.getElementById("profileAvatar");
  avatarEl.innerHTML = user.avatar
    ? `<img src="${user.avatar}" alt="${user.name}" style="border-radius:50%;width:120px;height:120px;">`
    : '<i class="fas fa-user-circle fa-8x"></i>';

  // Name and tagline
  document.querySelector(".username").textContent = user.name || "User";
  document.querySelector(".user-tagline").textContent = user.tagline || "Movie lover";

  // Stats (use fallbacks)
  document.getElementById("statWatched").textContent = user.stats?.moviesWatched || 0;
  document.getElementById("statReviews").textContent = user.stats?.reviewsWritten || 0;
  document.getElementById("statWatchlist").textContent = user.stats?.watchlist || 0;

  // About
  document.getElementById("profileAbout").textContent = user.about || "No about info available.";

  // Recent activity
  const activityList = document.getElementById("activityList");
  activityList.innerHTML = "";
  (user.activity || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.detail || "";
    activityList.appendChild(li);
  });

  // Animate stats
  document.querySelectorAll(".stat-card").forEach((card, idx) => {
    card.style.opacity = 0;
    setTimeout(() => {
      card.style.transition = "all 0.5s ease";
      card.style.opacity = 1;
    }, idx * 200);
  });

  // Animate activity
  document.querySelectorAll(".activity ul li").forEach((item, idx) => {
    item.style.opacity = 0;
    item.style.transform = "translateX(-20px)";
    setTimeout(() => {
      item.style.transition = "all 0.4s ease";
      item.style.opacity = 1;
      item.style.transform = "translateX(0)";
    }, idx * 150);
  });
}

// ---------- Initialize ----------
window.addEventListener("DOMContentLoaded", populateProfile);
