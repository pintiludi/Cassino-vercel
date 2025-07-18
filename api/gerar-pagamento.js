import mercadopago from 'mercadopago';
mercadopago.configure({ access_token: process.env.MP_TOKEN });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send("Método não permitido");

  const { valencia, simbolo } = req.body;
  const valor = parseFloat(valencia);
  const token = simbolo;

  if (valor < 1 || valor > 1000 || !token) return res.status(400).send("Valor ou token inválido");

  try {
    const pagamento = {
      transaction_amount: valor,
      description: `Compra de pontos para token ${token}`,
      payment_method_id: "pix",
      payer: { email: "comprador@email.com" },
      metadata: { token }
    };

    const response = await mercadopago.payment.create(pagamento);
    const { point_of_interaction } = response.body;

    res.status(200).json({
      link: point_of_interaction.transaction_data.ticket_url,
      qr: point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao criar pagamento");
  }
}
