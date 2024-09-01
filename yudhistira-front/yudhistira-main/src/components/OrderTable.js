import React, { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography
} from '@mui/material';
import axios from 'axios';

const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [items, setItems] = useState({}); // State to hold item details

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/orders`);
                const ordersData = response.data;
                
                // Sort orders by date (latest first)
                const sortedOrders = ordersData.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
                setOrders(sortedOrders);
                
                const itemIds = ordersData.flatMap(order => order.items.map(item => item.item_id));
                
                // Fetch items details
                const itemsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/items`, {
                    params: { item_ids: itemIds.join(',') }
                });
                const itemsData = itemsResponse.data;
                const itemsMap = itemsData.reduce((acc, item) => {
                    acc[item.item_id] = item.item_name;
                    return acc;
                }, {});
                setItems(itemsMap);
                
            } catch (error) {
                console.error("Error fetching orders or items:", error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Total Price</TableCell>
                        <TableCell>Items</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {orders.map(order => (
                        <TableRow key={order.order_id}>
                            <TableCell>{order.order_id}</TableCell>
                            <TableCell>{order.order_date}</TableCell>
                            <TableCell>{order.total_price}</TableCell>
                            <TableCell>
                                {order.items.length > 0 ? (
                                    order.items.map(item => (
                                        <Typography variant="body1" key={item.item_id}>
                                            {items[item.item_id] || 'Item not found'} x{item.quantity}
                                        </Typography>
                                    ))
                                ) : (
                                    <div>No items</div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default OrderTable;
