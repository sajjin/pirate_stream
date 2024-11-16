const express = require('express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Get API key from environment variables
const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Middleware
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(cors());

// Verify API key is present
const verifyApiKey = (req, res, next) => {
  if (!OMDB_API_KEY) {
    console.error('OMDB API key not found in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  next();
};

// Search endpoint
app.get('/search', verifyApiKey, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get('https://www.omdbapi.com/', {
      params: {
        apikey: OMDB_API_KEY,
        s: query
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error in /search:', error.message);
    res.status(500).json({ 
      error: 'Error fetching data',
      message: error.message 
    });
  }
});

// Movie details endpoint
app.get('/movie/:imdbId', verifyApiKey, async (req, res) => {
  try {
    const { imdbId } = req.params;
    if (!imdbId) {
      return res.status(400).json({ error: 'IMDB ID is required' });
    }

    const response = await axios.get('https://www.omdbapi.com/', {
      params: {
        apikey: OMDB_API_KEY,
        i: imdbId
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error in /movie/:imdbId:', error.message);
    res.status(500).json({ 
      error: 'Error fetching movie details',
      message: error.message 
    });
  }
});

// Browse movies endpoint
app.get('/movies/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const response = await axios.get(`https://vidsrc.xyz/movies/latest/page-${page}.json`);
    
    // If we need to enrich with OMDB data
    if (response.data.result) {
      const enrichedData = await Promise.all(
        response.data.result.map(async (item) => {
          try {
            const omdbResponse = await axios.get('https://www.omdbapi.com/', {
              params: {
                apikey: OMDB_API_KEY,
                i: item.imdb_id
              }
            });
            
            return {
              ...item,
              omdb_data: omdbResponse.data
            };
          } catch (error) {
            console.error(`Error fetching OMDB data for ${item.imdb_id}:`, error.message);
            return item;
          }
        })
      );
      
      response.data.result = enrichedData;
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error in /movies/:page:', error.message);
    res.status(500).json({ 
      error: 'Error fetching movies',
      message: error.message 
    });
  }
});

// Browse TV shows endpoint
app.get('/tvshows/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const response = await axios.get(`https://vidsrc.xyz/tvshows/latest/page-${page}.json`);
    
    // If we need to enrich with OMDB data
    if (response.data.result) {
      const enrichedData = await Promise.all(
        response.data.result.map(async (item) => {
          try {
            const omdbResponse = await axios.get('https://www.omdbapi.com/', {
              params: {
                apikey: OMDB_API_KEY,
                i: item.imdb_id
              }
            });
            
            return {
              ...item,
              omdb_data: omdbResponse.data
            };
          } catch (error) {
            console.error(`Error fetching OMDB data for ${item.imdb_id}:`, error.message);
            return item;
          }
        })
      );
      
      response.data.result = enrichedData;
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error in /tvshows/:page:', error.message);
    res.status(500).json({ 
      error: 'Error fetching TV shows',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(3000, () => {
  console.log('App started');
});

module.exports = app;