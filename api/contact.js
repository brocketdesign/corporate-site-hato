const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({ 
      error: '必須項目を入力してください（お名前、メールアドレス、お問い合わせ内容）' 
    });
  }

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: '正しいメールアドレスを入力してください' 
    });
  }

  try {
    // Create Zoho SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();

    // Email content
    const companyText = company ? `会社名: ${company}\n` : '';
    const emailBody = `
【お問い合わせフォーム】

━━━━━━━━━━━━━━━━━━━━━━━━━━
お客様情報
━━━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${name}
メールアドレス: ${email}
${companyText}

━━━━━━━━━━━━━━━━━━━━━━━━━━
お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━
送信日時: ${new Date().toLocaleString('ja-JP')}
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    // Send email to company
    const companyMailOptions = {
      from: `"${process.env.FROM_NAME || 'お問い合わせフォーム'}" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL || process.env.SMTP_USER,
      subject: `【お問い合わせ】${name}様より`,
      text: emailBody,
      replyTo: email,
    };

    await transporter.sendMail(companyMailOptions);

    // Send confirmation email to customer (optional)
    if (process.env.SEND_CONFIRMATION === 'true') {
      const confirmationBody = `
${name} 様

この度は、合同会社はとへお問い合わせいただき、
誠にありがとうございます。

以下の内容でお問い合わせを受け付けました。
内容を確認の上、24時間以内にご返信いたします。

━━━━━━━━━━━━━━━━━━━━━━━━━━
お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━

何かご不明な点がございましたら、
お気軽にお問い合わせください。

━━━━━━━━━━━━━━━━━━━━━━━━━━
合同会社はと
contact@hatoltd.com
https://hatoltd.com
━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

      const confirmationMailOptions = {
        from: `"${process.env.FROM_NAME || '合同会社はと'}" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '【自動返信】お問い合わせありがとうございます',
        text: confirmationBody,
      };

      await transporter.sendMail(confirmationMailOptions);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'お問い合わせを送信しました。24時間以内にご返信いたします。' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ 
      error: 'メールの送信に失敗しました。時間をおいて再度お試しください。' 
    });
  }
};
