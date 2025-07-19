import { useState } from 'react';

export default function Home() {
  const [valor, setValor] = useState(1);
  const [simbolo, setSimbolo] = useState('');
  const [linkPix, setLinkPix] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [carregando, setCarregando] = useState(false);

  const gerarPagamento = async () => {
    if (!simbolo) {
      alert('Digite seu token/jogador!');
      return;
    }

    setCarregando(true);
    try {
      const res = await fetch('/api/gerar-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ valor, simbolo })
      });

      const data = await res.json();
      setLinkPix(data.link);
      setQrCode(data.qr);
    } catch (e) {
      alert('Erro ao gerar pagamento!');
    }
    setCarregando(false);
  };

  const valores = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];

  return (
    <div style={{ backgroundColor: '#000', color: '#0f0', minHeight: '100vh', padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧬 Cassino Vercel - Depósito</h1>

      <input
        placeholder="Digite seu token/jogador"
        value={simbolo}
        onChange={(e) => setSimbolo(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '20px', background: '#111', border: '1px solid #0f0', color: '#0f0' }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1rem' }}>
        {valores.map((v) => (
          <button
            key={v}
            onClick={() => setValor(v)}
            style={{
              padding: '10px 20px',
              backgroundColor: valor === v ? '#0f0' : '#111',
              color: valor === v ? '#000' : '#0f0',
              border: '1px solid #0f0',
              cursor: 'pointer'
            }}
          >
            R${v},00
          </button>
        ))}
      </div>

      <button
        onClick={gerarPagamento}
        disabled={carregando}
        style={{
          padding: '12px 30px',
          backgroundColor: '#0f0',
          color: '#000',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
        {carregando ? 'GERANDO...' : 'GERAR PIX'}
      </button>

      {linkPix && (
        <div style={{ marginTop: '2rem' }}>
          <h3>✅ PIX gerado:</h3>
          <a href={linkPix} target="_blank" rel="noreferrer" style={{ color: '#0f0', wordBreak: 'break-all' }}>
            {linkPix}
          </a>
          <div style={{ marginTop: '20px' }}>
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code Pix" style={{ width: '200px' }} />
          </div>
        </div>
      )}
    </div>
  );
          }
