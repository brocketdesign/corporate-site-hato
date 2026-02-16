# Zoho Mail SMTP 設定ガイド

このドキュメントでは、お問い合わせフォームからZoho Mailを使用してメールを送信する方法を説明します。

## 📋 必要な準備

### 1. Zoho Mail での設定

#### アプリケーションパスワードの生成
1. [Zoho Mail](https://mail.zoho.com) にログイン
2. 右上のプロファイルアイコンをクリック → **My Account**
3. **Security** → **App Passwords** を選択
4. **Generate New Password** をクリック
5. アプリ名を入力（例: `Website Contact Form`）
6. 生成されたパスワードを**必ず保存**（後で表示できません）

### 2. 環境変数の設定

プロジェクトのルートに `.env` ファイルを作成：

```env
# Zoho Mail SMTP Configuration
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=contact@hatoltd.com
SMTP_PASS=your-zoho-app-password

# Email Settings
FROM_NAME=合同会社はと
TO_EMAIL=contact@hatoltd.com
SEND_CONFIRMATION=true
```

⚠️ **重要**: `SMTP_PASS` はZohoのログインパスワードではなく、**アプリケーションパスワード**を使用してください。

## 🚀 デプロイ方法

### 方法1: Vercel (推奨)

1. **Vercelにデプロイ**:
   ```bash
   npm i -g vercel
   vercel
   ```

2. **環境変数の設定**:
   - Vercel Dashboard → Project Settings → Environment Variables
   - 上記の `.env` の内容を追加

3. **APIエンドポイント**: `https://your-domain.vercel.app/api/contact`

### 方法2: Netlify

1. **Netlify Functions を有効化**:
   `netlify.toml` を作成：
   ```toml
   [build]
     functions = "netlify/functions"
   ```

2. **関数を移動**:
   ```bash
   mkdir -p netlify/functions
   cp api/contact.js netlify/functions/contact.js
   ```

3. **デプロイ**:
   ```bash
   npm i -g netlify-cli
   netlify deploy --prod
   ```

4. **環境変数の設定**: Netlify Dashboard → Site settings → Build & deploy → Environment

### 方法3: Node.js サーバー

独自サーバーを使用する場合：

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ここに API ハンドラーを実装
const contactHandler = require('./api/contact');
app.post('/api/contact', (req, res) => contactHandler(req, res));

app.listen(3000, () => console.log('Server running on port 3000'));
```

## 🔧 フロントエンドの設定

### 開発環境

`.env.local` を作成：
```env
VITE_API_URL=http://localhost:3000/api/contact
```

### 本番環境

`vite.config.ts` でプロキシを設定（オプション）：
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

## 📧 SMTP 設定詳細

| 設定項目 | 値 |
|---------|-----|
| SMTP サーバー | `smtp.zoho.com` |
| ポート (TLS) | `587` |
| ポート (SSL) | `465` |
| ユーザー名 | contact@hatoltd.com |
| パスワード | アプリケーションパスワード |
| 認証 | 必須 |
| TLS/SSL | 必須 |

## 🔒 セキュリティ対策

### reCAPTCHA v3 の追加（推奨）

1. [Google reCAPTCHA](https://www.google.com/recaptcha/admin) でサイトを登録
2. 環境変数に追加：
   ```env
   RECAPTCHA_SECRET_KEY=your-secret-key
   ```
3. フロントエンドにサイトキーを追加
4. API で検証を実装

### レート制限

Vercel/Netlify の組み込み機能または外部サービス（Cloudflare等）を使用して、APIへのリクエスト数を制限することを推奨します。

## 🐛 トラブルシューティング

### 接続エラー
```
Error: connect ETIMEDOUT
```
- ファイアウォール設定を確認
- SMTPポート（587/465）が開いているか確認

### 認証エラー
```
Error: Invalid login
```
- アプリケーションパスワードが正しいか確認
- 2FAが有効になっている場合は必ずアプリパスワードを使用
- Zoho Mailで「セキュリティ → アプリパスワード」から生成

### メールが届かない
1. 迷惑メールフォルダを確認
2. SPF/DKIMレコードをDNSに設定
3. Zoho Mailの送信ログを確認

## 📞 サポート

問題が解決しない場合：
1. Zoho Mail サポート: https://www.zoho.com/mail/help/
2. コンソールログを確認してエラーメッセージを確認

## ✅ チェックリスト

デプロイ前に確認：
- [ ] `.env` ファイルに正しい値が設定されている
- [ ] Zoho Mail でアプリケーションパスワードを生成した
- [ ] APIエンドポイントが正しく動作する（テスト送信）
- [ ] フロントエンドからメールが送信できる
- [ ] 受信メールが正しく届く
- [ ] 自動返信メールが機能する（オプション）
