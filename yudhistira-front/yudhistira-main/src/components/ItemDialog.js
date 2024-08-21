import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, InputLabel } from '@mui/material';
import axios from 'axios'; // Import axios

const ItemDialog = ({ open, item, onClose, onSave, categories }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [image, setImage] = useState(null); // State to handle image file
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.item_name || '');
      setCategoryId(item.category_id || '');
      setPrice(item.item_price || '');
      setDescription(item.item_description || '');
      setTags(item.item_tags || '');
      setImageUrl(item.image_url || '');
    } else {
      setName('');
      setCategoryId('');
      setPrice('');
      setDescription('');
      setTags('');
      setImage(null);
      setImageUrl('');
    }
  }, [item, open]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setImageUrl(response.data.file_url);
    }
  };

  const handleSave = () => {
    const newItem = {
      item_name: name,
      category_id: categoryId,
      item_price: parseFloat(price),
      item_description: description,
      item_tags: tags,
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
            <MenuItem key={category.category_id} value={category.category_id}>
              {category.category_name}
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
          fullWidth
          variant="outlined"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          accept="image/*"
          type="file"
          onChange={handleImageChange}
          style={{ marginTop: '20px', marginBottom: '20px' }}
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
