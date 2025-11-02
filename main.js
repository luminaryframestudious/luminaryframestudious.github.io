// LuminaryFrame Studios JavaScript Functionality — Stage 3

// ===== EMAIL VALIDATION ===== const form = document.querySelector('form'); const emailInput = form.querySelector('input[type=email]');

function isValidEmail(email) { const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/; return regex.test(email); }

// ===== FORM SUBMISSION ===== form.addEventListener('submit', e => { e.preventDefault();

const email = emailInput.value.trim(); if (!isValidEmail(email)) { alert('⚠️ Please enter a valid email address.'); emailInput.focus(); return; }

alert('✅ Booking submitted! You will be redirected to UPI payment.');

// ===== DIRECT UPI PAYMENT LINK ===== const upiID = '9239529167@fam'; const name = 'LuminaryFrameStudios'; const amount = '100'; // Example fixed amount; can be dynamic later const url = upi://pay?pa=${upiID}&pn=${name}&am=${amount}&cu=INR;

window.location.href = url; });

// ===== SCROLL ANIMATION EFFECT ===== const animatedElements = document.querySelectorAll('[data-animate]');

function revealOnScroll() { animatedElements.forEach(el => { const rect = el.getBoundingClientRect(); if (rect.top < window.innerHeight - 100) { el.style.animationPlayState = 'running'; } }); }

window.addEventListener('scroll', revealOnScroll); window.addEventListener('load', revealOnScroll);

// ===== SIMPLE ADMIN ACCESS DEMO ===== // (Real authentication will be added in Stage 4) function adminLogin() { const pass = prompt('Enter Admin Passcode'); if (pass === 'luminaryadmin') { alert('Welcome, Admin! Full control unlocked.'); } else { alert('Access Denied.'); } }

// Attach adminLogin to any future Admin Panel button // Example: <button onclick="adminLogin()">Admin Panel</button>