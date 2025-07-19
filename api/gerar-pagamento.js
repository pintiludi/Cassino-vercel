import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido.');

  const { valor, simbolo } = req.body;

  if (!valor || !simbolo) return res.status(400).send('Dados inválidos');

  try {
    const pagamento = await mercadopago.payment.create({
      transaction_amount: Number(valor),
      description: `Compra de pontos para ${simbolo}`,
      payment_method_id: 'pix',
      payer: { email: 'comprador@email.com' },
      metadata: { simbolo }
    });

    const link = pagamento.body.point_of_interaction.transaction_data.ticket_url;
    const qr = pagamento.body.point_of_interaction.transaction_data.qr_code_base64;

    res.status(200).json({ link, qr });
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ao criar pagamento');
  }
}
