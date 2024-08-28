import React from 'react';
import { Button } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

function MenuButton({ onOpenMenu }) {
    return (
        <Button variant="contained" color="primary" onClick={onOpenMenu} startIcon={<RestaurantMenuIcon/>} size='large'>
            Menu
        </Button>
    );
}

export default MenuButton;
