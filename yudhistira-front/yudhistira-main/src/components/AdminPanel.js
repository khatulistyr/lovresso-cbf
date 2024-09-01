import React, { useState, useEffect } from 'react';
import {
    Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    Typography, Container, Tabs, Tab, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import ItemDialog from './ItemDialog';
import ItemTable from './ItemTable';
import CategoryTable from './CategoryTable';
import OrderTable from './OrderTable';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginDialogOpen, setLoginDialogOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tabIndex, setTabIndex] = useState(0); // State for managing the current tab
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/items`).then(response => setItems(response.data));
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`).then(response => setCategories(response.data));
        }
    }, [isAuthenticated]);

    const handleLogin = async () => {
        try {
            const token = "faketoken";
            localStorage.setItem('authToken', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setSuccess('Login successful');
            setIsAuthenticated(true);
            setLoginDialogOpen(false);
        } catch (err) {
            setError('Invalid credentials');
            setSuccess('');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`);
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
            setIsAuthenticated(false);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const handleAddClick = () => {
        setCurrentItem(null);
        setOpenDialog(true);
    };

    const handleEditClick = (item) => {
        setCurrentItem(item);
        setOpenDialog(true);
    };

    const handleDeleteClick = (id) => {
        axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/items/${id}`).then(() => {
            setItems(items.filter(item => item.item_id !== id));
        });
    };

    const handleSave = (item) => {
        if (item.item_id) {
            axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/items/${item.item_id}`, item).then(() => {
                setItems(items.map(i => (i.item_id === item.item_id ? item : i)));
                setOpenDialog(false);
            });
        } else {
            axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/items`, item).then(response => {
                setItems([...items, response.data]);
                setOpenDialog(false);
            });
        }
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const filteredItems = items.filter(item => 
        item.item_name && item.item_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container style={{ padding: '10px' }}>
            {!isAuthenticated ? (
                <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
                    <DialogTitle>Login</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Username"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <Typography color="error">{error}</Typography>}
                        {success && <Typography color="primary">{success}</Typography>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleLogin} color="primary">
                            Login
                        </Button>
                    </DialogActions>
                </Dialog>
            ) : (
                <div>
                    <div style={{ marginBottom: 20 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleLogout}
                            style={{ marginRight: 20 }}
                        >
                            Logout
                        </Button>
                        {/* <TextField
                            label="Search"
                            variant="outlined"
                            value={search}
                            onChange={handleSearchChange}
                            style={{ marginRight: 20 }}
                        /> */}
                    </div>
                    <Box>
                        <Tabs
                            value={tabIndex}
                            onChange={(event, newValue) => setTabIndex(newValue)}
                            variant="fullWidth"
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab label="Items" />
                            <Tab label="Categories" />
                            <Tab label="Orders" />
                        </Tabs>
                        <div role="tabpanel" hidden={tabIndex !== 0}>
                            <ItemTable
                                items={filteredItems}
                                categories={categories}
                                onEditClick={handleEditClick}
                                onDeleteClick={handleDeleteClick}
                                handleAddClick={handleAddClick}
                            />
                        </div>
                        <div role="tabpanel" hidden={tabIndex !== 1}>
                            <CategoryTable />
                        </div>
                        <div role="tabpanel" hidden={tabIndex !== 2}>
                            <OrderTable />
                        </div>
                    </Box>
                    <ItemDialog
                        open={openDialog}
                        item={currentItem}
                        onClose={() => setOpenDialog(false)}
                        onSave={handleSave}
                        categories={categories}
                    />
                </div>
            )}
        </Container>
    );
};

export default AdminPanel;
