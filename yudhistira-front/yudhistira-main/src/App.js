import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SearchPage from './SearchPage';
import ItemDetailPage from './ItemDetailPage';
import AdminPanel from './components/AdminPanel';
// import TestPage from './TestPage';
// import { useAuth } from './useAuth'; // Custom hook for authentication

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SearchPage />} />
                <Route path="/item/:id" element={<ItemDetailPage />} />
                {/* <Route path="/test" element={<TestPage />} /> */}
                {/* <Route path="/login" element={<LoginPage />} /> */}
                {/* <Route path="/admin" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />} /> */}
                <Route path="/admin" element={<AdminPanel />}/>
            </Routes>
        </Router>
    );
}

export default App;
