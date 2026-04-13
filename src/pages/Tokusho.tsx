const Tokusho = () => {
  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      {/* Header */}
      <header className="bg-[#1d2229]" style={{ borderTop: '4px solid', borderImage: 'linear-gradient(90deg, #a1f65e, #524ff5, #a1f65e) 1' }}>
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-white">
            HATO <span className="text-[#a1f65e]">Ltd.</span>
          </a>
          <a
            href="/"
            className="text-sm text-[#a1a1a1] hover:text-[#a1f65e] transition-colors flex items-center gap-2"
          >
            ← トップページに戻る
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 pb-20">
        {/* Hero */}
        <div className="bg-[#1d2229] rounded-2xl px-10 py-10 mb-10">
          <h1 className="text-2xl font-bold text-white mb-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#a1f65e] mr-3 align-middle" />
            特定商取引法に基づく表記
          </h1>
          <p className="text-sm text-[#a1a1a1]">
            合同会社はとは、特定商取引に関する法律（特定商取引法）第11条に基づき、以下の情報を開示します。
          </p>
        </div>

        {/* Section: 販売業者情報 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="bg-[#1d2229] px-8 py-4">
            <h2 className="text-xs font-semibold text-[#a1f65e] uppercase tracking-widest">販売業者情報</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['販売業者名', '合同会社はと'],
                ['代表者名', 'Dankwart Brockerhoff'],
                ['所在地', <>〒530-0001<br />大阪府大阪市北区梅田1-2-2<br />大阪駅前第2ビル12-12</>],
                ['電話番号', '+81 72-200-3399'],
                ['メールアドレス', <a href="mailto:contact@hatoltd.com" className="text-[#524ff5] hover:underline">contact@hatoltd.com</a>],
                ['サービスURL', <a href="https://hatoltd.com" target="_blank" rel="noopener noreferrer" className="text-[#524ff5] hover:underline">https://hatoltd.com</a>],
              ].map(([label, value], i) => (
                <tr key={i} className={`border-b border-[#f0f0f0] last:border-none ${i % 2 === 1 ? 'bg-[#fafafa]' : ''}`}>
                  <th className="w-52 px-8 py-4 text-left font-semibold text-[#1d2229] align-top whitespace-nowrap">{label}</th>
                  <td className="px-8 py-4 text-[#3a3a3a] leading-relaxed">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section: 商品・サービス */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="bg-[#1d2229] px-8 py-4">
            <h2 className="text-xs font-semibold text-[#a1f65e] uppercase tracking-widest">商品・サービスについて</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['販売商品・サービス', <>AIアプリケーション開発・提供、データ分析・予測サービス、AIチャットボット・カスタマーサポート自動化、BIダッシュボード構築、AIコンサルティングおよびシステム開発。<br />主要プロダクト：Seisei（AI生成コンテンツツール）、RakuAdo（AI広告最適化ツール）、RakuBun（AI記事生成ツール）</>],
                ['販売価格', <>各サービスページに記載の金額（消費税込）。<br />サブスクリプション型サービスについては、プラン選択時に表示される月額または年額料金が適用されます。</>],
                ['商品代金以外の必要料金', 'なし（別途費用が発生する場合は、お申し込み前に明示します）'],
                ['支払方法', 'クレジットカード（Visa・Mastercard・American Express・JCB）、その他Stripeが対応する決済手段'],
                ['支払時期', 'お申し込み手続き完了時にお支払いが確定します。サブスクリプションサービスの場合は、契約開始日および以降の各更新日に自動課金されます。'],
                ['サービス提供時期', 'お支払い確認後、原則として即時にサービスをご利用いただけます。カスタム開発・コンサルティングについては、別途契約書に定める納期に従います。'],
                ['動作環境', '最新バージョンのウェブブラウザ（Google Chrome、Mozilla Firefox、Microsoft Edge、Safari）推奨。インターネット接続環境が必要です。'],
              ].map(([label, value], i) => (
                <tr key={i} className={`border-b border-[#f0f0f0] last:border-none ${i % 2 === 1 ? 'bg-[#fafafa]' : ''}`}>
                  <th className="w-52 px-8 py-4 text-left font-semibold text-[#1d2229] align-top whitespace-nowrap">{label}</th>
                  <td className="px-8 py-4 text-[#3a3a3a] leading-relaxed">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section: キャンセル・返金 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-8">
          <div className="bg-[#1d2229] px-8 py-4">
            <h2 className="text-xs font-semibold text-[#a1f65e] uppercase tracking-widest">キャンセル・返品・返金</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['サブスクリプションの解約', <>マイページまたはメールにてご解約申請いただけます。解約申請が受理された時点の契約期間末日をもってサービスを終了し、翌期以降の課金は発生しません。<br /><small className="text-[#6a6a6a]">※ 期間途中での日割り返金は原則行っておりません。</small></>],
                ['返品・返金について', <>デジタルコンテンツ・ソフトウェアサービスの性質上、お支払い完了後の返品・返金は原則として承っておりません。<br />ただし、当社サービスの重大な瑕疵または法令に基づく場合は、個別にご対応いたします。</>],
                ['お問い合わせ', <>上記に関するご質問は <a href="mailto:contact@hatoltd.com" className="text-[#524ff5] hover:underline">contact@hatoltd.com</a> までメールにてお問い合わせください。</>],
              ].map(([label, value], i) => (
                <tr key={i} className={`border-b border-[#f0f0f0] last:border-none ${i % 2 === 1 ? 'bg-[#fafafa]' : ''}`}>
                  <th className="w-52 px-8 py-4 text-left font-semibold text-[#1d2229] align-top whitespace-nowrap">{label}</th>
                  <td className="px-8 py-4 text-[#3a3a3a] leading-relaxed">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notice */}
        <div className="border-l-4 border-amber-400 bg-amber-50 rounded-r-lg px-5 py-4 text-sm text-amber-900">
          ※ 本ページの内容は予告なく変更する場合があります。最新の情報をご確認ください。
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1d2229] py-8 text-center">
        <p className="text-xs text-[#6a6a6a]">
          © 2026 合同会社はと. All rights reserved. ／{' '}
          <a href="/" className="text-[#a1a1a1] hover:text-[#a1f65e] transition-colors">
            トップページ
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Tokusho;
