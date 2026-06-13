export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo nao permitido' });

  try {
    const body = req.body;

    // Kiwify envia o evento de compra aprovada
    const evento = body?.event || body?.type || '';
    const aprovado = ['order.approved', 'payment.approved', 'purchase.approved', 'order_approved'].some(e => evento.toLowerCase().includes(e.replace('_','.'))) || body?.status === 'approved';

    if (!aprovado) {
      console.log('Evento ignorado:', evento, 'Status:', body?.status);
      return res.status(200).json({ ok: true, msg: 'Evento ignorado' });
    }

    // Pegar email do cliente
    const email =
      body?.customer?.email ||
      body?.buyer?.email ||
      body?.data?.customer?.email ||
      body?.data?.buyer?.email ||
      null;

    const nome =
      body?.customer?.name ||
      body?.buyer?.name ||
      body?.data?.customer?.name ||
      body?.data?.buyer?.name ||
      'Aluno';

    if (!email) {
      console.error('Email nao encontrado no payload:', JSON.stringify(body));
      return res.status(400).json({ error: 'Email do cliente nao encontrado' });
    }

    // Gerar código único
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = (n) => Array.from({length: n}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const code = 'PM-' + part(4) + '-' + part(4);

    // Salvar código no KV da Vercel (usando arquivo de controle simples)
    // Como não temos DB, vamos logar e confiar no email
    console.log(`CODIGO GERADO: ${code} para ${email} (${nome}) em ${new Date().toISOString()}`);

    // Enviar email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY nao configurada');
      return res.status(500).json({ error: 'Chave de email nao configurada' });
    }

    const emailBody = {
      from: 'PromptMaster <onboarding@resend.dev>',
      to: [email],
      subject: 'Seu acesso ao PromptMaster chegou!',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#0a0a0f;font-family:Inter,system-ui,sans-serif;">
          <div style="max-width:560px;margin:0 auto;padding:40px 20px;">

            <div style="text-align:center;margin-bottom:32px;">
              <div style="width:60px;height:60px;background:linear-gradient(135deg,#7c5cfc,#ec4899);border-radius:16px;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px;">🧠</div>
              <h1 style="color:#e8e8f0;font-size:26px;font-weight:800;margin:0;">PromptMaster</h1>
              <p style="color:#9090a8;font-size:14px;margin:6px 0 0;">O Guia Definitivo de Prompts com IA</p>
            </div>

            <div style="background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;margin-bottom:20px;">
              <h2 style="color:#e8e8f0;font-size:20px;font-weight:700;margin:0 0 12px;">Olá, ${nome}! 👋</h2>
              <p style="color:#9090a8;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Sua compra foi confirmada! Abaixo está seu código exclusivo de acesso ao PromptMaster. Guarde-o em um lugar seguro.
              </p>

              <div style="background:#0a0a0f;border:2px solid #7c5cfc;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="color:#9090a8;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px;">Seu Código de Acesso</p>
                <div style="font-family:monospace;font-size:28px;font-weight:800;color:#9b7dff;letter-spacing:4px;">${code}</div>
              </div>

              <h3 style="color:#e8e8f0;font-size:16px;font-weight:600;margin:0 0 12px;">Como acessar:</h3>
              <ol style="color:#9090a8;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px;">
                <li>Acesse <a href="https://promptmaster-3n3w.vercel.app" style="color:#9b7dff;">promptmaster-3n3w.vercel.app</a></li>
                <li>Clique em <strong style="color:#e8e8f0;">Criar Conta</strong></li>
                <li>Preencha seus dados e cole o código acima</li>
                <li>Pronto — seu acesso está liberado!</li>
              </ol>

              <a href="https://promptmaster-3n3w.vercel.app" style="display:block;background:linear-gradient(135deg,#7c5cfc,#ec4899);color:#fff;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-size:15px;font-weight:700;">
                Acessar o PromptMaster →
              </a>
            </div>

            <div style="background:#12121a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:20px;">
              <p style="color:#9090a8;font-size:13px;margin:0;line-height:1.6;">
                ⚠️ <strong style="color:#e8e8f0;">Importante:</strong> Este código é pessoal e intransferível. Ele só pode ser usado uma vez para criar sua conta. Não compartilhe com ninguém.
              </p>
            </div>

            <p style="color:#5a5a70;font-size:12px;text-align:center;margin:0;">
              Dúvidas? Responda este email.<br>
              © 2025 PromptMaster — Todos os direitos reservados
            </p>
          </div>
        </body>
        </html>
      `
    };

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify(emailBody)
    });

    const emailData = await emailRes.json();

    if (!emailRes.ok) {
      console.error('Erro ao enviar email:', emailData);
      return res.status(500).json({ error: 'Erro ao enviar email', details: emailData });
    }

    console.log(`Email enviado com sucesso para ${email}. ID: ${emailData.id}`);

    return res.status(200).json({
      ok: true,
      code,
      email,
      emailId: emailData.id
    });

  } catch (err) {
    console.error('Erro no webhook:', err);
    return res.status(500).json({ error: err.message });
  }
}
