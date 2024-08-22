import React, { useState } from 'react';
import { Container, Grid, Typography } from '@mui/material';
import SearchCard from './components/SearchCard';
import OrderCard from './components/OrderCard';

function MainPage() {
    const [orders, setOrders] = useState([]);

    return (
        <Container style={{
            margin: '0',
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/bg2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            minHeight: '100vh',
            minWidth: '100vw',
            paddingTop: '20px',
            paddingBottom: '20px',
            backgroundColor: 'black',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.5s ease-in',
            position: 'relative', // Make container relative for positioning checkbox
        }}>
            <Grid container spacing={0} direction="row">
                <Grid item xs={6} md={orders.length > 0 ? 8 : 12}>
                    {/* <Typography variant="h4" style={{ marginBottom: '20px' }}>Search</Typography> */}
                    <SearchCard orders={orders} setOrders={setOrders} />
                </Grid>
                {
                    orders.length > 0 && (
                        <Grid item xs={6} md={4}>
                            {/* <Typography variant="h4" style={{ marginBottom: '20px' }}>Pesanan</Typography> */}
                            <OrderCard orders={orders} setOrders={setOrders} />
                        </Grid>
                    )
                }
            </Grid>
        </Container>
    );
}

export default MainPage;
