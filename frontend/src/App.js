import React from 'react';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import InvoicesPage from './pages/InvoicesPage';
import EditInvoicePage from './pages/EditInvoicePage';
import UsersPage from './pages/UsersPage';


function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/invoices" element={<InvoicesPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/invoices/edit/:financialYear/:invoiceNumber" element={<EditInvoicePage />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
    </Router>
  );
}

export default App;
