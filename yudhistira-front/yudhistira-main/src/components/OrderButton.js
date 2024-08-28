import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function OrderButton({ onAddToOrder }) {
    return (
        <Button
            variant="outlined"
            color="primary"
            onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the card's onClick
                console.log("Order Button Clicked!"); // Debugging log
                onAddToOrder();
                }
            }
            startIcon={<AddIcon />}
        >
            Tambah ke pesanan
        </Button>
        // <div style={{padding: "10px", backgroundColor: "black", color: "white"}}>Button</div>
    );
}

export default OrderButton;
