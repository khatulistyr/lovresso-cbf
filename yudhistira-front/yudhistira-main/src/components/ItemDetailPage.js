import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Card, CardContent, CardMedia, Grid, Box, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OrderButton from './OrderButton';

function ItemDetailPage({ item, onBack, debugMode, categoryName, orders, setOrders }) {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [categories, setCategories] = useState([]); // Added state for categories
    const [currentItem, setCurrentItem] = useState(item);

    const handleClickScroll = (id) => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleAddToOrder = (item) => {
        console.log("Clicked on Add to Order for item:", item); // Debugging log
        setOrders(prevOrders => {
            const existingOrder = prevOrders.find(order => order.item_id === item.item_id);
            if (existingOrder) {
                console.log("Item already in order, increasing quantity.");
                return prevOrders.map(order =>
                    order.item_id === item.item_id
                        ? { ...order, quantity: order.quantity + 1 }
                        : order
                );
            } else {
                console.log("Adding new item to order.");
                return [...prevOrders, { ...item, item_id: item.item_id, quantity: 1 }];
            }
        });
        console.log({orders})
    };

    const fetchRecommendations = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/recommend`, {
                item_name: currentItem.item_name
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setRecommendedItems(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setRecommendedItems([]);
        }
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
            .then(response => setCategories(response.data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []); 

    useEffect(() => {
        fetchRecommendations();
    }, [currentItem.name]);

    // not fetching from searchpage 'cause it broke man idk
    const getCategoryName = (categoryId) => {
        const category = categories.find(category => category.category_id === categoryId);
        return category ? `${category.category_name}` : `Unknown (ID: ${categoryId})`;
    };

    const handleRecommendedItemClick = (recommendedItem) => {
        setCurrentItem(recommendedItem);
        fetchRecommendations();
        handleClickScroll('currentItem'); // Scroll to the current item after a recommendation
    };

    return (
        <Box>
            <Button onClick={onBack} variant="text" color="primary" sx={{ mb: 2 }} startIcon={<ArrowBackIcon />}>
                Kembali
            </Button>
            <Card variant="outlined" sx={{ mb: 4 }} id="currentItem" >
                <CardMedia
                    component="img"
                    height="300"
                    image={`${process.env.REACT_APP_API_BASE_URL}${currentItem.image_url}`} // Main image
                    alt={currentItem.item_name}
                />
                <CardContent>
                    <Typography variant="h4">{currentItem.item_name} <Chip label={getCategoryName(item.category_id)} variant="outlined" /></Typography>
                    <Typography variant="h5" sx={{ mb: 1 }}>Rp. {currentItem.item_price}</Typography>
                    {/* <Typography variant="body2"><strong>Description:</strong> {item.item_description}</Typography> */}
                    <Typography variant="body2">{currentItem.item_description}</Typography>
                    {debugMode && (
                        <>
                            <Typography variant="body2"><strong>Tags:</strong> {currentItem.item_tags}</Typography>
                            <Typography variant="body2"><strong>Tipe Search:</strong> {currentItem.score_type !== undefined ? currentItem.score_type : 'N/A'}</Typography>
                            {currentItem.score !== 0 && (<Typography variant="body2"><strong>Skor TF-IDF:</strong> {currentItem.score !== undefined ? currentItem.score.toFixed(6) : 'N/A'}</Typography>)}
                        </>
                    )}
                    <OrderButton item={currentItem} onAddToOrder={() => handleAddToOrder(currentItem)} />
                </CardContent>
            </Card>

            <Typography variant="h5" gutterBottom>
                Rekomendasi
            </Typography>
            <Grid container spacing={3}>
                {recommendedItems.map((recommendedItem, index) => (
                    <Grid item xs={12} sm={6} key={recommendedItem.id}>
                        <Card variant='outlined' onClick={() => handleRecommendedItemClick(recommendedItem)} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} style={{transition: 'all 0.2s ease-in-out'}}>
                            <CardMedia
                                component="img"
                                height="140"
                                image={`${process.env.REACT_APP_API_BASE_URL}${recommendedItem.image_url}`} // Thumbnail image for recommended item
                                alt={recommendedItem.item_name}
                            />
                            <CardContent>
                                <Typography variant="h4">{recommendedItem.item_name} <Chip label={getCategoryName(recommendedItem.category_id)} variant="outlined" /></Typography>
                                <Typography variant="h5" sx={{ mb: 1 }}>Rp. {recommendedItem.item_price}</Typography>
                                {/* <Typography variant="body2"><strong>Description:</strong> {item.item_description}</Typography> */}
                                <Typography variant="body2">{recommendedItem.item_description}</Typography>
                                {debugMode && (
                                    <>
                                        <Typography variant="body2"><strong>Tags:</strong> {recommendedItem.item_tags}</Typography>
                                        <Typography variant="body2"><strong>Tipe Search:</strong> {recommendedItem.score_type !== undefined ? recommendedItem.score_type : 'N/A'}</Typography>
                                        {recommendedItem.score !== 0 && (<Typography variant="body2"><strong>Skor TF-IDF:</strong> {recommendedItem.score !== undefined ? recommendedItem.score.toFixed(6) : 'N/A'}</Typography>)}
                                    </>
                                )}
                                <OrderButton item={recommendedItem} onAddToOrder={() => handleAddToOrder(recommendedItem)} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default ItemDetailPage;