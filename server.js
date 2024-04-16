//Install express server
require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT;

// Serve only the static files form the dist directory
app.use(express.static('./dist/ml-dash'));

app.get('/*', function(req, res)
    {res.sendFile('index.html', {root: 'dist/ml-dash/'})}
);

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
