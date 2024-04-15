const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('dist/ml-dash'));

app.get('/*', (req,res) =>
    res.sendFile('index.html', {root: 'dist/ml-dashboard/'}),
);

app.listen(process.env.PORT || 8080);