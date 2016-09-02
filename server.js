const path = require('path');
const express = require('express');
const app = express();
const port = process.env.PORT || 3001

app.use(express.static(path.join(__dirname, 'build')));

app.listen(port, () => {console.log(`cheffplate running at http://localhost:${port}/`)});
