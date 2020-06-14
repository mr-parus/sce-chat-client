const path = require('path');
const express = require('express');
const cors = require('cors');
const publicPath = path.join(__dirname, './build');
const port = process.env.PORT || 3000;

const app = express();
app.use(express.static(publicPath));
app.use(cors())
app.get('*', (req, res) => res.sendFile(path.join(publicPath, 'index.html')));
app.listen(port, () => console.log('Server is up!'));
