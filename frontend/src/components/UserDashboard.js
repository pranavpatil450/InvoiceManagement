// src/components/UserDashboard.js

import React, { useEffect, useState } from 'react';
import CreateUserForm from './CreateUserForm';
import EditUser from './EditUser';
import './css/UserDashboard.css';

function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const query = new URLSearchParams();
      query.append('page', page);
      if (filterRole) query.append('role', filterRole);
      if (searchTerm) query.append('search', searchTerm);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole, searchTerm, page]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage('✅ User deleted successfully');
      fetchUsers();
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
  };

  const handleRoleUpdated = () => {
    setEditingUser(null);
    fetchUsers();
  };

  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>

      <div className="filter-search">
        <select onChange={(e) => setFilterRole(e.target.value)} value={filterRole}>
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="UNIT_MANAGER">Unit Manager</option>
          <option value="USER">User</option>
        </select>

        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {message && <p className="msg">{message}</p>}

      <table className="user-table">
        <thead>
          <tr>
            <th>UserID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.userId}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleEditClick(u)}>Edit</button>
                <button onClick={() => handleDelete(u._id)} className="danger">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Next
        </button>
      </div>

      {/* Create + Edit */}
      <CreateUserForm onUserCreated={fetchUsers} />
      {editingUser && (
       <EditUser
  selectedUser={editingUser} // ✅ Match expected prop
  onCancel={() => setEditingUser(null)}
  onUserUpdated={handleRoleUpdated}
/>

      )}
    </div>
  );
}

export default UserDashboard;
