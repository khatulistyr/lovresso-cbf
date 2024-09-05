import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function PaymentForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const paymentResponse = location.state?.paymentResponse;

    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (paymentResponse) {
            const qrCodeAction = paymentResponse.actions.find(action => action.name === 'generate-qr-code');
            if (qrCodeAction) {
                setQrCodeUrl(qrCodeAction.url);
            }
        }
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

    const handleGetStatus = (url) => {
        window.open(url, "_blank");
    };

    const handleCancelTransaction = (url) => {
        window.open(url, "_blank");
    };

    if (!paymentResponse) {
        return <Typography variant="h6">Payment details are not available.</Typography>;
    }

    const { transaction_status, gross_amount, actions, expiry_time } = paymentResponse;

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
                Status: <strong>{transaction_status || 'N/A'}</strong>
            </Typography>
            <Typography variant="h6" align="center" gutterBottom>
                Jumlah: <strong>Rp. {gross_amount || 'N/A'}</strong>
                {/* Jumlah: <strong>Rp. 20.000</strong> */}
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
                    startIcon={<RefreshIcon/>}
                >
                    Refresh QR
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => handleDeeplinkRedirect(paymentResponse.actions.find(action => action.name === 'deeplink-redirect').url)}
                    sx={{ margin: 1 }}
                    startIcon={<AccountBalanceWalletIcon/>}
                >
                    Bayar pada aplikasi
                </Button>
                {/* <Button
                    variant="contained"
                    onClick={() => handleGetStatus(paymentResponse.actions.find(action => action.name === 'get-status').url)}
                    sx={{ margin: 1 }}
                >
                    Get Status
                </Button> */}
                {/* <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancelTransaction(paymentResponse.actions.find(action => action.name === 'cancel').url)}
                    sx={{ margin: 1 }}
                >
                    Cancel
                </Button> */}
            </Box>

            {/* <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                <Button variant="contained" color="secondary" onClick={() => navigate('/')}>
                    Kembali
                </Button>
            </Box> */}
        </Container>
    );
}

export default PaymentForm;
