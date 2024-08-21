import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Card, CardContent, CardMedia, Grid, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ItemDetailPage({ item, onBack, debugMode, categoryName }) {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [categories, setCategories] = useState([]); // Added state for categories
    const [currentItem, setCurrentItem] = useState(item);

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
    };

    return (
        <Box>
            <Button onClick={onBack} variant="text" color="primary" sx={{ mb: 2 }} startIcon={<ArrowBackIcon />}>
                Kembali
            </Button>
            <Card variant="outlined" sx={{ mb: 4 }} >
                <CardMedia
                    component="img"
                    height="300"
                    image={`${process.env.REACT_APP_API_BASE_URL}${currentItem.image_url}`} // Main image
                    alt={currentItem.name}
                />
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {currentItem.name}
                    </Typography>
                    <Typography variant="body2"><strong>Category:</strong> {categoryName}</Typography>
                    <Typography variant="body2"><strong>Description:</strong> {currentItem.item_description}</Typography>
                    {/* Conditionally render Tags and Similarity Score based on Debug Mode */}
                    {debugMode && (
                        <>
                            <Typography variant="body2"><strong>Tags:</strong> {currentItem.item_tags}</Typography>
                            <Typography variant="body2"><strong>Similarity Score:</strong> {currentItem.score !== undefined ? currentItem.score.toFixed(4) : 'N/A'}</Typography>
                        </>
                    )}
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
                                <Typography variant="h6">{recommendedItem.item_name}</Typography>
                                <Typography variant="body2"><strong>Category:</strong> {recommendedItem.category_id}</Typography>
                                <Typography variant="body2"><strong>Description:</strong> {recommendedItem.item_description}</Typography>
                                <Typography variant="body2"><strong>Price:</strong> {recommendedItem.item_price}</Typography>
                                {/* Conditionally render Tags and Similarity Score based on Debug Mode */}
                                {debugMode && (
                                    <>
                                        <Typography variant="body2"><strong>Tags:</strong> {recommendedItem.item_tags}</Typography>
                                        <Typography variant="body2"><strong>Similarity Score:</strong> {recommendedItem.score !== undefined ? recommendedItem.score.toFixed(4) : 'N/A'}</Typography>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default ItemDetailPage;