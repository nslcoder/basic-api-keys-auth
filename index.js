const { writeFile, readFile, appendFile, write } = require('fs');
const express = require('express');
const { v4: uuid } = require('uuid');

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());

// Get all bottles (Anyone can access it)
app.get('/', (req, res) => {
  readFile('filedb.json', 'utf-8', (err, data) => {
    if (err) return res.send(err);
    const parsed = JSON.parse(data);
    res.send(parsed);
  });
});

// Generate API key
app.post('/create', (req, res) => {
  const apiKey = uuid();

  // Store apikeys in keysdb.json
  readFile('keysdb.json', 'utf-8', (err, data) => {
    if (err) return res.send(err);
    const allKeys = JSON.parse(data);
    allKeys.push(apiKey);

    const jsonedKeys = JSON.stringify(allKeys);

    // Save new keys to keysdb.json
    writeFile('keysdb.json', jsonedKeys, 'utf-8', (err) => {
      if (err) return res.send(err);
      console.log('New API Keys generated and stored.');
    });

    // Send apikeys to the user
    res.send(`Your API Keys: ${apiKey}`);
  });
});

// Add bottles (Only those with API keys can add)
app.post('/add/:key', (req, res) => {
  const { key } = req.params;

  readFile('keysdb.json', 'utf-8', (err, data) => {
    if (err) return res.send(err);
    const allKeys = JSON.parse(data);
    const isAuthenticated = allKeys.includes(key);

    if (isAuthenticated) {
      const bottle = req.body;

      readFile('filedb.json', 'utf-8', (err, data) => {
        if (err) return res.send(err);
        const allBottles = JSON.parse(data);
        allBottles.push(bottle);

        const jsonedBottles = JSON.stringify(allBottles);

        // Save new bottle to filedb.json
        writeFile('filedb.json', jsonedBottles, 'utf-8', (err) => {
          if (err) return res.send(err);
          res.send('Your bottle is added');
        });
      });
    }
  });
});

app.listen(port, () => {
  console.log(`The server is listening at port ${port}`);
});
