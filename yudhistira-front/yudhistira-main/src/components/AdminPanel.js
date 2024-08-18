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
    const [search, setSearch] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem('authToken');
      if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setIsAuthenticated(true);
          // Optionally, you can fetch items here if not done elsewhere
      }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/items`).then(response => setItems(response.data));
        }
    }, [isAuthenticated]);

    const handleLogin = async () => {
      try {
          const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, { username, password });
          const token = response.data.token;
          localStorage.setItem('authToken', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setSuccess('Login successful');
          setError('lohkok eror');
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
          // navigate('/login');
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
            setItems(items.filter(item => item.id !== id));
        });
    };

    const handleSave = (item) => {
        if (item.id) {
            // Update existing item
            axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/items/${item.id}`, item).then(() => {
                setItems(items.map(i => (i.id === item.id ? item : i)));
                setOpenDialog(false);
            });
        } else {
            // Add new item
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
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Container>
            {!isAuthenticated ? (
                <Dialog open={!isAuthenticated && !loginDialogOpen} onClose={() => setLoginDialogOpen(false)}>
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
                        {/* <Button onClick={() => setLoginDialogOpen(true)} color="secondary">
                            Register
                        </Button> */}
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
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell>{item.description}</TableCell>
                                        <TableCell>{item.tags}</TableCell>
                                        <TableCell>{item.price}</TableCell>
                                        {/* <TableCell>{item.image_url}</TableCell> */}
                                        {/* <TableCell>{item.}</TableCell> */}
                                        <TableCell>
                                            {item.image_url && <img src={item.image_url} alt={item.name} style={{ width: 50, height: 50 }} />}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEditClick(item)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleDeleteClick(item.id)}>
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
                    />
                </div>
            )}
        </Container>
    );
};

export default AdminPanel;
