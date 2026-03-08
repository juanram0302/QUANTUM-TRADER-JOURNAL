// ═══════════════════════════════════════════════════════
// QUANTUM TRADER — AUTH SYSTEM
// Sistema de autenticación con aprobación manual
// ═══════════════════════════════════════════════════════

const AUTH = {

  // ─── ADMIN CREDENTIALS (cambiar antes de publicar) ───
  ADMIN_EMAIL: 'admin@quantumtrader.pro',
  ADMIN_PASS:  'quantum2025',

  // ─── INIT ───
  init() {
    // Crear admin por defecto si no existe
    const users = this.getUsers();
    const adminExists = users.find(u => u.email === this.ADMIN_EMAIL);
    if (!adminExists) {
      users.push({
        id: 'admin',
        name: 'Admin',
        email: this.ADMIN_EMAIL,
        password: this.ADMIN_PASS,
        role: 'admin',
        status: 'approved',
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        country: 'Admin',
        experience: '',
        acceptedTerms: true,
        lastLogin: null,
        tradesCount: 0,
      });
      this.saveUsers(users);
    }
  },

  // ─── REGISTER ───
  register(data) {
    const users = this.getUsers();

    // Check email duplicado
    if (users.find(u => u.email === data.email)) {
      return { ok: false, msg: 'Este email ya está registrado.' };
    }

    const user = {
      id: 'u_' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      role: 'student',
      status: 'pending', // pending | approved | rejected
      registeredAt: new Date().toISOString(),
      approvedAt: null,
      acceptedTerms: data.acceptedTerms,
      lastLogin: null,
      tradesCount: 0,
      notes: '',
    };

    users.push(user);
    this.saveUsers(users);
    return { ok: true, user };
  },

  // ─── LOGIN ───
  login(email, password) {
    this.init();
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) return { ok: false, msg: 'Email o contraseña incorrectos.' };
    if (user.status === 'pending') return { ok: false, msg: 'Tu cuenta está pendiente de aprobación. El admin revisará tu solicitud pronto.', status: 'pending' };
    if (user.status === 'rejected') return { ok: false, msg: 'Tu acceso ha sido rechazado. Contacta al administrador.', status: 'rejected' };

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);

    // Save session
    sessionStorage.setItem('qt_session', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      loginAt: new Date().toISOString(),
    }));

    return { ok: true, user };
  },

  // ─── LOGOUT ───
  logout() {
    sessionStorage.removeItem('qt_session');
    window.location.href = 'login.html';
  },

  // ─── GET SESSION ───
  getSession() {
    const s = sessionStorage.getItem('qt_session');
    return s ? JSON.parse(s) : null;
  },

  // ─── REQUIRE AUTH ───
  requireAuth(adminOnly = false) {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    if (adminOnly && session.role !== 'admin') {
      window.location.href = 'app.html';
      return null;
    }
    return session;
  },

  // ─── ADMIN: APPROVE USER ───
  approveUser(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.status = 'approved';
    user.approvedAt = new Date().toISOString();
    this.saveUsers(users);
    return true;
  },

  // ─── ADMIN: REJECT USER ───
  rejectUser(userId) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.status = 'rejected';
    this.saveUsers(users);
    return true;
  },

  // ─── ADMIN: DELETE USER ───
  deleteUser(userId) {
    let users = this.getUsers();
    users = users.filter(u => u.id !== userId);
    this.saveUsers(users);
    return true;
  },

  // ─── ADMIN: UPDATE NOTES ───
  updateNotes(userId, notes) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return false;
    user.notes = notes;
    this.saveUsers(users);
    return true;
  },

  // ─── STORAGE ───
  getUsers() {
    const raw = localStorage.getItem('qt_users');
    return raw ? JSON.parse(raw) : [];
  },

  saveUsers(users) {
    localStorage.setItem('qt_users', JSON.stringify(users));
  },

  // ─── STATS FOR ADMIN ───
  getStats() {
    const users = this.getUsers().filter(u => u.role !== 'admin');
    return {
      total: users.length,
      pending: users.filter(u => u.status === 'pending').length,
      approved: users.filter(u => u.status === 'approved').length,
      rejected: users.filter(u => u.status === 'rejected').length,
    };
  },
};

// Auto-init
AUTH.init();
