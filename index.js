export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.end(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Comprar Pontos</title>
      <style>
        body { font-family: sans-serif; padding: 30px; background: #111; color: #0f0; text-align: center; }
        h1 { font-size: 2em; }
        select, input { font-size: 1.1em; margin: 10px; padding: 5px; }
        button { font-size: 1.2em; padding: 10px 20px; background: #0f0; color: #000; border: none; cursor: pointer; }
        #qr { margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>💰 Comprar Pontos</h1>
      <p>Escolha um valor para gerar o Pix:</p>
      <form id="form">
        <label>Token do Jogador:</label><br/>
        <input type="text" id="simbolo" required placeholder="ex: jog123" /><br/>
        <select id="valor">
          <option value="1">R$1</option>
          <option value="2">R$2</option>
          <option value="5">R$5</option>
          <option value="10">R$10</option>
          <option value="20">R$20</option>
          <option value="50">R$50</option>
          <option value="100">R$100</option>
          <option value="200">R$200</option>
          <option value="500">R$500</option>
          <option value="1000">R$1000</option>
        </select><br/>
        <button type="submit">Gerar Pagamento Pix</button>
      </form>

      <div id="qr"></div>

      <script>
        const form = document.getElementById('form');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const valor = document.getElementById('valor').value;
          const simbolo = document.getElementById('simbolo').value;

          const res = await fetch('/api/gerar-pagamento', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valor, simbolo })
          });

          const json = await res.json();
          document.getElementById('qr').innerHTML = \`
            <h2>📎 Link Pix:</h2>
            <a href="\${json.link}" target="_blank">\${json.link}</a>
            <h3>📷 QR Code:</h3>
            <img src="data:image/png;base64,\${json.qr}" width="300" />
          \`;
        };
      </script>
    </body>
    </html>
  `);
}
