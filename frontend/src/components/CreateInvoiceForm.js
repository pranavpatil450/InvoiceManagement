// src/components/CreateInvoiceForm.js

import React, { useState } from 'react';
import './css/CreateInvoiceForm.css';

function CreateInvoiceForm({ onInvoiceCreated }) {
  const [financialYear, setFinancialYear] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
  
    if (!financialYear || !invoiceDate || !invoiceAmount) {
      setMessage('❌ All fields are required');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          financialYear,
          invoiceDate,
          invoiceAmount: Number(invoiceAmount),
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
  
      setMessage('✅ Invoice created successfully');
      setFinancialYear('');
      setInvoiceDate('');
      setInvoiceAmount('');
      onInvoiceCreated(); // Refresh the list
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };
  

  return (
    <form className="create-invoice-form" onSubmit={handleCreate}>
  <h3>Create New Invoice</h3>

  <div className="form-row">
    <input
      type="text"
      placeholder="Financial Year (e.g. 2024-25)"
      value={financialYear}
      required
      onChange={(e) => setFinancialYear(e.target.value)}
    />
    <input
      type="date"
      value={invoiceDate}
      required
      onChange={(e) => setInvoiceDate(e.target.value)}
    />
    <input
      type="number"
      placeholder="Invoice Amount"
      value={invoiceAmount}
      required
      onChange={(e) => setInvoiceAmount(e.target.value)}
    />
    <button type="submit">Create</button>
  </div>

  {message && <p className="msg">{message}</p>}
</form>

  );
}

export default CreateInvoiceForm;
