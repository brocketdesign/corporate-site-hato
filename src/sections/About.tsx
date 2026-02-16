import { useEffect, useRef, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';

const About = () => {
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
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    '最先端のAI技術による業務効率化',
    'データに基づく意思決定支援',
    'カスタマイズ可能なソリューション',
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative w-full py-24 lg:py-32 bg-[#f0f0f0] overflow-hidden"
    >
      {/* Decorative corner accent */}
      <div
        className={`absolute top-20 right-20 w-24 h-24 border-t-4 border-r-4 border-[#a1f65e]/30 transition-all duration-1000 ${
          isVisible ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
        }`}
        style={{ transitionDelay: '600ms' }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
          {/* Image Column */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <div className="relative overflow-hidden rounded-2xl lg:rounded-r-none">
              <div
                className={`transition-all duration-1200 ${
                  isVisible ? 'scale-100' : 'scale-110'
                }`}
                style={{ transitionTimingFunction: 'var(--ease-smooth)' }}
              >
                <img
                  src="/about-image.jpg"
                  alt="HATO Ltd. Team"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d2229]/30 to-transparent" />
            </div>

            {/* Floating badge */}
            <div
              className={`absolute -bottom-6 -right-6 lg:right-auto lg:-left-6 bg-[#a1f65e] rounded-xl p-6 shadow-xl transition-all duration-800 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '800ms', transitionTimingFunction: 'var(--ease-elastic)' }}
            >
              <p className="text-4xl font-bold text-[#1d2229]">5+</p>
              <p className="text-sm font-medium text-[#1d2229]/80">年の実績</p>
            </div>
          </div>

          {/* Content Column */}
          <div
            className={`relative lg:-ml-16 bg-white rounded-2xl lg:rounded-l-none p-8 lg:p-12 shadow-xl transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
            }`}
            style={{ transitionDelay: '300ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            {/* Subtitle */}
            <div
              className={`mb-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '500ms' }}
            >
              <span className="section-subtitle">会社概要</span>
            </div>

            {/* Title */}
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold text-[#1d2229] mb-6 leading-tight transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '600ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              テクノロジーで、
              <br />
              <span className="text-gradient">もっと良い世界を</span>
            </h2>

            {/* Description */}
            <p
              className={`text-lg text-[#6a6a6a] mb-8 leading-relaxed transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '800ms' }}
            >
              合同会社はとは、AI技術を核としたデジタルソリューションを提供するテクノロジー企業です。私たちは、最新の技術と創造的な発想で、お客様のビジネス課題を解決し、新たな価値を創造します。
            </p>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                  }`}
                  style={{
                    transitionDelay: `${900 + index * 120}ms`,
                    transitionTimingFunction: 'var(--ease-expo-out)',
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-[#a1f65e]/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-[#a1f65e]" />
                  </div>
                  <span className="text-[#1d2229] font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="#contact"
              className={`inline-flex items-center gap-2 text-[#1d2229] font-semibold group transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
              }`}
              style={{ transitionDelay: '1200ms', transitionTimingFunction: 'var(--ease-elastic)' }}
            >
              <span className="link-underline">詳しく見る</span>
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
