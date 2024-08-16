// src/components/ItemDialog.js
import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputLabel, MenuItem, Select } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import axios from 'axios';

const ItemDialog = ({ open, item, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [imageSource, setImageSource] = useState('url');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || '');
      setPrice(item.price || '');
      setDescription(item.description || '');
      setTags(item.tags || '');
      // setImageSource(item.imageSource ? 'upload' : 'url'); // Set imageSource based on whether imageUrl is provided
      setImageUrl(item.imageUrl || '');
      setImageFile(null);
    } else {
      // Reset state for new item
      setName('');
      setCategory('');
      setPrice('');
      setDescription('');
      setTags('');
      setImageSource('url');
      setImageUrl('');
      setImageFile(null);
    }
  }, [item, open]);

  const handleSave = () => {
    const newItem = {
      name,
      category,
      price: parseFloat(price),
      description,
      tags,
      imageUrl: imageSource === 'url' ? imageUrl : '',
      imageFile: imageSource === 'upload' ? imageFile : null,
    };
    onSave(item ? { ...item, ...newItem } : newItem);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFile(file);
    setImageUrl(''); // Clear URL when uploading file
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
        <TextField
          margin="dense"
          label="Category"
          fullWidth
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
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
        {/* <InputLabel>Image Source</InputLabel>
        <Select
          value={imageSource}
          onChange={(e) => setImageSource(e.target.value)}
          fullWidth
          margin="dense"
        >
          <MenuItem value="url">URL</MenuItem>
          <MenuItem value="upload">Upload</MenuItem>
        </Select>
        {imageSource === 'url' && (
          <TextField
            margin="dense"
            label="Image URL"
            fullWidth
            variant="outlined"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        )}
        {imageSource === 'upload' && (
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </Button>
        )} */}
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
