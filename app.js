const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor accesible en la red local: http://<192.168.1.87>:3000");
});


