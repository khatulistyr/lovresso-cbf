import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Typography, Card, CardContent, CardMedia, Grid, Stack, IconButton, InputAdornment, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import ItemDetailPage from './ItemDetailPage';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { TextLoop } from 'easy-react-text-loop';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [items, setItems] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [categories, setCategories] = useState([]); 
    const [selectedItem, setSelectedItem] = useState(null);
    const [debugMode, setDebugMode] = useState(true);
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/items`)
            .then(response => setItems(response.data))
            .catch(error => console.error('Error fetching items:', error));
            
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
            .then(response => setCategories(response.data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []); 

    const handleSearch = async () => {
        try {
            setLoading(true); // Start loading
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/search`, {
                query: searchQuery
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setSearchResults(Array.isArray(response.data) ? response.data : []);
            setShowSearchResults(true);
            setSelectedItem(null);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    useEffect(() => {
        if (searchQuery) {
            setLoading(true); // Start loading as soon as typing delay begins
            
            const timeoutId = setTimeout(() => {
                handleSearch();
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setLoading(false); // Reset loading state if the query is empty
        }
    }, [searchQuery]);

    const handleItemSelect = (item) => {
        setSelectedItem(item);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(category => category.category_id === categoryId);
        return category ? `${category.category_name}` : `Unknown (ID: ${categoryId})`;
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
        setSelectedItem(null);
    };

    return (
        <Container
            style={{
                margin: '0',
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/bg2.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                minWidth: '100vw',
                paddingTop: '20px',
                paddingBottom: '20px',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.5s ease-in',
                position: 'relative', // Make container relative for positioning checkbox
            }}
        >
            {/* Debug Mode Checkbox */}
            <FormControlLabel
                control={
                    <Checkbox
                        checked={debugMode}
                        onChange={(e) => setDebugMode(e.target.checked)}
                        color="primary"
                    />
                }
                label="Lihat skor search"
                style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    // color: 'white',
                    backgroundColor: 'white', // Add a slight background for better visibility
                    borderRadius: '4px',
                    padding: '5px',
                }}
            />

            <Container maxWidth="md">
                {!showSearchResults && (
                    <div>
                        <Typography variant="h2" style={{ marginBottom: '0px', color: 'white' }}>
                            {"Tempat nyari "}
                            <TextLoop interval={5000}>
                                <span style={{ color: "gold" }}>kopi.</span>
                                <span style={{ color: "gold" }}>snack.</span>
                                <span style={{ color: "gold" }}>jodoh.</span>
                            </TextLoop>
                        </Typography>
                    </div>
                )}
                
                {!showSearchResults && (
                    <TextField
                        variant="outlined"
                        fullWidth
                        placeholder={"Cari kopi, snack, jodoh.."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        margin="normal"
                        style={{ backgroundColor: 'white', borderRadius: '4px'}}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {loading ? (
                                        <CircularProgress size={24} />
                                    ) : (
                                        <>
                                            <IconButton onClick={handleClearSearch}>
                                                <ClearIcon />
                                            </IconButton>
                                            <IconButton onClick={handleSearch}>
                                                <SearchIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
                
                {showSearchResults && (
                    <Card
                        variant='outlined'
                        style={{
                            padding: '0 10px 0 10px',
                            minHeight: showSearchResults ? '95vh' : '0vh',
                            maxHeight: '95vh',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.5s ease-out',
                        }}
                    >   
                        <Stack direction="row" spacing={2} alignItems="center" m={2} style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                placeholder={`Cari kopi, snack, jodoh..`}
                                label="Cari item"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                margin="normal"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            {loading ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <>
                                                    <IconButton onClick={handleClearSearch}>
                                                        <ClearIcon />
                                                    </IconButton>
                                                    <IconButton onClick={handleSearch}>
                                                        <SearchIcon />
                                                    </IconButton>
                                                </>
                                            )}
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <CardContent style={{ overflowY: 'auto' }}>
                            {selectedItem ? (
                                <ItemDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} debugMode={debugMode} categoryName={getCategoryName(selectedItem.category_id)}/>
                            ) : (
                                <div>
                                    {searchResults.length === 0 ? (
                                        <Typography variant="h5" align="center" color="textSecondary">
                                            Tidak ada hasil pencarian
                                        </Typography>
                                    ) : (
                                        <div>
                                            <Grid container spacing={3}>
                                                {searchResults.map((item) => (
                                                    <Grid item xs={12} sm={6} key={item.id}>
                                                        <Card onClick={() => handleItemSelect(item)} variant="outlined" style={{ transition: 'transform 0.2s ease-in-out' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                            <CardMedia
                                                                component="img"
                                                                height="140"
                                                                image={`${process.env.REACT_APP_API_BASE_URL}${item.image_url}`}
                                                                alt={item.name}
                                                            />
                                                            <CardContent>
                                                                <Typography variant="h5">{item.item_name}</Typography>
                                                                <Typography variant="h6">Rp. {item.item_price}</Typography>
                                                                <Typography variant="body2"><strong>Description:</strong> {item.item_description}</Typography>
                                                                <Typography variant="body2"><strong>Category:</strong> {getCategoryName(item.category_id)}</Typography>
                                                                {debugMode && (
                                                                    <>
                                                                        <Typography variant="body2"><strong>Tags:</strong> {item.item_tags}</Typography>
                                                                        <Typography variant="body2"><strong>Tipe Search:</strong> {item.score_type !== undefined ? item.score_type : 'N/A'}</Typography>
                                                                        {item.score !== 0 && (<Typography variant="body2"><strong>Skor TF-IDF:</strong> {item.score !== undefined ? item.score.toFixed(6) : 'N/A'}</Typography>)}
                                                                    </>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Container>
        </Container>
    );
}

export default SearchPage;
