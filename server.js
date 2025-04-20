const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve index.html e afins

// Rotas customizadas
const comentariosRoute = require('./api/comentarios');
const pagamentoRoute = require('./api/create-pix-payment');

app.use('/api/comentarios', comentariosRoute);
app.use('/create-pix-payment', pagamentoRoute);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});



