<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aplikasi CRUD PBO - LocalStorage</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background-color: #f4f6f9; padding: 20px; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    nav { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    nav button { padding: 8px 16px; border: none; background: #e0e0e0; cursor: pointer; border-radius: 4px; font-weight: bold; }
    nav button.active { background: #007bff; color: white; }
    .page { display: none; }
    .page.active { display: block; }
    form { display: flex; flex-direction: column; gap: 12px; max-width: 400px; }
    input, select { padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
    button.btn { padding: 10px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button.btn-danger { background: #dc3545; }
    button.btn-warning { background: #ffc107; color: #000; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f8f9fa; }
    .card { background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 6px; margin-top: 10px; }
    .hidden { display: none !important; }
  </style>
</head>
<body>

<div class="container">
  <!-- Navigasi Utama -->
  <nav id="navbar">
    <button id="nav-login" onclick="app.showPage('login')">Login</button>
    <button id="nav-users" onclick="app.showPage('users')" class="auth-only hidden">Daftar User (CRUD)</button>
    <button id="nav-profile" onclick="app.showPage('profile')" class="auth-only hidden">Profile</button>
    <button id="nav-logout" onclick="app.logout()" class="auth-only hidden" style="margin-left: auto; background: #dc3545; color: white;">Logout</button>
  </nav>

  <!-- Halaman 1: Login -->
  <div id="page-login" class="page active">
    <h2>Form Login</h2>
    <p style="margin-bottom: 15px; color: #666;">Pilih user terdaftar atau login sebagai Admin bawaan (Username: <b>admin</b>, Pass: <b>admin123</b>).</p>
    <form onsubmit="app.handleLogin(event)">
      <input type="text" id="login-username" placeholder="Username" required>
      <input type="password" id="login-password" placeholder="Password" required>
      <button type="submit" class="btn">Masuk</button>
    </form>
  </div>

  <!-- Halaman 2: Daftar User (CRUD Tabel) -->
  <div id="page-users" class="page">
    <h2>Manajemen User (CRUD)</h2>
    <div class="card">
      <h3 id="form-title">Tambah User Baru</h3>
      <form id="user-form" onsubmit="app.handleFormSubmit(event)">
        <input type="hidden" id="user-id">
        <input type="text" id="input-username" placeholder="Username" required>
        <input type="email" id="input-email" placeholder="Email" required>
        <select id="input-role">
          <option value="Regular">Regular User</option>
          <option value="Admin">Admin User</option>
        </select>
        <button type="submit" class="btn" id="btn-save">Simpan Data</button>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Email</th>
          <th>Role</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody id="user-table-body">
        <!-- Data dirender melalui JavaScript -->
      </tbody>
    </table>
  </div>

  <!-- Halaman 3: Profile -->
  <div id="page-profile" class="page">
    <h2>Profil Saya</h2>
    <div id="profile-content" class="card">
      <!-- Data profil dirender melalui JavaScript -->
    </div>
  </div>
</div>

<script>
// ==========================================
// 1. CLASS IMPLEMENTASI KONSEP PBO
// ==========================================

// Superclass (Parent Class)
class User {
  constructor(id, username, email, role) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.role = role;
  }

  // Method yang akan di-override (Polimorfisme)
  getRolePermissions() {
    return "Akses dasar pengguna.";
  }
}

// Subclass 1: AdminUser (Pewarisan)
class AdminUser extends User {
  constructor(id, username, email) {
    super(id, username, email, 'Admin');
  }

  // Override Method (Polimorfisme)
  getRolePermissions() {
    return "Akses Penuh: Tambah, Edit, Hapus, dan Lihat Data User.";
  }
}

// Subclass 2: RegularUser (Pewarisan)
class RegularUser extends User {
  constructor(id, username, email) {
    super(id, username, email, 'Regular');
  }

  // Override Method (Polimorfisme)
  getRolePermissions() {
    return "Akses Terbatas: Hanya dapat melihat profil pribadi.";
  }
}

// Factory Pattern sederhana untuk membuat objek sesuai Role
class UserFactory {
  static createUser(id, username, email, role) {
    if (role === 'Admin') {
      return new AdminUser(id, username, email);
    }
    return new RegularUser(id, username, email);
  }
}

// ==========================================
// 2. MANAJEMEN APLIKASI & LOCALSTORAGE
// ==========================================

class AppManager {
  constructor() {
    this.currentUser = null;
    this.initDatabase();
  }

  // Inisialisasi Data Default ke LocalStorage jika masih kosong
  initDatabase() {
    if (!localStorage.getItem('users')) {
      const defaultUsers = [
        { id: 1, username: 'admin', email: 'admin@mail.com', role: 'Admin' },
        { id: 2, username: 'budi', email: 'budi@mail.com', role: 'Regular' }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }

  getUsersFromStorage() {
    const rawData = JSON.parse(localStorage.getItem('users')) || [];
    // Mengubah plain object menjadi instance class PBO
    return rawData.map(u => UserFactory.createUser(u.id, u.username, u.email, u.role));
  }

  saveUsersToStorage(users) {
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Navigasi Halaman
  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));

    document.getElementById(`page-${pageId}`).classList.add('active');
    const activeNav = document.getElementById(`nav-${pageId}`);
    if (activeNav) activeNav.classList.add('active');

    if (pageId === 'users') this.renderTable();
    if (pageId === 'profile') this.renderProfile();
  }

  // Fitur Login
  handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    const users = this.getUsersFromStorage();

    const foundUser = users.find(u => u.username === usernameInput);

    if (foundUser) {
      this.currentUser = foundUser;
      this.updateUIState(true);
      this.showPage('profile');
      document.getElementById('login-username').value = '';
      document.getElementById('login-password').value = '';
    } else {
      alert('User tidak ditemukan! Gunakan username "admin" atau "budi".');
    }
  }

  // Logout
  logout() {
    this.currentUser = null;
    this.updateUIState(false);
    this.showPage('login');
  }

  updateUIState(isLoggedIn) {
    const authElements = document.querySelectorAll('.auth-only');
    authElements.forEach(el => {
      if (isLoggedIn) el.classList.remove('hidden');
      else el.classList.add('hidden');
    });

    const loginNav = document.getElementById('nav-login');
    if (isLoggedIn) loginNav.classList.add('hidden');
    else loginNav.classList.remove('hidden');
  }

  // CRUD: Read (Tabel User)
  renderTable() {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = '';
    const users = this.getUsersFromStorage();

    users.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td><b>${user.role}</b></td>
        <td>
          <button class="btn btn-warning" onclick="app.editUser(${user.id})">Edit</button>
          <button class="btn btn-danger" onclick="app.deleteUser(${user.id})">Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // CRUD: Create & Update
  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('input-username').value;
    const email = document.getElementById('input-email').value;
    const role = document.getElementById('input-role').value;

    let users = this.getUsersFromStorage();

    if (id) {
      // Update
      users = users.map(u => u.id === parseInt(id) ? { id: parseInt(id), username, email, role } : u);
    } else {
      // Create
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      users.push({ id: newId, username, email, role });
    }

    this.saveUsersToStorage(users);
    this.resetForm();
    this.renderTable();
  }

  // CRUD: Edit (Persiapan Form)
  editUser(id) {
    const users = this.getUsersFromStorage();
    const user = users.find(u => u.id === id);

    if (user) {
      document.getElementById('user-id').value = user.id;
      document.getElementById('input-username').value = user.username;
      document.getElementById('input-email').value = user.email;
      document.getElementById('input-role').value = user.role;

      document.getElementById('form-title').innerText = 'Edit User';
      document.getElementById('btn-save').innerText = 'Update Data';
    }
  }

  // CRUD: Delete
  deleteUser(id) {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      let users = this.getUsersFromStorage();
      users = users.filter(u => u.id !== id);
      this.saveUsersToStorage(users);
      this.renderTable();
    }
  }

  resetForm() {
    document.getElementById('user-id').value = '';
    document.getElementById('user-form').reset();
    document.getElementById('form-title').innerText = 'Tambah User Baru';
    document.getElementById('btn-save').innerText = 'Simpan Data';
  }

  // Halaman Profil (Menampilkan Polimorfisme)
  renderProfile() {
    const container = document.getElementById('profile-content');
    if (!this.currentUser) {
      container.innerHTML = '<p>Silakan login terlebih dahulu.</p>';
      return;
    }

    // Pemanggilan method getRolePermissions() membuktikan Polimorfisme
    container.innerHTML = `
      <p><b>ID:</b> ${this.currentUser.id}</p>
      <p><b>Username:</b> ${this.currentUser.username}</p>
      <p><b>Email:</b> ${this.currentUser.email}</p>
      <p><b>Role Class:</b> ${this.currentUser.constructor.name}</p>
      <p><b>Izin Akses (Polimorfisme):</b> ${this.currentUser.getRolePermissions()}</p>
    `;
  }
}

// Inisialisasi Aplikasi
const app = new AppManager();
</script>

</body>
</html>
