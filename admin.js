/* ═══════════════════════════════════════════════
   ROYAL HERITAGE – ADMIN DASHBOARD JAVASCRIPT
   ═══════════════════════════════════════════════ */

/* ── CONSTANTS ── */
const CREDENTIALS = { user: 'rhis-admin', pass: 'RoyalHeritage2026' };
const KEYS = {
  posts: 'rhis_posts',
  announcements: 'rhis_announcements',
  gallery: 'rhis_gallery',
  settings: 'rhis_settings',
  activity: 'rhis_activity',
  session: 'rhis_session'
};

/* ── STORAGE HELPERS ── */
const get = k => JSON.parse(localStorage.getItem(k) || '[]');
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const getObj = k => JSON.parse(localStorage.getItem(k) || '{}');
const setObj = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* ── ACTIVITY LOG ── */
function logActivity(msg) {
  const logs = get(KEYS.activity);
  logs.unshift({ msg, time: new Date().toISOString() });
  set(KEYS.activity, logs.slice(0, 20));
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ══════════════════════════════
   LOGIN
══════════════════════════════ */
function initLogin() {
  // Check existing session
  if (sessionStorage.getItem(KEYS.session) === 'ok') {
    showDashboard();
    return;
  }

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const u = document.getElementById('login-user').value.trim();
    const p = document.getElementById('login-pass').value;
    const err = document.getElementById('login-err');

    // Check if password was changed in settings
    const settings = getObj(KEYS.settings);
    const storedPass = settings.adminPass || CREDENTIALS.pass;
    const storedUser = CREDENTIALS.user;

    if (u === storedUser && p === storedPass) {
      sessionStorage.setItem(KEYS.session, 'ok');
      err.classList.remove('show');
      showDashboard();
    } else {
      err.textContent = 'Invalid username or password. Please try again.';
      err.classList.add('show');
      document.getElementById('login-pass').value = '';
    }
  });
}

function showDashboard() {
  document.getElementById('login-overlay').classList.add('hidden');
  const dash = document.getElementById('dashboard');
  dash.classList.add('visible');
  initDashboard();
}

function logout() {
  if (!confirm('Are you sure you want to log out?')) return;
  sessionStorage.removeItem(KEYS.session);
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('dashboard').classList.remove('visible');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

/* ══════════════════════════════
   DASHBOARD INIT
══════════════════════════════ */
function initDashboard() {
  renderOverview();
  renderPostsTable();
  renderAnnouncementsList();
  renderGallery();
  loadSettings();
  initNav();
  initSidebar();
}

/* ── NAV SWITCHING ── */
function initNav() {
  document.querySelectorAll('.adm-nav a[data-section]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      switchSection(this.dataset.section);
      // close sidebar on mobile
      document.querySelector('.adm-sidebar').classList.remove('open');
      document.querySelector('.sidebar-overlay').classList.remove('show');
    });
  });
}

function switchSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.adm-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  document.querySelector(`.adm-nav a[data-section="${id}"]`).classList.add('active');
  if (id === 'overview') renderOverview();
}

/* ── SIDEBAR MOBILE ── */
function initSidebar() {
  document.getElementById('hamburger').addEventListener('click', function () {
    document.querySelector('.adm-sidebar').classList.toggle('open');
    document.querySelector('.sidebar-overlay').classList.toggle('show');
  });
  document.querySelector('.sidebar-overlay').addEventListener('click', function () {
    document.querySelector('.adm-sidebar').classList.remove('open');
    this.classList.remove('show');
  });
}

/* ══════════════════════════════
   SECTION 1 — OVERVIEW
══════════════════════════════ */
function renderOverview() {
  const posts = get(KEYS.posts);
  const anns = get(KEYS.announcements);
  const published = posts.filter(p => p.status === 'published').length;
  const drafts = posts.filter(p => p.status === 'draft').length;

  document.getElementById('stat-total').textContent = posts.length;
  document.getElementById('stat-published').textContent = published;
  document.getElementById('stat-drafts').textContent = drafts;
  document.getElementById('stat-anns').textContent = anns.length;

  // Activity feed
  const logs = get(KEYS.activity);
  const list = document.getElementById('activity-list');
  if (logs.length === 0) {
    list.innerHTML = '<li style="color:var(--light);font-size:13px;padding:10px 0;">No activity yet. Start by creating a post or announcement.</li>';
  } else {
    list.innerHTML = logs.slice(0, 5).map(l => `
      <li>
        <span class="act-dot"></span>
        <span>${l.msg}</span>
        <span class="act-time">${timeAgo(l.time)}</span>
      </li>`).join('');
  }
}

