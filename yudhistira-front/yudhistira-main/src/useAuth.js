import { useState, useEffect } from 'react';
import axios from 'axios';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/auth/check', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                setIsAuthenticated(response.data.authenticated);
            } catch {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    return { isAuthenticated, loading };
};
