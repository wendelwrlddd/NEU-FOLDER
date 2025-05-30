const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const comentarioFile = path.join(__dirname, '..', 'comentarios.json');

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

router.get('/', (req, res) => {
  const comentarios = lerComentarios();
  res.status(200).json(comentarios);
});

router.post('/', (req, res) => {
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

module.exports = router;