/* ══════════════════════════════
   SECTION 2 — POSTS
══════════════════════════════ */
let editingPostId = null;

function initPostForm() {
  // Auto-fill date
  document.getElementById('post-date').value = new Date().toISOString().split('T')[0];

  // Image preview
  document.getElementById('post-image').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('img-preview').src = e.target.result;
      document.getElementById('img-preview-wrap').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
}

function savePost() {
  const title = document.getElementById('post-title').value.trim();
  const category = document.getElementById('post-category').value;
  const date = document.getElementById('post-date').value;
  const body = document.getElementById('post-body').innerHTML.trim();
  const status = document.getElementById('post-status').checked ? 'published' : 'draft';
  const imgPreview = document.getElementById('img-preview');
  const image = imgPreview.src && imgPreview.src !== window.location.href ? imgPreview.src : '';

  // Validate
  let valid = true;
  if (!title) { showFieldErr('post-title', 'Title is required'); valid = false; }
  if (!category) { showFieldErr('post-category', 'Select a category'); valid = false; }
  if (!date) { showFieldErr('post-date', 'Date is required'); valid = false; }
  if (!body || body === '') { showToast('Post body cannot be empty', 'error'); valid = false; }
  if (!valid) return;

  const posts = get(KEYS.posts);
  const excerpt = body.replace(/<[^>]+>/g, '').substring(0, 150) + '...';

  if (editingPostId) {
    const idx = posts.findIndex(p => p.id === editingPostId);
    if (idx > -1) {
      posts[idx] = { ...posts[idx], title, category, date, body, excerpt, status, image, updatedAt: new Date().toISOString() };
      logActivity(`Post updated: "${title}"`);
      showToast('Post updated successfully!', 'success');
    }
    editingPostId = null;
    document.querySelector('.form-edit-indicator')?.remove();
  } else {
    const post = {
      id: 'post_' + Date.now(),
      title, category, date, body, excerpt, status, image,
      createdAt: new Date().toISOString()
    };
    posts.unshift(post);
    logActivity(`New post created: "${title}"`);
    showToast('Post saved successfully!', 'success');
  }

  set(KEYS.posts, posts);
  clearPostForm();
  renderPostsTable();
  renderOverview();
}

