import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, Users, RefreshCw, Trash2, Edit, ShieldCheck, LogOut } from 'lucide-react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
  modified_at: string;
  deleted_at: string | null;
}

const API_BASE = 'http://localhost:3000';

export function App() {
  const [token, setToken] = useState<string>(localStorage.getItem('jwt_token') || '');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Create user form state
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');

  // Update user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      fetchCurrentUser();
      fetchUsers();
    } else {
      localStorage.removeItem('jwt_token');
      setCurrentUser(null);
      setUsers([]);
    }
  }, [token]);

  const showMsg = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      setToken(data.access_token);
      setCurrentUser(data.user);
      showMsg('Successfully authenticated! JWT token received.');
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to get profile');
      setCurrentUser(data);
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to list users');
      setUsers(data);
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: createFirstName,
          last_name: createLastName,
          email: createEmail,
          password: createPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      showMsg(`User ${data.email} created successfully!`);
      setCreateFirstName('');
      setCreateLastName('');
      setCreateEmail('');
      setCreatePassword('');
      if (token) fetchUsers();
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditFirstName(user.first_name);
    setEditLastName(user.last_name);
    setEditEmail(user.email);
    setEditPassword('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const payload: any = {
        first_name: editFirstName,
        last_name: editLastName,
        email: editEmail,
      };
      if (editPassword) payload.password = editPassword;

      const res = await fetch(`${API_BASE}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update user');
      showMsg(`User #${data.id} updated successfully!`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const handleSoftDelete = async (id: number) => {
    if (!confirm(`Soft delete user #${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/soft`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to soft delete');
      showMsg(data.message);
      fetchUsers();
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const handleHardDelete = async (id: number) => {
    if (!confirm(`PERMANENTLY hard delete user #${id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}/hard`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to hard delete');
      showMsg(data.message);
      fetchUsers();
    } catch (err: any) {
      showMsg(err.message, true);
    }
  };

  const handleLogout = () => {
    setToken('');
    showMsg('Logged out successfully');
  };

  return (
    <div className="container">
      <header className="header-bar">
        <div>
          <h1>Auth & Users Management <span className="badge">NestJS + TypeORM + Jose JWT</span></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            Assessment Task Dashboard (React.js Frontend)
          </p>
        </div>
        {token && (
          <button onClick={handleLogout} className="btn btn-secondary">
            <LogOut size={16} /> Logout
          </button>
        )}
      </header>

      {message && (
        <div className={`alert ${message.isError ? 'alert-error' : 'alert-success'}`}>
          {message.text}
        </div>
      )}

      {!token ? (
        <div className="grid grid-2">
          {/* LOGIN CARD */}
          <div className="card">
            <h2><LogIn size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Auth API: Login</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.85rem' }}>
              POST /auth/login & return Jwt Token response (Jose JWT)
            </p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <LogIn size={16} /> Sign In & Get JWT Token
              </button>
            </form>
          </div>

          {/* CREATE USER CARD */}
          <div className="card">
            <h2><UserPlus size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Users API: Create User</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: '0.85rem' }}>
              POST /users method
            </p>
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <UserPlus size={16} /> Create User Account
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid">
          {/* CURRENT USER PANEL */}
          {currentUser && (
            <div className="card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShieldCheck size={20} color="#10b981" /> Authenticated User (GET /auth/me)
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                    Welcome, <strong>{currentUser.first_name} {currentUser.last_name}</strong> ({currentUser.email}) | ID: #{currentUser.id}
                  </p>
                </div>
                <button onClick={fetchCurrentUser} className="btn btn-secondary">
                  <RefreshCw size={14} /> Refresh Profile
                </button>
              </div>
            </div>
          )}

          {/* EDIT USER MODAL / CARD */}
          {editingUser && (
            <div className="card" style={{ border: '2px solid var(--accent)' }}>
              <h3><Edit size={18} /> Edit User #{editingUser.id}</h3>
              <form onSubmit={handleUpdateUser} style={{ marginTop: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password (leave empty to keep unchanged)</label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary">
                    Save Changes (POST/PATCH)
                  </button>
                  <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* USERS LIST TABLE */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2><Users size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} /> Users API: List Users (GET /users)</h2>
              <button onClick={fetchUsers} className="btn btn-secondary">
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Modified At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.first_name}</td>
                      <td>{u.last_name}</td>
                      <td>{u.email}</td>
                      <td>{new Date(u.created_at).toLocaleString()}</td>
                      <td>{new Date(u.modified_at).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => startEditUser(u)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            title="Update user (PATCH/POST)"
                          >
                            <Edit size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleSoftDelete(u.id)}
                            className="btn btn-warning"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            title="Soft delete user (DELETE /users/:id/soft)"
                          >
                            <Trash2 size={14} /> Soft Del
                          </button>
                          <button
                            onClick={() => handleHardDelete(u.id)}
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            title="Hard delete user (DELETE /users/:id/hard)"
                          >
                            <Trash2 size={14} /> Hard Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
