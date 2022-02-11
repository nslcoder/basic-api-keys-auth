const { writeFile, readFile } = require('fs/promises');
const { resolve } = require('path');
const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());

// Helper functions
const getData = async (filepath) => {
  const data = await readFile(filepath, 'utf-8');
  return JSON.parse(data);
};

const writeData = async (filepath, data) => {
  const jsonData = JSON.stringify(data);
  writeFile(filepath, jsonData, 'utf-8');
};

// DB paths
const bottlesPath = resolve(__dirname + '/db/filedb.json');
const keysPath = resolve(__dirname + '/db/keysdb.json');

// Get all bottles (Anyone can access it)
app.get('/', async (req, res) => {
  const parsedData = await getData(bottlesPath);
  res.send(parsedData);
});

// Generate API key
app.post('/keys', async (req, res) => {
  const apiKey = uuid();

  // Get all keys and add a new key
  const allKeys = await getData(keysPath);
  allKeys.push(apiKey);

  // Store all keys
  await writeData(keysPath, allKeys);

  // Send API key to the user
  res.send(`Your API Key: ${apiKey}`);
});

// Add bottles (Only those with API keys can add)
app.post('/bottles/:key', async (req, res) => {
  const { key } = req.params;
  const allKeys = await getData(keysPath);

  // Check if the key exists
  const isAuthenticated = allKeys.includes(key);

  // Allow adding if authenticated
  if (isAuthenticated) {
    const bottle = req.body;

    // Add a bottle
    const allBottles = await getData(bottlesPath);
    allBottles.push(bottle);
    await writeData(bottlesPath, allBottles);
  }

  res.send('Bottle is added');
});

app.listen(port, () => {
  console.log(`The server is listening at port ${port}`);
});
