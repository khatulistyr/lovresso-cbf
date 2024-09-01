// ItemTable.js
import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const ItemTable = ({ items, categories, onEditClick, onDeleteClick, handleAddClick }) => {

    const getCategoryName = (categoryId) => {
        const category = categories.find(category => category.category_id === categoryId);
        return category ? `${category.category_name} (ID: ${categoryId})` : `Unknown (ID: ${categoryId})`;
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
                Item Baru
            </Button>
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
                        {items.map((item) => (
                            <TableRow key={item.item_id}>
                                <TableCell>{item.item_id}</TableCell>
                                <TableCell>{item.item_name}</TableCell>
                                <TableCell>{getCategoryName(item.category_id)}</TableCell>
                                <TableCell>{item.item_description}</TableCell>
                                <TableCell>{item.item_tags}</TableCell>
                                <TableCell>{item.item_price}</TableCell>
                                <TableCell>
                                    {item.image_url ? (
                                        <img src={`${process.env.REACT_APP_API_BASE_URL}${item.image_url}`} alt={item.item_name} style={{ width: 50, height: 50 }} />
                                    ) : (
                                        'None'
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => onEditClick(item)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => onDeleteClick(item.item_id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default ItemTable;
