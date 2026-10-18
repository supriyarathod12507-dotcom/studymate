/**
 * StudyMate API client
 */
const API = {
  getToken() {
    return localStorage.getItem('sm_token');
  },

  setAuth(token, user) {
    localStorage.setItem('sm_token', token);
    localStorage.setItem('sm_user', JSON.stringify(user));
  },

  clearAuth() {
    localStorage.removeItem('sm_token');
    localStorage.removeItem('sm_user');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('sm_user') || 'null');
    } catch {
      return null;
    }
  },

  updateUser(user) {
    localStorage.setItem('sm_user', JSON.stringify(user));
  },

  async request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${window.API_BASE}${path}`, opts);
    } catch (err) {
      throw new Error('Network error. Please check your connection.');
    }

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid server response.');
    }

    if (res.status === 401) {
      this.clearAuth();
      if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register') && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'Please login again.');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong.');
    }
    return data;
  },

  get(path) {
    return this.request('GET', path);
  },
  post(path, body) {
    return this.request('POST', path, body);
  },
  put(path, body) {
    return this.request('PUT', path, body);
  },
  del(path) {
    return this.request('DELETE', path);
  },
};

// Toast helper
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type === 'error' ? 'error' : type === 'success' ? 'success' : ''}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 3500);
}

function requireAuth() {
  if (!API.getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMinutes(m) {
  if (!m || m < 1) return '0 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min ? `${h}h ${min}m` : `${h}h`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
