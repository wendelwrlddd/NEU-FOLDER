const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  console.log('▶️ MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN);
  console.log('▶️ Body recebido:', req.body);

  try {
    const { transaction_amount, description } = req.body;

    if (!transaction_amount || !description) {
      console.log('❌ Parâmetros ausentes');
      return res.status(400).json({ error: 'transaction_amount e description são obrigatórios' });
    }

    const paymentData = {
      transaction_amount,
      description,
      payment_method_id: 'pix',
      payer: {
        email: 'doador@example.com',
        first_name: 'Apoiador',
        last_name: 'Anônimo'
      },
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    };

    console.log('▶️ paymentData:', paymentData);

    const response = await mercadopago.payment.create(paymentData);
    console.log('✅ response.body:', response.body);

    return res.status(200).json(response.body);

  } catch (error) {
    console.error('🚨 Erro ao criar pagamento:', error);
    return res.status(500).json({ error: error.message });
  }
};
