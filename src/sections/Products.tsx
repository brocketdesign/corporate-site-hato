import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sparkles, TrendingUp, Zap, BarChart2, Shield } from 'lucide-react';

const Products = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const seiseiFeatures = [
    { icon: <Sparkles className="w-5 h-5" />, text: 'テキストから画像生成' },
    { icon: <Zap className="w-5 h-5" />, text: '自動文章作成' },
    { icon: <Shield className="w-5 h-5" />, text: 'マルチリンガル対応' },
  ];

  const rakuadoFeatures = [
    { icon: <TrendingUp className="w-5 h-5" />, text: '自動入札調整' },
    { icon: <BarChart2 className="w-5 h-5" />, text: 'パフォーマンス分析' },
    { icon: <Shield className="w-5 h-5" />, text: '予算最適化' },
  ];

  return (
    <section
      ref={sectionRef}
      id="products"
      className="relative w-full py-24 lg:py-32 bg-[#f0f0f0] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span
            className={`section-subtitle justify-center mb-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            プロダクト
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-[#1d2229] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            私たちが作る、<span className="text-gradient">未来のツール</span>
          </h2>
        </div>

        {/* Product 1: Seisei */}
        <div className="grid lg:grid-cols-2 gap-0 mb-20 rounded-3xl overflow-hidden shadow-2xl">
          {/* Image */}
          <div
            className={`relative overflow-hidden transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <div className="relative h-[400px] lg:h-full">
              <img
                src="/product-seisei.jpg"
                alt="生成 (Seisei) - AI Creative Platform"
                className="w-full h-full object-cover transition-transform duration-600 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1d2229]/20" />
            </div>
          </div>

          {/* Content */}
          <div
            className={`bg-[#1d2229] p-8 lg:p-12 flex flex-col justify-center transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
            }`}
            style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <div className="mb-2">
              <span className="text-[#a1f65e] text-sm font-semibold tracking-wider uppercase">
                AI Creative Platform
              </span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              生成 <span className="text-[#a1f65e]">(Seisei)</span>
            </h3>
            <p className="text-xl text-white/80 mb-2">
              AIが生み出す、無限のクリエイティブ
            </p>
            <p className="text-[#bcbcbc] mb-8 leading-relaxed">
              生成AIを活用した、次世代のコンテンツ制作プラットフォーム。テキストから画像を生成し、自動で文章を作成。創作の可能性を広げます。
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {seiseiFeatures.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-3 text-white/90 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <span className="text-[#a1f65e]">{feature.icon}</span>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="https://www.seisei.me"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 bg-[#a1f65e] text-[#1d2229] px-6 py-3 rounded-lg font-semibold w-fit transition-all duration-400 hover:bg-[#8ee048] hover:scale-105 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
              }`}
              style={{ transitionDelay: '900ms', transitionTimingFunction: 'var(--ease-elastic)' }}
            >
              <span>詳しく見る</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Product 2: Rakuado */}
        <div className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl">
          {/* Content (Left on desktop) */}
          <div
            className={`bg-[#2c323a] p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1 transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
            }`}
            style={{ transitionDelay: '400ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <div className="mb-2">
              <span className="text-[#524ff5] text-sm font-semibold tracking-wider uppercase">
                Ad Network Platform
              </span>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              楽アド <span className="text-[#524ff5]">(Rakuado)</span>
            </h3>
            <p className="text-xl text-white/80 mb-2">
              広告運用を、もっと簡単に
            </p>
            <p className="text-[#bcbcbc] mb-8 leading-relaxed">
              AIが最適化する、スマート広告運用プラットフォーム。自動入札調整とパフォーマンス分析で、広告効果を最大化します。
            </p>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {rakuadoFeatures.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-3 text-white/90 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ transitionDelay: `${800 + index * 100}ms` }}
                >
                  <span className="text-[#524ff5]">{feature.icon}</span>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="https://app.rakuado.net"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 bg-[#524ff5] text-white px-6 py-3 rounded-lg font-semibold w-fit transition-all duration-400 hover:bg-[#413ee0] hover:scale-105 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
              }`}
              style={{ transitionDelay: '1100ms', transitionTimingFunction: 'var(--ease-elastic)' }}
            >
              <span>詳しく見る</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Image (Right on desktop) */}
          <div
            className={`relative overflow-hidden order-1 lg:order-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
            }`}
            style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <div className="relative h-[400px] lg:h-full">
              <img
                src="/product-rakuado.jpg"
                alt="楽アド (Rakuado) - Ad Network Platform"
                className="w-full h-full object-cover transition-transform duration-600 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#2c323a]/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Products;
