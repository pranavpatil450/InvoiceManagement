import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateInvoiceForm from '../components/CreateInvoiceForm';

import './css/InvoicesPage.css';


function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [financialYear, setFinancialYear] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const navigate = useNavigate();


  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (financialYear) params.append('financialYear', financialYear);
      if (invoiceNumber) params.append('invoiceNumber', invoiceNumber);
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/invoices?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setInvoices(data.invoices);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (invoiceNumber, financialYear) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/invoices/${invoiceNumber}/${financialYear}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      alert(data.message);
      fetchInvoices();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchInvoices();
  };

  return (
    <div className="invoices-container">
      <h2>Invoices</h2>
      {error && <p className="error">{error}</p>}

      <form className="filter-form" onSubmit={handleFilter}>
        <input
          type="text"
          placeholder="Financial Year (e.g. 2023-24)"
          value={financialYear}
          onChange={(e) => setFinancialYear(e.target.value)}
        />
        <input
          type="number"
          placeholder="Invoice Number"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button type="submit">Search/Filter</button>
      </form>

      <CreateInvoiceForm onInvoiceCreated={fetchInvoices} />
      

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Financial Year</th>
            <th>Date (mm-dd-yyyy)</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={`${invoice.invoiceNumber}-${invoice.financialYear}`}>
              <td>{invoice.invoiceNumber}</td>
              <td>{invoice.financialYear}</td>
              <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
              <td>₹{invoice.invoiceAmount}</td>
              <td>
                <button onClick={() => navigate(`/invoices/edit/${invoice.financialYear}/${invoice.invoiceNumber}`)}>
                    Edit
                </button>
                &nbsp;
                <button onClick={() => handleDelete(invoice.invoiceNumber, invoice.financialYear)}>
                    Delete
                </button>
                </td>

            </tr>
            
          ))}
          <button onClick={() => navigate(`/users`)}>Check User List</button>
        </tbody>
      </table>
    </div>
  );
}

export default InvoicesPage;
