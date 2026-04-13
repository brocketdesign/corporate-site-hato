import { useEffect, useRef, useState } from 'react';
import { Twitter, Linkedin, Github, MapPin } from 'lucide-react';

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
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

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const serviceLinks = [
    { label: 'AI開発', href: '#services' },
    { label: 'データ分析', href: '#services' },
    { label: 'コンサルティング', href: '#services' },
    { label: 'システム開発', href: '#services' },
  ];

  const companyLinks = [
    { label: '概要', href: '#about' },
    { label: '沿革', href: '#' },
    { label: 'チーム', href: '#' },
    { label: '採用情報', href: '#' },
  ];

  const resourceLinks = [
    { label: 'ブログ', href: '#' },
    { label: 'ケーススタディ', href: '#' },
    { label: 'お問い合わせ', href: '#contact' },
  ];

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-[#1d2229] pt-20 pb-8 overflow-hidden"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#a1f65e] via-[#524ff5] to-[#a1f65e]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div
            className={`col-span-2 md:col-span-1 transition-all duration-600 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            }`}
          >
            <a href="#" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white">
                HATO <span className="text-[#a1f65e]">Ltd.</span>
              </span>
            </a>
            <p
              className={`text-sm text-[#a1f65e] font-medium mb-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              AIが導く、新しい世界
            </p>
            <p
              className={`text-[#bcbcbc] text-sm leading-relaxed mb-4 transition-all duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ transitionDelay: '300ms' }}
            >
              最先端のAI技術で、ビジネスの未来を創造する
            </p>
            {/* Address */}
            <div
              className={`flex items-start gap-2 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '400ms' }}
            >
              <MapPin className="w-4 h-4 text-[#a1f65e] flex-shrink-0 mt-0.5" />
              <p className="text-[#a1a1a1] text-xs leading-relaxed">
                〒530-0001<br />
                大阪府大阪市北区梅田1-2-2<br />
                大阪駅前第2ビル12-12
              </p>
            </div>
          </div>

          {/* Services Column */}
          <div
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '400ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <h4 className="text-white font-semibold mb-6">サービス</h4>
            <ul className="space-y-3">
              {serviceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#a1a1a1] hover:text-[#a1f65e] transition-all duration-300 hover:translate-x-1 inline-block link-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '500ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <h4 className="text-white font-semibold mb-6">会社情報</h4>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#a1a1a1] hover:text-[#a1f65e] transition-all duration-300 hover:translate-x-1 inline-block link-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Column */}
          <div
            className={`transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '600ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <h4 className="text-white font-semibold mb-6">リソース</h4>
            <ul className="space-y-3">
              {resourceLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-[#a1a1a1] hover:text-[#a1f65e] transition-all duration-300 hover:translate-x-1 inline-block link-underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2c323a] pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright & Legal */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p
                className={`text-[#6a6a6a] text-sm transition-all duration-400 ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transitionDelay: '800ms' }}
              >
                © 2026 合同会社はと. All rights reserved.
              </p>
              <a
                href="/tokusho"
                className={`text-[#6a6a6a] hover:text-[#a1f65e] text-sm transition-all duration-300 whitespace-nowrap ${
                  isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ transitionDelay: '850ms' }}
              >
                特定商取引法に基づく表記
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {[
                { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
                { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
                { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
              ].map((social, index) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-lg bg-[#2c323a] flex items-center justify-center text-[#a1a1a1] hover:bg-[#a1f65e] hover:text-[#1d2229] transition-all duration-300 hover:-translate-y-1 hover:scale-110 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                  }`}
                  style={{
                    transitionDelay: `${900 + index * 100}ms`,
                    transitionTimingFunction: 'var(--ease-elastic)',
                  }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
