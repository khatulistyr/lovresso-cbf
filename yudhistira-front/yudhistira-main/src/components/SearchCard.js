import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Typography, Card, CardContent, CardMedia, Chip, Grid, Stack, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import ItemDetailPage from './ItemDetailPage';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import OrderButton from './OrderButton';
import { TextLoop } from 'easy-react-text-loop';

function SearchCard({ orders, setOrders }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [items, setItems] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [categories, setCategories] = useState([]); 
    const [selectedItem, setSelectedItem] = useState(null);
    const [debugMode, setDebugMode] = useState(false);
    const [loading, setLoading] = useState(false);
    // const [orders, setOrders] = useState([]);

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
            setLoading(true);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery) {
            setLoading(true);
            const timeoutId = setTimeout(() => {
                handleSearch();
            }, 1000);

            return () => clearTimeout(timeoutId);
        } else {
            setLoading(false);
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

    return (
        <Container>
            {!showSearchResults &&  (
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
                            <ItemDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} debugMode={debugMode} categoryName={getCategoryName(selectedItem.category_id)} orders={orders} setOrders={setOrders}/>
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
                                                <Grid item xs={12} sm={6} key={item.item_id}>
                                                    <Card onClick={() => handleItemSelect(item)} variant="outlined" style={{ transition: 'transform 0.2s ease-in-out' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                        <CardMedia
                                                            component="img"
                                                            height="200"
                                                            image={`${process.env.REACT_APP_API_BASE_URL}${item.image_url}`}
                                                            alt={item.name}
                                                        />
                                                        <CardContent>
                                                            <Typography variant="h4">{item.item_name} <Chip label={getCategoryName(item.category_id)} variant="outlined" /></Typography>
                                                            <Typography variant="h5" sx={{ mb: 1 }}>Rp. {item.item_price}</Typography>
                                                            {/* <Typography variant="body2"><strong>Description:</strong> {item.item_description}</Typography> */}
                                                            <Typography variant="body2">{item.item_description}</Typography>
                                                            {debugMode && (
                                                                <>
                                                                    <Typography variant="body2"><strong>Tags:</strong> {item.item_tags}</Typography>
                                                                    <Typography variant="body2"><strong>Tipe Search:</strong> {item.score_type !== undefined ? item.score_type : 'N/A'}</Typography>
                                                                    {item.score !== 0 && (<Typography variant="body2"><strong>Skor TF-IDF:</strong> {item.score !== undefined ? item.score.toFixed(6) : 'N/A'}</Typography>)}
                                                                </>
                                                            )}
                                                            <OrderButton item={item} onAddToOrder={() => handleAddToOrder(item)} />
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
    );
}

export default SearchCard;
