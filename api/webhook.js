const BREVO_API_KEY = process.env.BREVO_API_KEY;

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'PM-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function sendEmail(to, name, code) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: 'PromptMaster', email: 'zeroaoluxo01@gmail.com' },
      to: [{ email: to, name: name }],
      subject: '🚀 Seu acesso ao PromptMaster chegou!',
      htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:'Courier New',monospace;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:32px;margin-bottom:8px;">🚀</div>
      <h1 style="color:#a855f7;font-size:22px;margin:0;letter-spacing:2px;">PROMPTMASTER</h1>
      <p style="color:#5a5a72;font-size:12px;margin:4px 0 0;">// acesso liberado</p>
    </div>
    <div style="background:#111122;border:1px solid rgba(168,85,247,0.2);border-radius:12px;padding:32px;margin-bottom:24px;">
      <p style="color:#9a9ab0;font-size:13px;margin:0 0 8px;">$ whoami</p>
      <p style="color:#e8e6f0;font-size:15px;margin:0 0 24px;">Olá, <strong style="color:#a855f7;">${name}</strong>! Sua compra foi confirmada.</p>
      <p style="color:#9a9ab0;font-size:13px;margin:0 0 8px;">$ cat access_code.txt</p>
      <div style="background:#0d0d1a;border:1px solid rgba(168,85,247,0.3);border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="color:#5a5a72;font-size:11px;margin:0 0 8px;letter-spacing:1px;">SEU CÓDIGO DE ACESSO</p>
        <p style="color:#a855f7;font-size:28px;font-weight:700;letter-spacing:6px;margin:0;">${code}</p>
      </div>
      <p style="color:#9a9ab0;font-size:13px;margin:0 0 8px;">$ ./como_usar.sh</p>
      <ol style="color:#9a9ab0;font-size:13px;line-height:2;margin:0 0 24px;padding-left:20px;">
        <li>Acesse <a href="https://promptmaster-3n3w.vercel.app" style="color:#a855f7;">promptmaster-3n3w.vercel.app</a></li>
        <li>Clique em <strong style="color:#e8e6f0;">Criar conta</strong></li>
        <li>Escolha um nome de usuário e senha</li>
        <li>No campo <strong style="color:#e8e6f0;">"código de acesso"</strong>, cole: <strong style="color:#a855f7;">${code}</strong></li>
        <li>Clique em <strong style="color:#e8e6f0;">Entrar</strong> e aproveite!</li>
      </ol>
      <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.15);border-radius:8px;padding:14px;">
        <p style="color:#c084fc;font-size:12px;margin:0;">⚠️ <strong>Guarde este código!</strong> Você precisará dele ao acessar de outro dispositivo.</p>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="https://promptmaster-3n3w.vercel.app" style="background:#a855f7;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px;display:inline-block;">
        🚀 ACESSAR O CURSO AGORA
      </a>
    </div>
    <div style="background:#111122;border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:24px;margin-bottom:24px;">
      <p style="color:#9a9ab0;font-size:13px;margin:0 0 16px;">$ ls ./promptmaster/</p>
      <div style="display:grid;gap:8px;">
        <div style="color:#e8e6f0;font-size:12px;">✅ <strong style="color:#a855f7;">8 módulos</strong> — do básico ao avançado</div>
        <div style="color:#e8e6f0;font-size:12px;">✅ <strong style="color:#a855f7;">Avaliador de prompts</strong> com IA integrada</div>
        <div style="color:#e8e6f0;font-size:12px;">✅ <strong style="color:#a855f7;">Sistema de XP</strong> e progressão gamificada</div>
        <div style="color:#e8e6f0;font-size:12px;">✅ <strong style="color:#a855f7;">Acesso vitalício</strong> com atualizações inclusas</div>
      </div>
    </div>
    <div style="text-align:center;">
      <p style="color:#3a3a52;font-size:11px;margin:0;">suporte: zeroaoluxo01@gmail.com</p>
    </div>
  </div>
</body>
</html>`
    })
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('Brevo error:', data);
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    const status = body?.data?.status || body?.status;
    if (status !== 'paid' && status !== 'approved') {
      return res.status(200).json({ ok: true, msg: 'ignored: not paid' });
    }

    const customer = body?.data?.customer || body?.customer || {};
    const email = customer.email || body?.data?.email || body?.email;
    const name = customer.name || body?.data?.name || body?.name || 'Aluno';
    const firstName = name.split(' ')[0];

    if (!email) {
      return res.status(400).json({ error: 'No email found' });
    }

    const code = generateCode();
    const sent = await sendEmail(email, firstName, code);

    if (!sent) {
      return res.status(500).json({ error: 'Failed to send email' });
    }

    console.log(`✅ PM Access granted: ${email} → ${code}`);
    return res.status(200).json({ ok: true, code, email });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}
