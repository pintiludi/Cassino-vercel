
import mercadopago from 'mercadopago';
import fs from 'fs';
import path from 'path';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Método não permitido');

  const { action, data, type } = req.body;

  if (type === 'payment' && action === 'payment.created') {
    try {
      const payment = await mercadopago.payment.findById(data.id);
      const status = payment.response.status;
      const valor = payment.response.transaction_amount;
      const simbolo = payment.response.metadata?.simbolo;

      if (status === 'approved' && simbolo) {
        const filePath = path.join(process.cwd(), 'db', 'jogadores.json');
        const jogadores = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (!jogadores[simbolo]) jogadores[simbolo] = { pontos: 0, historico: [] };

        const pontos = valor * 2;

        jogadores[simbolo].pontos += pontos;
        jogadores[simbolo].historico.push(`+${pontos} pontos (R$${valor})`);

        fs.writeFileSync(filePath, JSON.stringify(jogadores, null, 2));
        return res.status(200).send('Pontos adicionados');
      }

      return res.status(200).send('Pagamento não aprovado ou símbolo ausente');
    } catch (e) {
      console.error('Erro ao processar pagamento:', e);
      return res.status(500).send('Erro interno');
    }
  }

  return res.status(200).send('Evento ignorado');
}
