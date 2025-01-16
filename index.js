const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'dist/underworlds-stats/browser')));

// Handle all routes and return the index.html file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/underworlds-stats/index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});