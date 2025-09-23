async function loadNavbar() {
  try {
    const res = await fetch('/navbar.html', { cache: 'no-store' });
    const html = await res.text();
    const host = document.getElementById('navbar-host');
    if (host) {
      host.innerHTML = html;
      // Update profile after navbar loads
      if (typeof updateProfileInNavbar === 'function') {
        setTimeout(updateProfileInNavbar, 50);
      }
    }
  } catch (_) {
    // ignore
  }
}

function updateProfileInNavbar() {
  const user = JSON.parse(localStorage.getItem('triotrails_user') || '{}');
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
  const navContactItem = document.getElementById('nav-contact-item');

  if (user.role === 'admin') {
    // Hide Contact link for admins
    if (navContactItem) {
      navContactItem.style.display = 'none';
    }
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
    // Show Contact link for non-admins
    if (navContactItem) {
      navContactItem.style.display = '';
    }
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
}

document.addEventListener('DOMContentLoaded', loadNavbar);

