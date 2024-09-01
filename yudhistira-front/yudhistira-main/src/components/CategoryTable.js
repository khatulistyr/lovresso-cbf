import React, { useState, useEffect } from 'react';
import {
    Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, IconButton, Dialog, DialogActions, DialogContent, DialogTitle,
    TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
            .then(response => setCategories(response.data));
    }, []);

    const handleAddClick = () => {
        setCurrentCategory(null);
        setNewCategoryName('');
        setOpenDialog(true);
    };

    const handleEditClick = (category) => {
        setCurrentCategory(category);
        setNewCategoryName(category.category_name);
        setOpenDialog(true);
    };

    const handleDeleteClick = (categoryId) => {
        axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/categories/${categoryId}`)
            .then(() => setCategories(categories.filter(category => category.category_id !== categoryId)));
    };

    const handleSave = () => {
        if (currentCategory) {
            axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/categories/${currentCategory.category_id}`, { category_name: newCategoryName })
                .then(() => {
                    setCategories(categories.map(category =>
                        category.category_id === currentCategory.category_id
                            ? { ...category, category_name: newCategoryName }
                            : category
                    ));
                });
        } else {
            axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/categories`, { category_name: newCategoryName })
                .then(response => {
                    setCategories([...categories, response.data]);
                });
        }
        setOpenDialog(false);
    };

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddClick}
                style={{marginBlock: 10}}
            >
                Kategori Baru
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.category_id}>
                                <TableCell>{category.category_id}</TableCell>
                                <TableCell>{category.category_name}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEditClick(category)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(category.category_id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{currentCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Category Name"
                        fullWidth
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CategoryTable;
