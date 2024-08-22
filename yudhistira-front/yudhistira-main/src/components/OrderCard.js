import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Stack, Button, Container, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

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

    const handleRemoveItem = (itemId) => {
        setOrders(prevOrders => prevOrders.filter(order => order.item_id !== itemId));
    };

    const getSubTotalPrice = () => {
        return Math.ceil(orders.reduce((total, order) => total + order.item_price * order.quantity, 0) / 100) * 100;
    };
    
    const getTotalPrice = () => {
        return Math.ceil(orders.reduce((total, order) => (total + order.item_price * order.quantity) * 1.1, 0) / 100) * 100;
    };    

    const handleProceed = () => {
        if (orders.length > 0) {
            // Navigate to the payment route with the current orders
            navigate('/payment');
        }
    };

    return (
        <Card variant="outlined">
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
                                <Typography variant="body1">{order.quantity}</Typography>
                                <IconButton onClick={() => handleIncreaseQuantity(order.item_id)}>
                                    <AddIcon />
                                </IconButton>
                                <IconButton onClick={() => handleRemoveItem(order.item_id)}>
                                    <CloseIcon />
                                </IconButton>
                            </Stack>
                        ))}
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
