// // config.js

// // Default to localhost backend
// const BASE_URL = (function() {
//   try {
//     if (window.location.origin.includes('localhost')) {
//       return 'http://localhost:5000';
//     } else {
//       return 'https://movie-review-platform-ni74.onrender.com';
//     }
//   } catch (e) {
//     console.warn("BASE_URL fallback to localhost due to error:", e);
//     return 'http://localhost:5000';
//   }
// })();

// // API base URL
// // const API_BASE = `${BASE_URL}/api`; // ✅ safe
// console.log("Using API_BASE:", API_BASE); // debug


// config.js

// Force local backend
const BASE_URL = 'http://localhost:5000';
// const BASE_URL = "https://movie-review-platform-ni74.onrender.com";

const API_BASE = `${BASE_URL}/api`;
console.log("API_BASE set to:", API_BASE);

// let BASE_URL;
// if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
//   BASE_URL = "http://localhost:5000";
// } else {
//   BASE_URL = "https://movie-review-platform-ni74.onrender.com";
// }
// const API_BASE = `${BASE_URL}/api`;
// console.log("API_BASE set to:", API_BASE);


// // config.js

// // ✅ Dynamically set BASE_URL based on environment
// let BASE_URL = 'http://localhost:5000'; // default local backend

// try {
//   if (window.location.origin && !window.location.origin.includes('localhost')) {
//     // deployed environment
//     BASE_URL = 'https://movie-review-platform-ni74.onrender.com';
//   }
// } catch (e) {
//   console.warn("BASE_URL fallback to localhost due to error:", e);
// }

// // ✅ API base URL
// const API_BASE = `${BASE_URL}/api`;

// // ✅ Debug log
// console.log("API_BASE set to:", API_BASE);
