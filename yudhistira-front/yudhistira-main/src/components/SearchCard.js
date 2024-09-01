import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Typography, Card, CardContent, CardMedia, Chip, Grid, Stack, IconButton, InputAdornment, CircularProgress, Button, List, ListItem, ListItemText } from '@mui/material';
import ItemDetailPage from './ItemDetailPage';
import MenuButton from './MenuButton';
import OrderButton from './OrderButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { TextLoop } from 'easy-react-text-loop';

function SearchCard({ orders, setOrders }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [items, setItems] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [categories, setCategories] = useState([]); 
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    // const [selectedCategory, setSelectedCategory] = useState(1);
    const [showMenu, setShowMenu] = useState(true); // Default to showing the menu
    const [debugMode, setDebugMode] = useState(true);
    // const [debugMode, setDebugMode] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/items`)
            .then(response => setItems(response.data))
            .catch(error => console.error('Error fetching items:', error));
            
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
            .then(response => {
                const fetchedCategories = response.data;
                setCategories(fetchedCategories);
    
                // Set the default selected category to the one with category_id = 1
                const defaultCategory = fetchedCategories.find(category => category.category_id === 1);
                if (defaultCategory) {
                    setSelectedCategory(defaultCategory);
                }
            })
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
            setShowMenu(false);  // Hide menu when search results are shown
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
            // Show the menu when there's no search query
            setShowMenu(true);
            setShowSearchResults(false);
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
        setShowMenu(true); // Show the menu after clearing the search
    };

    const handleAddToOrder = (item) => {
        setOrders(prevOrders => {
            const existingOrder = prevOrders.find(order => order.item_id === item.item_id);
            if (existingOrder) {
                return prevOrders.map(order =>
                    order.item_id === item.item_id
                        ? { ...order, quantity: order.quantity + 1 }
                        : order
                );
            } else {
                return [...prevOrders, { ...item, item_id: item.item_id, quantity: 1 }];
            }
        });
    };

    const handleOpenMenu = () => {
        setShowMenu(true);
        setShowSearchResults(false);  // Hide search results when menu is shown
        setSelectedItem(null);
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const filteredItems = selectedCategory
        ? items.filter(item => item.category_id === selectedCategory.category_id)
        : [];

    return (
        <Container sx={{padding: "0"}}>
            <Stack direction="row" spacing={2} alignItems="center" m={2} style={{ position: 'sticky', zIndex: 1 }}>
                <TextField
                    autoComplete="off"
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
                                    {searchQuery && (
                                        <IconButton onClick={handleClearSearch}>
                                            <ClearIcon />
                                        </IconButton>
                                        )
                                    }
                                        <IconButton onClick={handleSearch}>
                                            <SearchIcon />
                                        </IconButton>
                                    </>
                                )}
                            </InputAdornment>
                        ),
                    }}
                />
                {/* <MenuButton onOpenMenu={handleOpenMenu}/> */}
            </Stack>
            
            <Card
                variant='outlined'
                style={{
                    minHeight: '80vh',
                    maxHeight: '80vh',
                    display: 'flex',
                    flexDirection: 'row',
                    transition: 'all 0.5s ease-out',
                    // padding: '2'
                }}
            >   
                {showSearchResults && (
                    <CardContent style={{ overflowY: 'auto', flex: 1 }}>
                        {selectedItem ? (
                            <ItemDetailPage item={selectedItem} onBack={() => setSelectedItem(null)} debugMode={debugMode} categoryName={getCategoryName(selectedItem.category_id)} orders={orders} setOrders={setOrders}/>
                        ) : (
                            <Grid container spacing={3} alignItems="stretch">
                                {searchResults.map((item) => (
                                    <Grid item xs={12} sm={6} key={item.item_id} style={{ display: 'flex' }}>
                                        <Card 
                                            onClick={() => handleItemSelect(item)} 
                                            variant="outlined" 
                                            style={{ 
                                                flexGrow: 1, 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                transition: 'transform 0.2s ease-in-out' 
                                            }} 
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.025)'} 
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="200"
                                                image={`${process.env.REACT_APP_API_BASE_URL}${item.image_url}`}
                                                alt={item.name}
                                            />
                                            <CardContent style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                                <Container disableGutters='true'>
                                                    <Container style={{ flexGrow: 1 }} disableGutters='true'>
                                                        <Typography variant="h4">{item.item_name} <Chip label={getCategoryName(item.category_id)} variant="outlined" /></Typography>
                                                        <Typography variant="h5" sx={{ mb: 1 }}>Rp. {item.item_price}</Typography>
                                                        <Typography variant="body2">{item.item_description}</Typography>
                                                        {debugMode && (
                                                            <>
                                                                <Typography variant="body2"><strong>Suggested Query:</strong> {item.suggested_query}</Typography>
                                                                <Typography variant="body2"><strong>Tags:</strong> {item.item_tags}</Typography>
                                                                <Typography variant="body2"><strong>Tipe Search:</strong> {item.score_type !== undefined ? item.score_type : 'N/A'}</Typography>
                                                                {item.score !== 0 && (<Typography variant="body2"><strong>Skor TF-IDF:</strong> {item.score !== undefined ? item.score.toFixed(6) : 'N/A'}</Typography>)}
                                                            </>
                                                        )}
                                                    </Container>
                                                    <Container disableGutters='true' sx={{ marginTop: 2 }}>
                                                        <OrderButton item={item} onAddToOrder={() => handleAddToOrder(item)} />
                                                    </Container>
                                                </Container>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </CardContent>
                )}

                {showMenu && (
                    <>
                        <List component="nav" style={{ width: '200px', borderRight: '1px solid #ddd' }}>
                            {categories.map(category => (
                                <ListItem 
                                    button 
                                    key={category.category_id} 
                                    selected={selectedCategory && selectedCategory.category_id === category.category_id}
                                    onClick={() => handleCategorySelect(category)}
                                >
                                    <ListItemText primary={category.category_name} />
                                </ListItem>
                            ))}
                        </List>
                        <CardContent style={{ overflowY: 'auto', flex: 1 }}>
                            {filteredItems.length > 0 ? (
                                <Grid container spacing={3}>
                                    {filteredItems.map((item) => (
                                        <Grid item xs={12} sm={6} key={item.item_id}>
                                            <Card onClick={() => handleItemSelect(item)} variant="outlined" style={{ transition: 'transform 0.2s ease-in-out' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.025)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={`${process.env.REACT_APP_API_BASE_URL}${item.image_url}`}
                                                    alt={item.name}
                                                />
                                                <CardContent>
                                                    <Typography variant="h4">{item.item_name}</Typography>
                                                    <Typography variant="h5" sx={{ mb: 1 }}>Rp. {item.item_price}</Typography>
                                                    <Typography variant="body2">{item.item_description}</Typography>
                                                    <Container disableGutters='true' sx={{ marginTop: 2 }}>
                                                        <OrderButton item={item} onAddToOrder={() => handleAddToOrder(item)} />
                                                    </Container>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="h5" color="grey">Pilih kategori untuk melihat item.</Typography>
                            )}
                        </CardContent>
                    </>
                )}
            </Card>
        </Container>
    );
}

export default SearchCard;
