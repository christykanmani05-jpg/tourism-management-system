// Authentication check function
function checkAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn || isLoggedIn !== 'true') {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Admin authentication check function
function checkAdminAuth() {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const isAdmin = localStorage.getItem('isAdmin');
  const userData = localStorage.getItem('triotrails_user');
  
  if (!isLoggedIn || isLoggedIn !== 'true') {
    window.location.href = '/admin-login.html';
    return false;
  }
  
  if (!isAdmin || isAdmin !== 'true') {
    // Check if user has admin role
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') {
          localStorage.setItem('isAdmin', 'true');
          return true;
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    window.location.href = '/admin-login.html';
    return false;
  }
  
  return true;
}

// Update profile in navbar
function updateProfileInNavbar() {
  const userData = localStorage.getItem('triotrails_user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      const profileImage = document.getElementById('profileImage');
      const profileUsername = document.getElementById('profileUsername');
      const adminNavItem = document.getElementById('admin-nav-item');
      
      if (profileImage) {
        profileImage.src = user.profilePhoto || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
      }
      if (profileUsername) {
        profileUsername.textContent = user.username || 'User';
      }
      if (adminNavItem) {
        // Show admin link only for admin users
        adminNavItem.style.display = (user.role === 'admin') ? 'block' : 'none';
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('triotrails_user');
  window.location.href = '/login.html';
}

// Check authentication on page load (except for login pages)
document.addEventListener('DOMContentLoaded', function() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('login') || currentPage.includes('login1');
  const isAdminPage = currentPage.includes('admin.html');
  
  if (!isLoginPage) {
    if (isAdminPage) {
      // For admin pages, check admin authentication
      if (checkAdminAuth()) {
        setTimeout(updateProfileInNavbar, 100);
      }
    } else {
      // For regular pages, check regular authentication
      if (checkAuth()) {
        setTimeout(updateProfileInNavbar, 100);
      }
    }
  }
});
