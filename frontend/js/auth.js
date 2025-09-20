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
      const adminProfileDropdown = document.getElementById('admin-profile-dropdown');
      const userProfileDropdown = document.getElementById('user-profile-dropdown');

      // Profile image handling
      const profileImage = document.getElementById('profileImage');
      const profileImageMenu = document.getElementById('profileImageMenu');
      const userProfileImage = document.getElementById('userProfileImage');
      const userProfileImageMenu = document.getElementById('userProfileImageMenu');
      const profileUsername = document.getElementById('profileUsername');
      const profileUsernameMenu = document.getElementById('profileUsernameMenu');
      const userProfileName = document.getElementById('userProfileName');
      const userProfileNameMenu = document.getElementById('userProfileNameMenu');

      if (user.role === 'admin') {
        // Show admin profile dropdown
        if (adminProfileDropdown) {
          adminProfileDropdown.style.display = 'block';
        }
        if (userProfileDropdown) {
          userProfileDropdown.style.display = 'none';
        }

        // Update admin profile images and names
        if (profileImage && user.profilePhoto) {
          const imageSrc = user.profilePhoto.startsWith('/uploads/') 
            ? `http://localhost:5001${user.profilePhoto}` 
            : user.profilePhoto;
          profileImage.src = imageSrc;
        }
        if (profileImageMenu && user.profilePhoto) {
          const imageSrc = user.profilePhoto.startsWith('/uploads/') 
            ? `http://localhost:5001${user.profilePhoto}` 
            : user.profilePhoto;
          profileImageMenu.src = imageSrc;
        }
        if (profileUsername) {
          profileUsername.textContent = user.username || 'Admin';
        }
        if (profileUsernameMenu) {
          profileUsernameMenu.textContent = user.username || 'Admin';
        }
      } else {
        // Show user profile dropdown
        if (adminProfileDropdown) {
          adminProfileDropdown.style.display = 'none';
        }
        if (userProfileDropdown) {
          userProfileDropdown.style.display = 'block';
        }

        // Update user profile images and names
        if (userProfileImage && user.profilePhoto) {
          const imageSrc = user.profilePhoto.startsWith('/uploads/') 
            ? `http://localhost:5001${user.profilePhoto}` 
            : user.profilePhoto;
          userProfileImage.src = imageSrc;
        }
        if (userProfileImageMenu && user.profilePhoto) {
          const imageSrc = user.profilePhoto.startsWith('/uploads/') 
            ? `http://localhost:5001${user.profilePhoto}` 
            : user.profilePhoto;
          userProfileImageMenu.src = imageSrc;
        }
        if (userProfileName) {
          userProfileName.textContent = user.username || 'User';
        }
        if (userProfileNameMenu) {
          userProfileNameMenu.textContent = user.username || 'User';
        }
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
