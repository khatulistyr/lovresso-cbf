import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, Input, Stack, Button } from '@mui/material';

const PaymentForm = () => {
  const [orderID, setOrderID] = useState('');
  const [grossAmount, setGrossAmount] = useState('');

  const handlePayment = async () => {
    try {
      const response = await axios.post('/api/transaction', {
        order_id: orderID,
        gross_amount: grossAmount,
      });

      // Handle Midtrans response
      console.log(response.data);

      // Redirect to payment URL or show payment instruction
      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      }
    } catch (error) {
      console.error('Payment Error:', error);
    }
  };

  return (
    <Stack direction="column" spacing={2}>
      <Typography variant='h4'>
        Midtrans Payment Gateway (Sandbox)
      </Typography>
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
      <Button variant="contained" onClick={handlePayment}>Bayar</Button>
    </Stack>
  );
};

export default PaymentForm;
