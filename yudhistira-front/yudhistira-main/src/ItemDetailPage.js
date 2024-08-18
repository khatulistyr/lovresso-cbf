import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Typography, Card, CardContent, CardMedia, Grid, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ItemDetailPage({ item, onBack, debugMode }) {
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [currentItem, setCurrentItem] = useState(item);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/recommend`, {
                    item_name: currentItem.name
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

        fetchRecommendations();
    }, [currentItem.name]);

    const handleRecommendedItemClick = (recommendedItem) => {
        setCurrentItem(recommendedItem);
    };

    return (
        <Box>
            <Button onClick={onBack} variant="text" color="primary" sx={{ mb: 2 }} startIcon={<ArrowBackIcon />}>
                Kembali
            </Button>
            <Card variant="outlined" sx={{ mb: 4 }}>
                <CardMedia
                    component="img"
                    height="300"
                    image={currentItem.image_url} // Main image
                    alt={currentItem.name}
                />
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        {currentItem.name}
                    </Typography>
                    <Typography variant="body2"><strong>Category:</strong> {currentItem.category}</Typography>
                    <Typography variant="body2"><strong>Description:</strong> {currentItem.description}</Typography>
                    {/* Conditionally render Tags and Similarity Score based on Debug Mode */}
                    {debugMode && (
                        <>
                            <Typography variant="body2"><strong>Tags:</strong> {currentItem.tags}</Typography>
                            <Typography variant="body2"><strong>Similarity Score:</strong> {currentItem.score !== undefined ? currentItem.score.toFixed(4) : 'N/A'}</Typography>
                        </>
                    )}
                </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
                Recommended Items:
            </Typography>
            <Grid container spacing={3}>
                {recommendedItems.map((recommendedItem, index) => (
                    <Grid item xs={12} sm={6} key={recommendedItem.id}>
                        <Card variant='outlined' onClick={() => handleRecommendedItemClick(recommendedItem)}>
                            <CardMedia
                                component="img"
                                height="140"
                                image={recommendedItem.image_url} // Thumbnail image for recommended item
                                alt={recommendedItem.name}
                            />
                            <CardContent>
                                <Typography variant="h6">{recommendedItem.name}</Typography>
                                <Typography variant="body2"><strong>Category:</strong> {recommendedItem.category}</Typography>
                                <Typography variant="body2"><strong>Description:</strong> {recommendedItem.description}</Typography>
                                <Typography variant="body2"><strong>Price:</strong> {recommendedItem.price}</Typography>
                                {/* Conditionally render Tags and Similarity Score based on Debug Mode */}
                                {debugMode && (
                                    <>
                                        <Typography variant="body2"><strong>Tags:</strong> {recommendedItem.tags}</Typography>
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