function clearPostForm() {
  document.getElementById('post-title').value = '';
  document.getElementById('post-category').value = '';
  document.getElementById('post-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('post-body').innerHTML = '';
  document.getElementById('post-status').checked = true;
  document.getElementById('img-preview-wrap').style.display = 'none';
  document.getElementById('img-preview').src = '';
  document.getElementById('post-image').value = '';
  editingPostId = null;
  document.querySelector('.form-edit-indicator')?.remove();
  clearFieldErrs();
}

function editPost(id) {
  const posts = get(KEYS.posts);
  const post = posts.find(p => p.id === id);
  if (!post) return;

  switchSection('posts');
  editingPostId = id;
  document.getElementById('post-title').value = post.title;
  document.getElementById('post-category').value = post.category;
  document.getElementById('post-date').value = post.date;
  document.getElementById('post-body').innerHTML = post.body;
  document.getElementById('post-status').checked = post.status === 'published';

  if (post.image) {
    document.getElementById('img-preview').src = post.image;
    document.getElementById('img-preview-wrap').style.display = 'block';
  }

  // Show edit indicator
  document.querySelector('.form-edit-indicator')?.remove();
  const ind = document.createElement('div');
  ind.className = 'form-edit-indicator';
  ind.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editing: <strong>${post.title}</strong> <button onclick="clearPostForm()" class="btn btn-sm btn-outline" style="margin-left:10px">Cancel Edit</button>`;
  ind.style.cssText = 'background:rgba(180,137,42,.1);border:1px solid rgba(180,137,42,.3);border-radius:8px;padding:10px 14px;font-size:13px;color:var(--navy);display:flex;align-items:center;gap:8px;margin-bottom:16px;';
  document.getElementById('post-form-card').prepend(ind);
  document.getElementById('post-form-card').scrollIntoView({ behavior: 'smooth' });
}

function deletePost(id) {
  if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
  let posts = get(KEYS.posts);
  const post = posts.find(p => p.id === id);
  posts = posts.filter(p => p.id !== id);
  set(KEYS.posts, posts);
  if (post) logActivity(`Post deleted: "${post.title}"`);
  renderPostsTable();
  renderOverview();
  showToast('Post deleted.', 'success');
}

function togglePostStatus(id) {
  const posts = get(KEYS.posts);
  const idx = posts.findIndex(p => p.id === id);
  if (idx === -1) return;
  posts[idx].status = posts[idx].status === 'published' ? 'draft' : 'published';
  set(KEYS.posts, posts);
  logActivity(`Post "${posts[idx].title}" set to ${posts[idx].status}`);
  renderPostsTable();
  renderOverview();
}

function renderPostsTable(filter = '') {
  let posts = get(KEYS.posts);
  if (filter) {
    const q = filter.toLowerCase();
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  const tbody = document.getElementById('posts-tbody');
  if (posts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state">
        <i class="fa-solid fa-newspaper"></i>
        <p>${filter ? 'No posts match your search.' : 'No posts yet. Create your first post above!'}</p>
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = posts.map(p => `
    <tr>
      <td><strong style="color:var(--navy)">${p.title}</strong></td>
      <td><span class="badge badge-${p.category}">${p.category}</span></td>
      <td>${formatDate(p.date)}</td>
      <td><span class="badge badge-${p.status}">${p.status}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-sm btn-outline" onclick="editPost('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-sm btn-navy" onclick="togglePostStatus('${p.id}')" title="Toggle status"><i class="fa-solid fa-rotate"></i></button>
          <button class="btn btn-sm btn-danger" onclick="deletePost('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');
}

/* ══════════════════════════════
   SECTION 3 — ANNOUNCEMENTS
══════════════════════════════ */
let editingAnnId = null;

function saveAnnouncement() {
  const title = document.getElementById('ann-title').value.trim();
  const body = document.getElementById('ann-body').value.trim();
  const priority = document.getElementById('ann-priority').value;
  const expiry = document.getElementById('ann-expiry').value;

  if (!title) { showFieldErr('ann-title', 'Title is required'); return; }
  if (!body)  { showFieldErr('ann-body', 'Message is required'); return; }
  if (!priority) { showFieldErr('ann-priority', 'Select a priority'); return; }
  if (!expiry) { showFieldErr('ann-expiry', 'Expiry date is required'); return; }

  const anns = get(KEYS.announcements);

  if (editingAnnId) {
    const idx = anns.findIndex(a => a.id === editingAnnId);
    if (idx > -1) anns[idx] = { ...anns[idx], title, body, priority, expiry };
    logActivity(`Announcement updated: "${title}"`);
    showToast('Announcement updated!', 'success');
    editingAnnId = null;
  } else {
    anns.unshift({
      id: 'ann_' + Date.now(),
      title, body, priority, expiry,
      createdAt: new Date().toISOString()
    });
    logActivity(`Announcement posted: "${title}"`);
    showToast('Announcement posted!', 'success');
  }

  set(KEYS.announcements, anns);
  clearAnnForm();
  renderAnnouncementsList();
  renderOverview();
}

function clearAnnForm() {
  document.getElementById('ann-title').value = '';
  document.getElementById('ann-body').value = '';
  document.getElementById('ann-priority').value = '';
  document.getElementById('ann-expiry').value = '';
  editingAnnId = null;
  clearFieldErrs();
}

function editAnn(id) {
  const anns = get(KEYS.announcements);
  const ann = anns.find(a => a.id === id);
  if (!ann) return;
  editingAnnId = id;
  document.getElementById('ann-title').value = ann.title;
  document.getElementById('ann-body').value = ann.body;
  document.getElementById('ann-priority').value = ann.priority;
  document.getElementById('ann-expiry').value = ann.expiry;
  document.getElementById('ann-form-card').scrollIntoView({ behavior: 'smooth' });
  showToast('Announcement loaded for editing.', 'info');
}

function deleteAnn(id) {
  if (!confirm('Delete this announcement?')) return;
  let anns = get(KEYS.announcements);
  const ann = anns.find(a => a.id === id);
  anns = anns.filter(a => a.id !== id);
  set(KEYS.announcements, anns);
  if (ann) logActivity(`Announcement deleted: "${ann.title}"`);
  renderAnnouncementsList();
  renderOverview();
  showToast('Announcement deleted.', 'success');
}

function isExpired(expiry) {
  return expiry && new Date(expiry) < new Date();
}

function renderAnnouncementsList() {
  const anns = get(KEYS.announcements);
  const container = document.getElementById('ann-list');
  if (anns.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-bullhorn"></i><p>No announcements yet.</p></div>`;
    return;
  }
  container.innerHTML = anns.map(a => {
    const expired = isExpired(a.expiry);
    return `
    <div class="ann-card ${expired ? 'expired' : a.priority}">
      <div class="ann-body">
        <h4>${a.title}</h4>
        <p>${a.body.substring(0, 120)}${a.body.length > 120 ? '...' : ''}</p>
        <div class="ann-meta">
          <span class="badge badge-${expired ? 'expired' : a.priority}">${expired ? 'Expired' : a.priority}</span>
          <span><i class="fa-regular fa-calendar"></i> Expires: ${formatDate(a.expiry)}</span>
        </div>
      </div>
      <div class="ann-actions">
        <button class="btn btn-sm btn-outline" onclick="editAnn('${a.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteAnn('${a.id}')"><i class="fa-solid fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════
   SECTION 4 — GALLERY
══════════════════════════════ */
function saveGalleryItem() {
  const fileInput = document.getElementById('gal-file');
  const caption = document.getElementById('gal-caption').value.trim();
  const category = document.getElementById('gal-category').value;

  if (!fileInput.files[0]) { showToast('Please select an image.', 'error'); return; }
  if (!caption) { showFieldErr('gal-caption', 'Caption is required'); return; }
  if (!category) { showFieldErr('gal-category', 'Select a category'); return; }

  const reader = new FileReader();
  reader.onload = function (e) {
    const gallery = get(KEYS.gallery);
    gallery.unshift({
      id: 'gal_' + Date.now(),
      image: e.target.result,
      caption, category,
      createdAt: new Date().toISOString()
    });
    set(KEYS.gallery, gallery);
    logActivity(`Gallery image added: "${caption}"`);
    showToast('Image added to gallery!', 'success');
    document.getElementById('gal-file').value = '';
    document.getElementById('gal-caption').value = '';
    document.getElementById('gal-category').value = '';
    renderGallery();
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function deleteGalleryItem(id) {
  if (!confirm('Delete this image from gallery?')) return;
  let gallery = get(KEYS.gallery);
  gallery = gallery.filter(g => g.id !== id);
  set(KEYS.gallery, gallery);
  logActivity('Gallery image deleted');
  renderGallery();
  showToast('Image deleted.', 'success');
}

function renderGallery() {
  const gallery = get(KEYS.gallery);
  const grid = document.getElementById('gal-grid');
  if (gallery.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fa-solid fa-images"></i><p>No gallery images yet.</p></div>`;
    return;
  }
  grid.innerHTML = gallery.map(g => `
    <div class="gal-item">
      <img src="${g.image}" alt="${g.caption}"/>
      <div class="gal-info">
        <div class="cap">${g.caption}</div>
        <span class="badge cat-badge badge-${g.category.toLowerCase()}">${g.category}</span>
      </div>
      <button class="gal-del" onclick="deleteGalleryItem('${g.id}')"><i class="fa-solid fa-trash"></i> Remove</button>
    </div>`).join('');
}

/* ══════════════════════════════
   SECTION 5 — SETTINGS
══════════════════════════════ */
function loadSettings() {
  const s = getObj(KEYS.settings);
  document.getElementById('set-name').value    = s.name    || 'Royal Heritage International School';
  document.getElementById('set-tagline').value = s.tagline || 'Passion for Excellence';
  document.getElementById('set-phone').value   = s.phone   || '';
  document.getElementById('set-email').value   = s.email   || 'info@royalheritage.edu.ng';
  document.getElementById('set-address').value = s.address || 'Osun State, Nigeria';
}

function saveSettings() {
  const s = getObj(KEYS.settings);
  s.name    = document.getElementById('set-name').value.trim();
  s.tagline = document.getElementById('set-tagline').value.trim();
  s.phone   = document.getElementById('set-phone').value.trim();
  s.email   = document.getElementById('set-email').value.trim();
  s.address = document.getElementById('set-address').value.trim();
  setObj(KEYS.settings, s);
  logActivity('Site settings updated');
  showToast('Settings saved successfully!', 'success');
}

function changePassword() {
  const current  = document.getElementById('pass-current').value;
  const newPass  = document.getElementById('pass-new').value;
  const confirm  = document.getElementById('pass-confirm').value;
  const s = getObj(KEYS.settings);
  const storedPass = s.adminPass || CREDENTIALS.pass;

  if (current !== storedPass) { showToast('Current password is incorrect.', 'error'); return; }
  if (newPass.length < 8)     { showToast('New password must be at least 8 characters.', 'error'); return; }
  if (newPass !== confirm)     { showToast('New passwords do not match.', 'error'); return; }

  s.adminPass = newPass;
  setObj(KEYS.settings, s);
  logActivity('Admin password changed');
  showToast('Password changed successfully!', 'success');
  document.getElementById('pass-current').value = '';
  document.getElementById('pass-new').value = '';
  document.getElementById('pass-confirm').value = '';
}

/* ══════════════════════════════
   TOOLBAR (RICH TEXT)
══════════════════════════════ */
function execCmd(cmd, val = null) {
  document.getElementById('post-body').focus();
  document.execCommand(cmd, false, val);
}

/* ══════════════════════════════
   HELPERS
══════════════════════════════ */
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showFieldErr(id, msg) {
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--danger)';
  let errEl = el.parentNode.querySelector('.field-err');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-err';
    errEl.style.cssText = 'color:var(--danger);font-size:11px;margin-top:3px;';
    el.parentNode.appendChild(errEl);
  }
  errEl.textContent = msg;
  setTimeout(() => {
    el.style.borderColor = '';
    errEl?.remove();
  }, 3000);
}

function clearFieldErrs() {
  document.querySelectorAll('.field-err').forEach(e => e.remove());
}

let toastTimer;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimer);
  let toast = document.getElementById('adm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'adm-toast';
    toast.style.cssText = `
      position:fixed;bottom:28px;right:28px;z-index:9999;
      padding:14px 20px;border-radius:10px;font-size:14px;font-weight:600;
      display:flex;align-items:center;gap:10px;
      box-shadow:0 8px 32px rgba(0,0,0,.2);
      transform:translateY(20px);opacity:0;
      transition:all .3s ease;font-family:'Inter',sans-serif;
    `;
    document.body.appendChild(toast);
  }
  const colors = {
    success: { bg: '#27ae60', icon: 'fa-circle-check' },
    error:   { bg: '#c0392b', icon: 'fa-circle-xmark' },
    info:    { bg: '#2980b9', icon: 'fa-circle-info' }
  };
  const c = colors[type] || colors.success;
  toast.style.background = c.bg;
  toast.style.color = '#fff';
  toast.innerHTML = `<i class="fa-solid ${c.icon}"></i> ${msg}`;
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
  }, 3000);
}

/* ══════════════════════════════
   BOOT
══════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {
  initLogin();
  initPostForm();
});