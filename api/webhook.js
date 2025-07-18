import fs from 'fs';
import path from 'path';
import mercadopago from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Método não permitido');

  const data = req.body;

  console.log('📡 Webhook recebido:', JSON.stringify(data, null, 2));

  if (data.type === 'payment' && data.action === 'payment.updated') {
    const idPagamento = data.data.id;

    try {
      mercadopago.configure({ access_token: process.env.MP_TOKEN });

      const pagamento = await mercadopago.payment.findById(idPagamento);
      const status = pagamento.response.status;
      const simbolo = pagamento.response.metadata?.simbolo;
      const valor = pagamento.response.transaction_amount;

      console.log('✅ Pagamento validado:', { simbolo, valor, status });

      if (status === 'approved' && simbolo) {
        const dbPath = path.join(process.cwd(), 'db');
        const jogadoresPath = path.join(dbPath, 'jogadores.json');

        if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

        const jogadores = fs.existsSync(jogadoresPath)
          ? JSON.parse(fs.readFileSync(jogadoresPath, 'utf-8'))
          : {};

        if (!jogadores[simbolo]) jogadores[simbolo] = { pontos: 0, historico: [] };

        const pontosRecebidos = valor * 2;
        jogadores[simbolo].pontos += pontosRecebidos;
        jogadores[simbolo].historico.push(`+${pontosRecebidos} pontos (R$${valor})`);

        fs.writeFileSync(jogadoresPath, JSON.stringify(jogadores, null, 2));

        console.log('✅ Pontos adicionados com sucesso!');
      }

      return res.status(200).end('OK');
    } catch (erro) {
      console.error('❌ Erro ao processar pagamento:', erro);
      return res.status(500).end('Erro interno no servidor');
    }
  }

  return res.status(200).end('Ignorado');
}
