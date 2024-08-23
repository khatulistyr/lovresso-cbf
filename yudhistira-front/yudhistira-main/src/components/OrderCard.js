import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Stack, Button, Container, Grid, Divider, Input } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OrderCard({ orders, setOrders }) {
    const navigate = useNavigate();

    const handleIncreaseQuantity = (itemId) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.item_id === itemId ? { ...order, quantity: order.quantity + 1 } : order
            )
        );
    };

    const handleDecreaseQuantity = (itemId) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.item_id === itemId && order.quantity > 1
                    ? { ...order, quantity: order.quantity - 1 }
                    : order
            )
        );
    };

    const handleQuantityChange = (itemId, newQuantity) => {
        const quantity = Math.max(1, parseInt(newQuantity, 10) || 1); // Ensure quantity is at least 1
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.item_id === itemId ? { ...order, quantity } : order
            )
        );
    };

    const handleRemoveItem = (itemId) => {
        setOrders(prevOrders => prevOrders.filter(order => order.item_id !== itemId));
    };

    const getSubTotalPrice = () => {
        return Math.ceil(orders.reduce((total, order) => total + order.item_price * order.quantity, 0) / 100) * 100;
    };
    
    const getTotalPrice = () => {
        return Math.ceil(orders.reduce((total, order) => (total + order.item_price * order.quantity) * 1.1, 0) / 100) * 100;
    };

    const handleProceed = async () => {
        if (orders.length > 0) {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/orders`, {
                    orders: orders
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log(response.data);
                // Navigate to the payment route with the current orders
                navigate('/payment');
            } catch (error) {
                console.error('Error creating order:', error);
            }
        }
    };

    return (
        <Card variant="outlined" style={{ padding: '0 10px 0 10px', maxHeight: '95vh' }}>
            <Typography variant='h5' marginTop={1} marginLeft={1}>
                Daftar Pesanan
            </Typography>
            <CardContent>
                {orders.length === 0 ? (
                    <Typography variant="body1">Belum ada item dalam daftar pesanan.</Typography>
                ) : (
                    <Container>
                        {orders.map(order => (
                            <Stack direction="row" alignItems="center" spacing={1} key={order.item_id} mb={2}>
                                <Grid item xs={6} md={8}>
                                    <Typography variant="body1" flexGrow={1}>{order.item_name}</Typography>
                                    <Typography variant="body1">Rp. {order.item_price * order.quantity}</Typography>
                                </Grid>
                                <IconButton onClick={() => handleDecreaseQuantity(order.item_id)}>
                                    <RemoveIcon />
                                </IconButton>
                                <Input
                                    value={order.quantity}
                                    onChange={(e) => handleQuantityChange(order.item_id, e.target.value)}
                                    // type="number"
                                    inputProps={{ min: 1 }}
                                    style={{ width: '40px', textAlign: 'center' }}
                                />
                                <IconButton onClick={() => handleIncreaseQuantity(order.item_id)}>
                                    <AddIcon />
                                </IconButton>
                                <IconButton onClick={() => handleRemoveItem(order.item_id)}>
                                    <CloseIcon />
                                </IconButton>
                            </Stack>
                        ))}
                        <Divider />
                        <Stack direction="column">
                            <Typography variant="body1" align="right" m={0}>Subtotal:</Typography>
                            <Typography variant="body1" align="right">
                                Rp. {getSubTotalPrice()}
                            </Typography>
                            <Typography variant="body1" align="right" mt={1}>Total (+10% fee):</Typography>
                            <Typography variant="h6" align="right">
                                <strong>Rp. {getTotalPrice()}</strong>
                            </Typography>
                        </Stack>
                        <Divider />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={handleProceed}
                            style={{ marginTop: '10px' }}
                        >
                            Bayar
                        </Button>
                    </Container>
                )}
            </CardContent>
        </Card>
    );
}

export default OrderCard;
