// src/pages/UsersPage.js

import React from 'react';
import UserDashboard from '../components/UserDashboard';
import './css/UsersPage.css';

function UsersPage() {
  return (
    <div className="users-page">
      <h1>User Management</h1>
      <UserDashboard />
    </div>
  );
}

export default UsersPage;
