// src/components/CreateUserForm.js

import React, { useState } from 'react';
import './css/CreateUserForm.css';

const CreateUserForm = ({ onUserCreated }) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!userName || !email || !role || !password) {
      setMessage('❌ All fields are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name : userName,
          email,
          role,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create user');

      setMessage('✅ User created successfully');
      setUserName('');
      setEmail('');
      setRole('USER');
      setPassword('');
      if (onUserCreated) onUserCreated(); // to refresh list if passed
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <form className="create-user-form" onSubmit={handleSubmit}>
      <h3>Create New User</h3>

      <input
        type="text"
        placeholder="User Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        required
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <select value={role} onChange={(e) => setRole(e.target.value)} required>
        <option value="USER">User</option>
        <option value="UNIT MANAGER">Unit Manager</option>
        <option value="ADMIN">Admin</option>
      </select>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Create User</button>

      {message && <p className="msg">{message}</p>}
    </form>
  );
};

export default CreateUserForm;
