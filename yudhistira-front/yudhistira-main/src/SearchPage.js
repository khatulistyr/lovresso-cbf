import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Typography, Card, CardContent, CardMedia, Grid, Stack, IconButton, Checkbox, FormControlLabel, InputAdornment } from '@mui/material';
import ItemDetailPage from './ItemDetailPage';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    // const [debugMode, setDebugMode] = useState(false);
    const [debugMode, setDebugMode] = useState(true);

    // botched attempt at fixing the transition issue at 4am
    function sleep(milliseconds) { 
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }

    const handleSearch = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/search', {
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
        }
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item);
        setSearchQuery(item.name); // Set searchQuery to the selected item's name
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

    const handleDebugModeChange = (event) => {
        setDebugMode(event.target.checked);
    };

    return (
        <Container
            style={{
                margin: '0',
                // backgroundImage: 'url(/bg.png), linear-gradient(to bottom, transparent, black)',
                backgroundImage: 'url(/bg2.jpg), linear-gradient(to bottom, transparent, black)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                minHeight: '100vh',
                minWidth: '100vw',
                paddingTop: '20px',
                paddingBottom: '20px',
                backgroundColor: 'black',
                display: 'flex',
                // alignItems: showSearchResults ? 'flex-start' : 'center',  // Center vertically if no search results
                alignItems: 'center',  // Center vertically if no search results
                justifyContent: 'center',
                transition: 'all 0.5s ease-in', // Smooth transition
            }}
        >
            <Container maxWidth="md">
                <Card
                    variant='outlined'
                    style={{
                        padding: '0 10px 0 10px',
                        minHeight: showSearchResults ? '95vh' : '0vh',
                        maxHeight: '95vh',
                        display: 'flex',
                        flexDirection: 'column',
                        // transform: showSearchResults ? 'translateY(0)' : 'translateY(-50%)',  // Animate position change
                        transition: 'all 0.5s ease-out', // Smooth transition
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" m={2} style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            placeholder="Cari kopi, snack, jodoh.."
                            label="Cari item"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            margin="normal"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClearSearch}>
                                            <ClearIcon />
                                        </IconButton>
                                        <IconButton onClick={handleSearch}>
                                            <SearchIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        {/* <FormControlLabel
                            control={<Checkbox checked={debugMode} onChange={handleDebugModeChange} />}
                            label="Debug"
                        /> */}
                    </Stack>

                    {showSearchResults && (
                        <CardContent style={{ overflowY: 'auto' }}>
                            {selectedItem ? (
                                <ItemDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} debugMode={debugMode} />
                            ) : (
                                <div>
                                    {searchResults.length === 0 ? (
                                        <Typography variant="h5" align="center" color="textSecondary">
                                            Tidak ada hasil pencarian
                                        </Typography>
                                    ) : (
                                        <div>
                                            <Grid container spacing={3}>
                                                {searchResults.map((item, index) => (
                                                    <Grid item xs={12} sm={6} key={index}>
                                                        <Card onClick={() => handleItemSelect(item)} variant="outlined">
                                                            <CardMedia
                                                                component="img"
                                                                height="140"
                                                                image={item.image_url}
                                                                alt={item.name}
                                                            />
                                                            <CardContent>
                                                                <Typography variant="h6">{item.name}</Typography>
                                                                <Typography variant="body2"><strong>Category:</strong> {item.category}</Typography>
                                                                <Typography variant="body2"><strong>Description:</strong> {item.description}</Typography>
                                                                <Typography variant="body2"><strong>Price:</strong> {item.price}</Typography>
                                                                {debugMode && (
                                                                    <>
                                                                        <Typography variant="body2"><strong>Tags:</strong> {item.tags}</Typography>
                                                                        <Typography variant="body2"><strong>Similarity Score:</strong> {item.score !== undefined ? item.score.toFixed(4) : 'N/A'}</Typography>
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
                    )}
                </Card>
            </Container>
        </Container>
    );
}

export default SearchPage;
