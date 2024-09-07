import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import axios from 'axios';

function PaymentForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const paymentResponse = location.state?.paymentResponse;

    const [transactionStatus, setTransactionStatus] = useState(paymentResponse?.transaction_status || 'pending');
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (paymentResponse) {
            const qrCodeAction = paymentResponse.actions.find(action => action.name === 'generate-qr-code');
            if (qrCodeAction) {
                setQrCodeUrl(qrCodeAction.url);
            }
        }
    }, [paymentResponse]);

    useEffect(() => {
        // Polling every 5 seconds
        const interval = setInterval(() => {
            if (paymentResponse?.order_id) {
                axios
                    .get(`${process.env.REACT_APP_API_BASE_URL}/api/transaction/status/${paymentResponse.order_id}`)
                    .then((res) => {
                        setTransactionStatus(res.data.transaction_status || 'pending');
                    })
                    .catch((err) => {
                        console.error('Error fetching transaction status:', err);
                    });
            }
        }, 5000);

        // Clean up the interval when the component unmounts
        return () => clearInterval(interval);
    }, [paymentResponse]);

    const handleRegenerateQR = () => {
        const qrCodeAction = paymentResponse.actions.find(action => action.name === 'generate-qr-code');
        if (qrCodeAction) {
            setQrCodeUrl(qrCodeAction.url);
        }
    };

    const handleDeeplinkRedirect = (url) => {
        window.open(url, "_blank");
    };

    if (!paymentResponse) {
        return <Typography variant="h6">Payment details are not available.</Typography>;
    }

    const { gross_amount, expiry_time } = paymentResponse;

    // Define status styles
    const getStatusStyle = () => {
        if (transactionStatus === 'pending') {
            return { color: '#D5A420', fontWeight: 'bold' };
        } else if (transactionStatus === 'settlement') {
            return { color: 'darkgreen', fontWeight: 'bold' };
        } else {
            return { color: 'black', fontWeight: 'normal' };
        }
    };

    const getDisplayStatus = () => {
        if (transactionStatus === 'pending') {
            return 'Pending';
        } else if (transactionStatus === 'settlement') {
            return 'Terbayar';
        } else {
            return transactionStatus || 'N/A';
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxHeight: '60vh',
                minHeight: '80vh',
                paddingY: 0,
                paddingX: 0,
                boxSizing: 'border-box',
                margin: 0,
            }}
        >
            <Typography variant="h5" align="center" gutterBottom>
                Status: <span style={getStatusStyle()}><strong>{getDisplayStatus()}</strong></span>
            </Typography>
            <Typography variant="h6" align="center" gutterBottom>
                Jumlah: <strong>Rp. {gross_amount || 'N/A'}</strong>
            </Typography>
            <Typography variant="body1" align="center" gutterBottom>
                Batal otomatis pada: <strong>{expiry_time || 'N/A'}</strong>
            </Typography>

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginY: 2,
                }}
            >
                {qrCodeUrl && (
                    <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        style={{
                            maxWidth: '60%',
                            maxHeight: '60%',
                            objectFit: 'contain',
                        }}
                    />
                )}
            </Box>

            <Box sx={{ textAlign: 'center', marginTop: 0 }}>
                <Button
                    variant="contained"
                    onClick={handleRegenerateQR}
                    sx={{ margin: 1 }}
                    startIcon={<RefreshIcon />}
                >
                    Refresh QR
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => handleDeeplinkRedirect(paymentResponse.actions.find(action => action.name === 'deeplink-redirect').url)}
                    sx={{ margin: 1 }}
                    startIcon={<AccountBalanceWalletIcon />}
                >
                    Bayar pada aplikasi
                </Button>
            </Box>
        </Container>
    );
}

export default PaymentForm;
