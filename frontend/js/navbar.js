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
  const profileUsername = document.getElementById('profileUsername');
  const profileUsernameMenu = document.getElementById('profileUsernameMenu');
  const profileImage = document.getElementById('profileImage');
  const profileImageMenu = document.getElementById('profileImageMenu');
  const adminNavItem = document.getElementById('admin-nav-item');

  if (profileUsername) {
    profileUsername.textContent = user.username || 'User';
  }
  if (profileUsernameMenu) {
    profileUsernameMenu.textContent = user.username || 'User';
  }
  if (profileImage && user.profilePhoto) {
    // Handle both uploaded files and default URLs
    const imageSrc = user.profilePhoto.startsWith('/uploads/') 
      ? `http://localhost:5001${user.profilePhoto}` 
      : user.profilePhoto;
    profileImage.src = imageSrc;
  }
  if (profileImageMenu && user.profilePhoto) {
    // Handle both uploaded files and default URLs
    const imageSrc = user.profilePhoto.startsWith('/uploads/') 
      ? `http://localhost:5001${user.profilePhoto}` 
      : user.profilePhoto;
    profileImageMenu.src = imageSrc;
  }
  if (adminNavItem && user.role === 'admin') {
    adminNavItem.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', loadNavbar);

