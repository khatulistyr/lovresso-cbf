import React, { useState } from 'react';
import axios from 'axios';
import { Stack, Button, Input, Typography } from '@mui/material';

const PaymentDebug = () => {
  const [orderID, setOrderID] = useState('');
  const [grossAmount, setGrossAmount] = useState('');
  const [qrisUrl, setQrisUrl] = useState('');

  const handlePayment = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/transaction`, {
        order_id: orderID,
        gross_amount: grossAmount,
      });

      // Handle Midtrans response
      console.log(response.data);

      // if (response.data.qris_url) {
      //   // Set the QRIS URL for the user to scan
      //   setQrisUrl(response.data.qris_url);
      // } else {
      //   alert('Payment failed: ' + JSON.stringify(response.data));
      // }
    } catch (error) {
      console.error('Payment Error:', error);
      alert('Payment failed: ' + error.message);
    }
  };

  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h4">Midtrans Payment Gateway (Sandbox)</Typography>
      <Input
        type="text"
        placeholder="Order ID"
        value={orderID}
        onChange={(e) => setOrderID(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Amount"
        value={grossAmount}
        onChange={(e) => setGrossAmount(e.target.value)}
      />
      <Button variant="contained" onClick={handlePayment}>
        Bayar
      </Button>

      {qrisUrl && (
        <div>
          <Typography variant="h6">Scan the QR Code below to pay:</Typography>
          <img src={qrisUrl} alt="QRIS QR Code" />
        </div>
      )}
    </Stack>
  );
};

export default PaymentDebug;
