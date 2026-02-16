import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

const Hero = () => {
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

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#f0f0f0] flex items-center"
    >
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Shape 1 - Top Right */}
        <div
          className={`absolute top-[10%] right-[5%] w-[350px] h-[350px] rounded-full overflow-hidden opacity-80 transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-80' : 'translate-x-20 opacity-0'
          }`}
          style={{
            animation: 'shape-float 6s ease-in-out infinite',
            transitionDelay: '200ms',
          }}
        >
          <img
            src="/hero-shape-1.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Shape 2 - Bottom Left */}
        <div
          className={`absolute bottom-[15%] left-[3%] w-[280px] h-[280px] rounded-full overflow-hidden opacity-70 transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-70' : '-translate-x-20 opacity-0'
          }`}
          style={{
            animation: 'shape-float 7s ease-in-out infinite',
            animationDelay: '-2s',
            transitionDelay: '400ms',
          }}
        >
          <img
            src="/hero-shape-2.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Shape 3 - Center Right */}
        <div
          className={`absolute top-[50%] right-[15%] w-[200px] h-[200px] rounded-full overflow-hidden opacity-60 transition-all duration-1000 ${
            isVisible ? 'scale-100 opacity-60' : 'scale-50 opacity-0'
          }`}
          style={{
            animation: 'pulse-slow 4s ease-in-out infinite',
            transitionDelay: '600ms',
          }}
        >
          <img
            src="/hero-shape-3.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-[20%] left-[20%] w-[100px] h-[100px] rounded-full bg-[#a1f65e]/20 blur-3xl" />
        <div className="absolute bottom-[30%] right-[25%] w-[150px] h-[150px] rounded-full bg-[#524ff5]/15 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="perspective-1200">
            {/* Subtitle */}
            <div
              className={`flex items-center gap-3 mb-6 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
              style={{ transitionDelay: '0ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              <div
                className={`w-1 h-8 bg-[#a1f65e] transition-all duration-400 ${
                  isVisible ? 'h-8' : 'h-0'
                }`}
                style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
              />
              <span className="text-sm font-semibold tracking-widest uppercase text-[#6a6a6a]">
                合同会社はと
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-8">
              <span
                className={`block text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#1d2229] leading-tight transition-all duration-800 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: '300ms',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  clipPath: isVisible ? 'inset(0)' : 'inset(100% 0 0 0)',
                }}
              >
                AIが導く
              </span>
              <span
                className={`block text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mt-2 transition-all duration-800 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{
                  transitionDelay: '450ms',
                  transitionTimingFunction: 'var(--ease-expo-out)',
                  clipPath: isVisible ? 'inset(0)' : 'inset(100% 0 0 0)',
                }}
              >
                <span className="text-gradient">新しい世界</span>
              </span>
            </h1>

            {/* Description */}
            <p
              className={`text-xl md:text-2xl text-[#6a6a6a] mb-10 max-w-lg leading-relaxed transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: '700ms', transitionTimingFunction: 'var(--ease-smooth)' }}
            >
              最先端のAI技術で、ビジネスの未来を創造する
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-wrap gap-4 transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
              }`}
              style={{ transitionDelay: '900ms', transitionTimingFunction: 'var(--ease-elastic)' }}
            >
              <a
                href="#services"
                className="btn-primary inline-flex items-center gap-2 group"
              >
                <span>サービスを見る</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>お問い合わせ</span>
              </a>
            </div>
          </div>

          {/* Right - Decorative Element */}
          <div className="hidden lg:block relative">
            <div
              className={`relative transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
              }`}
              style={{ transitionDelay: '500ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
            >
              {/* Floating cards */}
              <div
                className="absolute -top-10 right-10 bg-white rounded-2xl p-6 shadow-xl"
                style={{ animation: 'float 5s ease-in-out infinite' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#a1f65e]/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#a1f65e]">AI</span>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a6a6a]">導入企業</p>
                    <p className="text-2xl font-bold text-[#1d2229]">150+</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-10 -left-10 bg-white rounded-2xl p-6 shadow-xl"
                style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '-1s' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#524ff5]/20 flex items-center justify-center">
                    <span className="text-xl font-bold text-[#524ff5]">98%</span>
                  </div>
                  <div>
                    <p className="text-sm text-[#6a6a6a]">顧客満足度</p>
                    <p className="text-lg font-semibold text-[#1d2229]">満足</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f0f0f0] to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;
