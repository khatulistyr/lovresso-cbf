import React, { useState, useEffect } from 'react';
import {
    Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
    IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import ItemDialog from './ItemDialog';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]); // Added state for categories
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
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
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`).then(response => setCategories(response.data)); // Fetch categories
        }
    }, [isAuthenticated]);

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
            setItems(items.filter(item => item.id !== id));
        });
    };

    const handleSave = (item) => {
        if (item.id) {
            axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/items/${item.id}`, item).then(() => {
                setItems(items.map(i => (i.id === item.id ? item : i)));
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

    const getCategoryName = (categoryId) => {
        const category = categories.find(category => category.category_id === categoryId);
        return category ? category.category_name : `Unknown (ID: ${categoryId})`;
    };

    const filteredItems = items.filter(item => 
        item.item_name && item.item_name.toLowerCase().includes(search.toLowerCase())
    );
    
    return (
        <Container>
            {isAuthenticated ? (
                <div>
                    <div style={{ marginBottom: 20 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setIsAuthenticated(false)}
                            style={{ marginRight: 20 }}
                        >
                            Logout
                        </Button>
                        <TextField
                            label="Search"
                            variant="outlined"
                            value={search}
                            onChange={handleSearchChange}
                            style={{ marginRight: 20 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={handleAddClick}
                        >
                            Add Item
                        </Button>
                    </div>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Tags</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Image</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredItems.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.item_id}</TableCell>
                                        <TableCell>{item.item_name}</TableCell>
                                        <TableCell>{getCategoryName(item.category_id)}</TableCell> {/* Display category name */}
                                        <TableCell>{item.item_description}</TableCell>
                                        <TableCell>{item.item_tags}</TableCell>
                                        <TableCell>{item.item_price}</TableCell>
                                        <TableCell>
                                        {item.image_url ? (
                                            <img src={`${process.env.REACT_APP_API_BASE_URL}${item.image_url}`} alt={item.item_name} style={{ width: 50, height: 50 }} />
                                        ) : (
                                            '-'
                                        )}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEditClick(item)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(item.item_id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <ItemDialog
                        open={openDialog}
                        item={currentItem}
                        onClose={() => setOpenDialog(false)}
                        onSave={handleSave}
                        categories={categories} // Pass categories to ItemDialog
                    />
                </div>
            ) : (
                <Typography variant="h6">Please log in to access the admin panel.</Typography>
            )}
        </Container>
    );
};

export default AdminPanel;
