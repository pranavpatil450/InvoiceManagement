import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditInvoicePage() {
  const { financialYear, invoiceNumber } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `http://localhost:4000/api/invoices?financialYear=${financialYear}&invoiceNumber=${invoiceNumber}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (data.invoices?.length) {
          setInvoice(data.invoices[0]);
        } else {
          setMessage('Invoice not found');
        }
      } catch (err) {
        setMessage('Error fetching invoice');
      }
    };

    fetchInvoice();
  }, [financialYear, invoiceNumber]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:4000/api/invoices/${invoiceNumber}/${financialYear}`, // keep using original route
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceDate: invoice.invoiceDate,
            invoiceAmount: invoice.invoiceAmount,
            newFinancialYear: invoice.financialYear, // updated financial year
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert('Invoice updated successfully');
      navigate('/invoices');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  if (!invoice) return <p>{message || 'Loading...'}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Invoice #{invoice.invoiceNumber}</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Invoice Number: </label>
          <input type="number" value={invoice.invoiceNumber} disabled />
        </div>

        <div>
  <label>Financial Year: </label>
  <input
    type="text"
    value={invoice.financialYear}
    onChange={(e) => setInvoice({ ...invoice, financialYear: e.target.value })}
    required
  />
</div>


        <div>
          <label>Date: </label>
          <input
            type="date"
            value={invoice.invoiceDate.split('T')[0]}
            onChange={(e) =>
              setInvoice({ ...invoice, invoiceDate: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Amount: </label>
          <input
            type="number"
            value={invoice.invoiceAmount}
            onChange={(e) =>
              setInvoice({ ...invoice, invoiceAmount: e.target.value })
            }
            required
          />
        </div>

        <button type="submit">Update</button>
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          style={{ marginLeft: '10px' }}
        >
          Go Back
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EditInvoicePage;
