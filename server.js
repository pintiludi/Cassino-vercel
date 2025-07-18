import express from 'express';
import fs from 'fs';
import path from 'path';
import mercadopago from 'mercadopago';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

mercadopago.configure({
  access_token: process.env.MP_TOKEN
});

app.post('/api/gerar-pagamento', async (req, res) => {
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
      payer: { email: 'comprador@email.com' },
      metadata: { simbolo }
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
});

app.post('/api/webhook', async (req, res) => {
  const data = req.body;

  if (data.type === 'payment' && data.action === 'payment.updated') {
    const idPagamento = data.data.id;

    try {
      const pagamento = await mercadopago.payment.findById(idPagamento);
      const status = pagamento.response.status;
      const simbolo = pagamento.response.metadata?.simbolo;
      const valor = pagamento.response.transaction_amount;

      if (status === 'approved' && simbolo) {
        const dbPath = path.join(process.cwd(), 'db');
        if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath);

        const jogadoresPath = path.join(dbPath, 'jogadores.json');
        const jogadores = fs.existsSync(jogadoresPath)
          ? JSON.parse(fs.readFileSync(jogadoresPath, 'utf-8'))
          : {};

        if (!jogadores[simbolo]) jogadores[simbolo] = { pontos: 0, historico: [] };

        const pontos = valor * 2;
        jogadores[simbolo].pontos += pontos;
        jogadores[simbolo].historico.push(`+${pontos} pontos (R$${valor})`);

        fs.writeFileSync(jogadoresPath, JSON.stringify(jogadores, null, 2));
      }

      return res.status(200).send('OK');
    } catch (e) {
      console.error(e);
      return res.status(500).send('Erro ao processar pagamento');
    }
  }

  return res.status(200).send('Ignorado');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
