const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const comentarioFile = 'backend/comentarios.json';

function lerComentarios() {
  try {
    const data = fs.readFileSync(comentarioFile);
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler o arquivo:", err);
    return [];
  }
}

function escreverComentarios(comentarios) {
  try {
    fs.writeFileSync(comentarioFile, JSON.stringify(comentarios, null, 2));
  } catch (err) {
    console.error("Erro ao salvar o arquivo:", err);
  }
}

app.get('/comentarios', (req, res) => {
  const comentarios = lerComentarios();
  res.json(comentarios);
});

app.post('/comentarios', (req, res) => {
  const { autor, texto } = req.body;

  if (!autor?.trim() || !texto?.trim()) {
    return res.status(400).json({ error: 'Nome e comentário são obrigatórios' });
  }

  try {
    const comentarios = lerComentarios();
    const novoComentario = {
      autor: autor.trim(),
      texto: texto.trim(),
      data: new Date().toISOString()
    };
    
    comentarios.push(novoComentario);
    escreverComentarios(comentarios);
    
    res.status(201).json(novoComentario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar comentário' });
  }
});
const mercadopago = require('mercadopago');

// Configuração do Mercado Pago
mercadopago.configure({
  access_token: 'APP_USR-2743858992570636-040810-a75076b765d8bebabe396691587c5da5-2205903660' // Substitua pelo seu token
});

// Rota para criar pagamento PIX
app.post('/create-pix-payment', async (req, res) => {
  try {
    const { transaction_amount, description } = req.body;
    
    const paymentData = {
      transaction_amount,
      description,
      payment_method_id: 'pix',
      payer: {
        email: 'doador@example.com', // Pode ser genérico
        first_name: 'Apoiador',
        last_name: 'Anônimo'
      },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Expira em 30 minutos
    };

    const response = await mercadopago.payment.create(paymentData);
    res.json(response.body);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));


