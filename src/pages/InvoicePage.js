import React from 'react';
import { useParams } from 'react-router-dom';
import Invoice from '../pages/components/Invoice';
import { useNavigate } from 'react-router-dom';

const InvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="container">
      <button className="btn btn-outline mb-3" onClick={() => navigate(-1)}>Back</button>
      <Invoice billId={id} appointment={{}} patient={{}} amount={0} />
    </div>
  );
};

export default InvoicePage;