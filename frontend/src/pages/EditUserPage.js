// src/pages/EditUserPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/EditUserPage.css'


function EditUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setUser(data);
        setRole(data.role);
      } catch (err) {
        setMessage(`❌ ${err.message}`);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMessage('✅ Role updated!');
      setTimeout(() => navigate('/users'), 1000); // redirect to dashboard
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="edit-user-page">
      <h2>Edit User Role</h2>

      <form onSubmit={handleUpdate}>
        <input type="text" value={user.name} disabled />
        <input type="email" value={user.email} disabled />

        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">-- Select Role --</option>
          <option value="ADMIN">ADMIN</option>
          <option value="UNIT_MANAGER">UNIT MANAGER</option>
          <option value="USER">USER</option>
        </select>

        <button type="submit">Update Role</button>
        <button type="button" onClick={() => navigate('/users')} style={{ marginLeft: '10px' }}>
          Cancel
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default EditUserPage;
