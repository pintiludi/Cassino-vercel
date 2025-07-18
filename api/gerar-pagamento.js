

import mercadopago from 'mercadopago';

mercadopago.configure({ access_token: process.env.MERCADO_PAGO_TOKEN, });

export default async function handler(req, res) { if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

const { valor, usuario, simbolo } = req.body;

if (!valor || !usuario || !simbolo) { return res.status(400).json({ error: 'Dados incompletos.' }); }

try { const preference = await mercadopago.preferences.create({ items: [ { title: Depósito para ${usuario}, quantity: 1, currency_id: 'BRL', unit_price: parseFloat(valor), }, ], metadata: { usuario, simbolo, }, notification_url: ${process.env.URL_BASE}/api/webhook, });

res.status(200).json({ url: preference.body.init_point });

} catch (error) { console.error('Erro ao gerar pagamento:', error); res.status(500).json({ error: 'Erro ao gerar pagamento' }); } }

