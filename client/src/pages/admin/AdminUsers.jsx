import { useState, useEffect } from 'react';
import { getAllUsers, toggleUserRole, deleteUser } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export default function AdminUsers({ showToast }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleRole = async (targetUser) => {
    const action = targetUser.role === 'admin' ? 'demote to customer' : 'promote to admin';
    const confirmed = window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} "${targetUser.name}"?`);
    if (!confirmed) return;

    try {
      await toggleUserRole(targetUser._id);
      showToast?.('Role updated');
      loadUsers();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not update role');
    }
  };

  const handleDelete = async (targetUser) => {
    const confirmed = window.confirm(`Delete "${targetUser.name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await deleteUser(targetUser._id);
      showToast?.('User deleted');
      loadUsers();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Could not delete user');
    }
  };

  if (loading) {
    return <p className="text-buyko-text-dim text-center py-10">Loading users...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-buyko-text">Users</h1>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 border border-red-900 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <p className="text-buyko-text-dim text-center py-10">No users yet.</p>
      ) : (
        <>
        {/* Mobile: card layout */}
        <div className="space-y-3 md:hidden">
          {users.map((u) => {
            const isSelf = u._id === currentUser?._id;
            return (
              <div key={u._id} className="border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-buyko-text font-medium">
                    {u.name} {isSelf && <span className="text-xs text-buyko-text-dim">(you)</span>}
                  </p>
                  <span className="text-xs text-buyko-text-dim capitalize flex-shrink-0">{u.role}</span>
                </div>
                <p className="text-sm text-buyko-text-dim break-all mb-1">{u.email}</p>
                <p className="text-xs text-buyko-text-dim mb-3">Joined {formatDate(u.createdAt)}</p>
                {!isSelf && (
                  <div className="flex items-center gap-4 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleToggleRole(u)}
                      className="text-orange-400 text-sm"
                    >
                      {u.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      className="text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop: table layout */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-buyko-text-dim border-b border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u._id === currentUser?._id;

                return (
                  <tr key={u._id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-buyko-text">
                      {u.name} {isSelf && <span className="text-xs text-buyko-text-dim">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-buyko-text-dim">{u.email}</td>
                    <td className="px-4 py-3 text-buyko-text-dim capitalize">{u.role}</td>
                    <td className="px-4 py-3 text-buyko-text-dim">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="text-orange-400 hover:underline text-sm mr-4"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-red-400 hover:underline text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}