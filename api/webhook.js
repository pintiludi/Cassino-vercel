import fs from 'fs';
import path from 'path';
import mercadopago from 'mercadopago';

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Método não permitido');

  const data = req.body;

  if (data.type === 'payment' && data.action === 'payment.updated') {
    const idPagamento = data.data.id;

    try {
      const pagamento = await mercadopago.payment.findById(idPagamento);

      if (!pagamento || !pagamento.response) {
        return res.status(200).end('Pagamento não encontrado');
      }

      const { status, transaction_amount, metadata } = pagamento.response;
      const simbolo = metadata?.simbolo;

      if (status === 'approved' && simbolo) {
        const jogadoresPath = path.join(process.cwd(), 'jogadores.json');
        const jogadores = fs.existsSync(jogadoresPath)
          ? JSON.parse(fs.readFileSync(jogadoresPath, 'utf-8'))
          : {};

        const pontos = transaction_amount * 2;

        if (!jogadores[simbolo]) jogadores[simbolo] = { pontos: 0, historico: [] };
        jogadores[simbolo].pontos += pontos;
        jogadores[simbolo].historico.push(`+${pontos} pontos (R$${transaction_amount})`);

        fs.writeFileSync(jogadoresPath, JSON.stringify(jogadores, null, 2));
      }

      return res.status(200).end('OK');
    } catch (e) {
      console.error(e);
      return res.status(500).end('Erro ao processar pagamento');
    }
  }

  res.status(200).end('Ignorado');
}
