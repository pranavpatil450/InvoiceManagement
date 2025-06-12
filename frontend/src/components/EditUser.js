// src/components/EditUser.js

import React, { useState, useEffect } from 'react';
import './css/EditUser.css';

function EditUser({ selectedUser, onUserUpdated, onCancel }) {
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (selectedUser) {
      setRole(selectedUser.role);
    }
  }, [selectedUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to update user');

      setMessage('✅ User role updated successfully');
      onUserUpdated(); // Refresh the user list
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  if (!selectedUser) return null;

  return (
    <form className="edit-user-form" onSubmit={handleUpdate}>
      <h3>Edit User Role</h3>

      <input
        type="text"
        value={selectedUser.name}
        disabled
        placeholder="User Name"
      />

      <input
        type="email"
        value={selectedUser.email}
        disabled
        placeholder="Email"
      />

      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="">-- Select Role --</option>
        <option value="ADMIN">ADMIN</option>
        <option value="UNIT MANAGER">UNIT MANAGER</option>
        <option value="USER">USER</option>
      </select>

      <button type="submit">Update Role</button>
      <button type="button" onClick={onCancel} style={{ marginTop: '10px', backgroundColor: '#b71c1c' }}>
        Cancel
      </button>

      {message && <p className="msg">{message}</p>}
    </form>
  );
}

export default EditUser;
