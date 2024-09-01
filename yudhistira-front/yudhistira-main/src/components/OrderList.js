import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`, { status: newStatus });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/orders/${orderId}`);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Customer Name</TableCell>
            <TableCell>Total Price</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.order_id}>
              <TableCell>{order.order_id}</TableCell>
              {/* <TableCell>{order.customer_name}</TableCell> */}
              <TableCell>{order.total_price}</TableCell>
              {/* <TableCell>{order.status}</TableCell> */}
              {/* <TableCell>
                <Button onClick={() => handleUpdateStatus(order.order_id, 'Completed')}>Mark as Completed</Button>
                <Button onClick={() => handleDeleteOrder(order.order_id)} color="secondary">Delete</Button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default OrderList;
