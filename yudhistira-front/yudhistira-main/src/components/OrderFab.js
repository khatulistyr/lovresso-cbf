// OrderFab.js
import React, { useState } from 'react';
import { Fab, Card, CardContent, Typography, IconButton, Box, Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

function OrderFab({ orders, onProceedToPayment }) {
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    // const history = useHistory();

    const handleFabClick = () => {
        setExpanded(!expanded);
    };

    const calculateSubtotal = () => {
        return orders.reduce((total, order) => total + (order.item_price * order.count), 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        return subtotal + subtotal * 0.11;
    };

    const handleProceedToPayment = () => {
        onProceedToPayment();
        // history.push('/payment');
        navigate('/payment');
    };

    return (
        <Box position="fixed" bottom={16} right={16}>
            <Fab color="primary" onClick={handleFabClick}>
                <ShoppingCartIcon />
            </Fab>
            {expanded && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Your Order</Typography>
                            <IconButton onClick={handleFabClick}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        {orders.map((order, index) => (
                            <Box key={index} mb={2}>
                                <Typography>{order.item_name} x{order.count}</Typography>
                                <Typography>Price: Rp. {order.item_price * order.count}</Typography>
                            </Box>
                        ))}
                        <Typography variant="h6">Subtotal: Rp. {calculateSubtotal()}</Typography>
                        <Typography variant="h6">Total (after 11% tax): Rp. {calculateTotal()}</Typography>
                        <Button variant="contained" color="primary" fullWidth onClick={handleProceedToPayment}>
                            Proceed to Payment
                        </Button>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default OrderFab;
