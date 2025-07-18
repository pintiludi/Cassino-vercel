import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido.');

  const { valor, simbolo } = req.body;
  const valencia = parseFloat(valor);

  if (valencia < 1 || valencia > 1000 || !simbolo) {
    return res.status(400).send('Valor ou token inválido');
  }

  try {
    const pagamento = {
      transaction_amount: valencia,
      description: `Compra de pontos para token ${simbolo}`,
      payment_method_id: 'pix',
      payer: {
        email: 'comprador@email.com'
      },

      metadata: {
        simbolo: simbolo
      }
    };

    const response = await mercadopago.payment.create(pagamento);
    const ponto = response.body;

    res.status(200).json({
      link: ponto.point_of_interaction.transaction_data.ticket_url,
      qr: ponto.point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao criar pagamento');
  }
}
