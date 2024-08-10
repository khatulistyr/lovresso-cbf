import React, { useState } from 'react';
import axios from 'axios';

function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [recommendedItems, setRecommendedItems] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

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
        } catch (error) {
            console.error('Error fetching search results:', error);
            setSearchResults([]);
        }
    };

    const handleRecommendation = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:5000/api/recommend', {
                item_name: searchQuery
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setRecommendedItems(Array.isArray(response.data) ? response.data : []);
            setShowSearchResults(false);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setRecommendedItems([]);
        }
    };

    return (
        <div>
            <h1>Menu Search and Recommendations</h1>
            <input
                type="text"
                placeholder="Enter item name or search query..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
            <button onClick={handleRecommendation}>Get Recommendations</button>

            {showSearchResults && (
                <div>
                    <h2>Search Results:</h2>
                    {searchResults.map((item, index) => (
                        <div key={index} className="card">
                            <h2>{item.name}</h2>
                            <p><strong>Category:</strong> {item.category}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            {/* <p><strong>Price:</strong> {isNaN(item.price) ? 'N/A' : `$${item.price}`}</p> */}
                            {/* <p><strong>Price:</strong> {item.price}</p> */}
                            <p><strong>Tags:</strong> {item.tags}</p>
                            {/* <p><strong>Similarity Score:</strong> {item.score !== undefined ? item.score.toFixed(4) : 'N/A'}</p> */}
                        </div>
                    ))}
                </div>
            )}

            {!showSearchResults && recommendedItems.length > 0 && (
                <div>
                    <h2>Recommended Items:</h2>
                    {recommendedItems.map((item, index) => (
                        <div key={index} className="card">
                            <h2>{item.name}</h2>
                            <p><strong>Category:</strong> {item.category}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            {/* <p><strong>Price:</strong> {isNaN(item.price) ? 'N/A' : `$${item.price}`}</p> */}
                            {/* <p><strong>Price:</strong> {item.price}</p> */}
                            <p><strong>Tags:</strong> {item.tags}</p>
                            {/* <p><strong>Similarity Score:</strong> {item.score !== undefined ? item.score.toFixed(4) : 'N/A'}</p> */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchPage;
