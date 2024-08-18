import React, { useState } from 'react';
import axios from 'axios';
import { Container, TextField, Typography, Card, CardContent, CardMedia, Grid, Stack, IconButton, InputAdornment } from '@mui/material';
import ItemDetailPage from './ItemDetailPage';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { TextLoop } from 'easy-react-text-loop';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [debugMode, setDebugMode] = useState(false);

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
                transition: 'all 0.5s ease-in', // Smooth transition
            }}
        >
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
                
                {/* Conditionally render the search bar outside the card when showSearchResults is false */}
                {!showSearchResults && (
                    // <Stack direction="row" spacing={2} alignItems="center" m={2} style={{ backgroundColor: 'white', zIndex: 1 }}>
                    <TextField
                        variant="outlined"
                        fullWidth
                        placeholder={"Cari kopi, snack, jodoh.."}
                        label="Cari item"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        margin="normal"
                        style={{ backgroundColor: 'white', borderRadius: '4px'}}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {searchQuery && (
                                        <IconButton onClick={handleClearSearch}>
                                            <ClearIcon />
                                        </IconButton>
                                    )}
                                    <IconButton onClick={handleSearch}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    // </Stack>
                )}
                
                {showSearchResults && (
                    <Card
                        // Main Card
                        variant='outlined'
                        style={{
                            padding: '0 10px 0 10px',
                            minHeight: showSearchResults ? '95vh' : '0vh',
                            maxHeight: '95vh',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.5s ease-out', // Smooth transition
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
                                            {searchQuery && (
                                                <IconButton onClick={handleClearSearch}>
                                                    <ClearIcon />
                                                </IconButton>
                                            )}
                                            <IconButton onClick={handleSearch}>
                                                <SearchIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
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
                                                                <Typography variant="h5">{item.name}</Typography>
                                                                <Typography variant="h6">Rp. {item.price}</Typography>
                                                                <Typography variant="body2"><strong>Description:</strong> {item.description}</Typography>
                                                                <Typography variant="body2"><strong>Category:</strong> {item.category}</Typography>
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
                )}
            </Container>
        </Container>
    );
}

export default SearchPage;
