import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
// import SearchPage from './SearchPage';
import ItemDetailPage from './components/ItemDetailPage';
import AdminPanel from './components/AdminPanel';
import MainPage from './MainPage';
import PaymentForm from './components/PaymentForm';
// import TestPage from './TestPage';
// import { useAuth } from './useAuth'; // Custom hook for authentication

function App() {
    return (
        <Router>
            <Container
                style={{
                    margin: '0',
                    backgroundColor: 'white',
                    minHeight: '100vh',
                    minWidth: '100vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.5s ease-in', // Smooth transition
                }}
            >
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    {/* <Route path="/search" element={<SearchPage />} /> */}
                    <Route path="/item/:id" element={<ItemDetailPage />} />
                    <Route path="/payment" element={<PaymentForm />} />
                    {/* <Route path="/test" element={<TestPage />} /> */}
                    {/* <Route path="/login" element={<LoginPage />} /> */}
                    {/* <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} /> */}
                    <Route path="/admin" element={<AdminPanel />}/>
                </Routes>
            </Container>
        </Router>
    );
}

export default App;
