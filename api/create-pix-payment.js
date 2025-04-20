const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { transaction_amount, description } = req.body;

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

    const response = await mercadopago.payment.create(paymentData);
    res.status(200).json(response.body);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
};
