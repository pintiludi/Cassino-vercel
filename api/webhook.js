import { buffer } from 'micro';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const rawBody = await buffer(req);
    const data = JSON.parse(rawBody.toString());
    
    if (data.type === 'payment' && data.data && data.action === 'payment.created') {
    
      const buyerID = data.data.id.toString();

      const filePath = path.resolve('./', 'jogadores.json');
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const jogador = jsonData.find(j => j.id === buyerID);
      if (!jogador) {
        jsonData.push({
          id: buyerID,
          pontos: 10
        });

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      }

      return res.status(200).json({ message: 'Pagamento processado e pontos adicionados.' });
    }

    return res.status(400).json({ message: 'Evento não tratado.' });

  } catch (err) {
    console.error('Erro no webhook:', err);
    return res.status(500).json({ message: 'Erro interno.' });
  }
}
