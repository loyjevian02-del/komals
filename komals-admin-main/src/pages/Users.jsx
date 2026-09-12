import { useState, useEffect } from 'react';
import { api, getUser } from '../lib/api.js';
import {
  UserPlus,
  Shield,
  Package,
  Edit3,
  Trash2,
  X,
  Eye,
  EyeOff,
  Users as UsersIcon,
  MessageSquare,
} from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formRole, setFormRole] = useState('PRODUCT_MANAGER');
  const [formActive, setFormActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const currentUser = getUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setModalMode('create');
    setSelectedUser(null);
    setFormUsername('');
    setFormPassword('');
    setShowPassword(false);
    setFormRole('PRODUCT_MANAGER');
    setFormActive(true);
    setFormError('');
    setShowModal(true);
  }

  function openEditModal(user) {
    setModalMode('edit');
    setSelectedUser(user);
    setFormUsername(user.username);
    setFormPassword('');
    setShowPassword(false);
    setFormRole(user.role || 'PRODUCT_MANAGER');
    setFormActive(user.active ?? true);
    setFormError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (modalMode === 'create') {
        await api.post('/admin/users', {
          username: formUsername.trim(),
          password: formPassword,
          role: formRole,
          active: formActive,
        });
      } else {
        const payload = {
          role: formRole,
          active: formActive,
        };
        if (formPassword.trim()) {
          payload.password = formPassword.trim();
        }
        await api.put(`/admin/users/${selectedUser.id}`, payload);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(user) {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  }

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const pmCount = users.filter((u) => u.role === 'PRODUCT_MANAGER').length;

  return (
    <div style={{ width: '100%' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.4px', color: 'var(--on-surface)' }}>
              User & Staff Management
            </h1>
          </div>
          <p style={{ margin: 0, color: 'var(--on-surface-variant)', fontSize: 13.5 }}>
            Manage staff login credentials and control access to store products and settings.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openCreateModal}
          style={{
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(211, 31, 38, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <UserPlus size={17} />
          Add User
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 24
      }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--surface-container-high)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <UsersIcon size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Total Accounts</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{totalUsers}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(124, 58, 237, 0.1)',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Administrators</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{adminCount}</div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(2, 132, 199, 0.1)',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', fontWeight: 500 }}>Product Managers</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface)' }}>{pmCount}</div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'var(--error-container)',
          color: 'var(--on-error-container)',
          padding: '12px 16px',
          borderRadius: 12,
          marginBottom: 20,
          fontSize: 13.5,
          fontWeight: 500
        }}>
          {error}
        </div>
      )}

      {/* Main Table */}
      <div className="table-scroll" style={{ boxShadow: 'var(--shadow-md)', background: '#fff' }}>
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th style={{ padding: '14px 18px', width: '28%' }}>Username</th>
              <th style={{ padding: '14px 18px', width: '30%' }}>Access & Permissions</th>
              <th style={{ padding: '14px 18px', width: '18%' }}>Status</th>
              <th style={{ padding: '14px 18px', width: '12%' }}>Created</th>
              <th style={{ padding: '14px 18px', width: '12%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  Loading staff accounts…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '40px 18px', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  No users found. Click &quot;Add User&quot; to create your first user.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = currentUser?.username === u.username;
                const isAdminRole = u.role === 'ADMIN';

                return (
                  <tr key={u.id} style={{ transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: isAdminRole
                            ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                            : u.role === 'WHATSAPP_MANAGER'
                            ? 'linear-gradient(135deg, #15803d, #22c55e)'
                            : 'linear-gradient(135deg, #0284c7, #38bdf8)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 650, fontSize: 14, color: 'var(--on-surface)' }}>
                              {u.username}
                            </span>
                            {isSelf && (
                              <span style={{
                                fontSize: 10.5,
                                fontWeight: 600,
                                background: 'var(--primary)',
                                color: '#ffffff',
                                padding: '1px 6px',
                                borderRadius: 999,
                                letterSpacing: '0.2px'
                              }}>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {isAdminRole ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          background: 'rgba(124, 58, 237, 0.09)',
                          color: '#6d28d9',
                          border: '1px solid rgba(124, 58, 237, 0.2)',
                          padding: '4px 10px',
                          borderRadius: 8,
                        }}>
                          <Shield size={14} />
                          <span>Full Admin Access</span>
                        </div>
                      ) : u.role === 'WHATSAPP_MANAGER' ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          background: 'rgba(22, 163, 74, 0.09)',
                          color: '#15803d',
                          border: '1px solid rgba(22, 163, 74, 0.2)',
                          padding: '4px 10px',
                          borderRadius: 8,
                        }}>
                          <MessageSquare size={14} />
                          <span>WhatsApp CRM Only</span>
                        </div>
                      ) : (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12.5,
                          fontWeight: 600,
                          background: 'rgba(2, 132, 199, 0.09)',
                          color: '#0369a1',
                          border: '1px solid rgba(2, 132, 199, 0.2)',
                          padding: '4px 10px',
                          borderRadius: 8,
                        }}>
                          <Package size={14} />
                          <span>Manage Products Only</span>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {u.active ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          color: '#15803d',
                          background: 'rgba(22, 163, 74, 0.1)',
                          border: '1px solid rgba(22, 163, 74, 0.2)',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 999
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                          Active
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          color: '#b91c1c',
                          background: 'rgba(220, 38, 38, 0.1)',
                          border: '1px solid rgba(220, 38, 38, 0.2)',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 999
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />
                          Disabled
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', color: 'var(--on-surface-variant)', fontSize: 13 }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '—'}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Edit User & Permissions"
                          style={{
                            border: '1px solid var(--outline-variant)',
                            background: 'var(--surface-container-low)',
                            color: 'var(--on-surface)',
                            borderRadius: 8,
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--surface-container-high)';
                            e.currentTarget.style.borderColor = 'var(--primary)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'var(--surface-container-low)';
                            e.currentTarget.style.borderColor = 'var(--outline-variant)';
                          }}
                        >
                          <Edit3 size={15} />
                        </button>

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => handleDelete(u)}
                            title="Delete User"
                            style={{
                              border: '1px solid rgba(220, 38, 38, 0.2)',
                              background: 'rgba(220, 38, 38, 0.05)',
                              color: '#dc2626',
                              borderRadius: 8,
                              padding: '6px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#dc2626';
                              e.currentTarget.style.color = '#ffffff';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(18, 48, 48, 0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            width: 480,
            maxWidth: '100%',
            boxShadow: '0 24px 48px -12px rgba(18, 48, 48, 0.35)',
            border: '1px solid rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1ece1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#fdfbf7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: modalMode === 'create' ? 'rgba(211, 31, 38, 0.1)' : 'rgba(21, 74, 74, 0.1)',
                  color: modalMode === 'create' ? 'var(--primary)' : 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {modalMode === 'create' ? <UserPlus size={20} /> : <Edit3 size={20} />}
                </div>
                <div>
                  <h2 style={{ fontSize: 17, margin: 0, fontWeight: 700, color: 'var(--on-surface)' }}>
                    {modalMode === 'create' ? 'Add New User' : `Edit User: ${selectedUser?.username}`}
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: 12.5, color: 'var(--on-surface-variant)' }}>
                    {modalMode === 'create' ? 'Set up login credentials & permissions' : 'Update access permissions or change password'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--on-surface-variant)',
                  cursor: 'pointer',
                  padding: 6,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              {modalMode === 'create' && (
                <div className="field" style={{ marginBottom: 18 }}>
                  <label htmlFor="formUsername" style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                    Username
                  </label>
                  <input
                    id="formUsername"
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="e.g. staff_user"
                    required
                    autoFocus
                    style={{
                      border: '1.5px solid #d7c9a3',
                      borderRadius: 10,
                      padding: '10px 14px',
                      fontSize: 14,
                      outline: 'none',
                      background: '#ffffff',
                      color: 'var(--on-surface)'
                    }}
                  />
                </div>
              )}

              {/* Password field with toggle */}
              <div className="field" style={{ marginBottom: 18 }}>
                <label htmlFor="formPassword" style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                  {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="formPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder={modalMode === 'create' ? '••••••••' : '••••••••'}
                    required={modalMode === 'create'}
                    style={{
                      width: '100%',
                      border: '1.5px solid #d7c9a3',
                      borderRadius: 10,
                      padding: '10px 42px 10px 14px',
                      fontSize: 14,
                      outline: 'none',
                      background: '#ffffff',
                      color: 'var(--on-surface)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--on-surface-variant)',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Dropdown for Permissions & Role */}
              <div className="field" style={{ marginBottom: 20 }}>
                <label htmlFor="formRole" style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)' }}>
                  Permissions & Role
                </label>
                <select
                  id="formRole"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  style={{
                    width: '100%',
                    border: '1.5px solid #d7c9a3',
                    borderRadius: 10,
                    padding: '10px 14px',
                    fontSize: 14,
                    outline: 'none',
                    background: '#ffffff',
                    color: 'var(--on-surface)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ADMIN">Full Administrator (All Access)</option>
                  <option value="PRODUCT_MANAGER">Manage Products Only (Add/Edit Products, Images, ZIP)</option>
                  <option value="WHATSAPP_MANAGER">WhatsApp CRM Manager (Live Inbox, Broadcasts, Contacts & Deals)</option>
                </select>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                  {formRole === 'PRODUCT_MANAGER'
                    ? 'User has access only to Products, inventory, and catalog management.'
                    : formRole === 'WHATSAPP_MANAGER'
                    ? 'User has access only to WhatsApp Live Inbox, Broadcast Campaigns, Customer Contacts, and Sales Pipelines.'
                    : 'User has full unrestricted access to all store and admin features.'}
                </p>
              </div>

              {/* Account Active Checkbox (Clean Left Aligned) */}
              <div style={{
                background: '#f8f5ee',
                borderRadius: 12,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                cursor: 'pointer'
              }} onClick={() => setFormActive(!formActive)}>
                <input
                  id="formActive"
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="formActive" style={{ margin: 0, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: 'var(--on-surface)' }}>
                  Account Active (Allow Login)
                </label>
              </div>

              {formError && (
                <div style={{
                  background: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  marginBottom: 16
                }}>
                  {formError}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={formSubmitting}
                  style={{ borderRadius: 10, padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formSubmitting}
                  style={{
                    borderRadius: 10,
                    padding: '9px 22px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(211, 31, 38, 0.2)'
                  }}
                >
                  {formSubmitting ? 'Saving…' : (modalMode === 'create' ? 'Create User' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
