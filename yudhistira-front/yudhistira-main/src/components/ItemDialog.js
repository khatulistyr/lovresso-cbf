import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel } from '@mui/material';

const ItemDialog = ({ open, item, onClose, onSave, categories }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategoryId(item.category_id || '');
      setPrice(item.price || '');
      setDescription(item.description || '');
      setTags(item.tags || '');
      setImageUrl(item.image_url || '');
    } else {
      setName('');
      setCategoryId('');
      setPrice('');
      setDescription('');
      setTags('');
      setImageUrl('');
    }
  }, [item, open]);

  const handleSave = () => {
    const newItem = {
      name,
      category_id: categoryId,
      price: parseFloat(price),
      description,
      tags,
      image_url: imageUrl,
    };
    onSave(item ? { ...item, ...newItem } : newItem);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <InputLabel id="category-label">Category</InputLabel>
        <Select
          labelId="category-label"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          fullWidth
          margin="dense"
        >
          {categories.map(category => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </Select>
        <TextField
          margin="dense"
          label="Price"
          type="number"
          fullWidth
          variant="outlined"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          multiline
          rows={4}
          fullWidth
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Tags"
          rows={4}
          fullWidth
          variant="outlined"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Image URL"
          fullWidth
          variant="outlined"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemDialog;
