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

document.addEventListener('DOMContentLoaded', loadNavbar);

