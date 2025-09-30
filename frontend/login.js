//  const API_BASE = `${BASE_URL}/api`; // ✅ change made
//   const API_BASE = "http://localhost:5000/api";
window.addEventListener('load', () => {
  const wrapper = document.getElementById('loginFormWrapper');
  setTimeout(() => { wrapper.classList.add('show'); }, 300);
});

function showToast(msg, type="info") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast " + type;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 3000);
}

document.getElementById("loginForm").addEventListener("submit", async function(e){
  e.preventDefault();

  const email = this.email.value.trim().toLowerCase();
  const password = this.password.value;

  if(!email || !password){
    showToast("All fields are required ❌", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
    // const res = await fetch(`${API_BASE}/auth/login`, { // ✅ change made
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("Login response:", data); // ✅ debug

if(res.ok && data.token){
  // Store token and user info first
  localStorage.setItem("token", data.token);

  showToast("Login successful ✅", "success");

  // Redirect to dashboard, not profile
  setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
}
 else {
      showToast(data.error || "Login failed ❌", "error");
    }

  } catch(err) {
    console.error(err);
    showToast("Login failed ❌", "error");
  }
});



