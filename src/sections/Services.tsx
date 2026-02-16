import { useEffect, useRef, useState } from 'react';
import { Brain, BarChart3, Network, MessageSquare } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  isVisible: boolean;
}

const ServiceCard = ({ icon, title, description, index, isVisible }: ServiceCardProps) => {
  return (
    <div
      className={`group relative bg-white rounded-2xl p-8 transition-all duration-600 card-hover ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{
        transitionDelay: `${400 + index * 150}ms`,
        transitionTimingFunction: 'var(--ease-expo-out)',
      }}
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#a1f65e] to-[#524ff5] opacity-0 group-hover:opacity-100 transition-opacity duration-400 p-[2px]">
        <div className="w-full h-full bg-white rounded-2xl" />
      </div>

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-16 h-16 rounded-xl bg-[#f0f0f0] flex items-center justify-center mb-6 transition-all duration-400 group-hover:bg-[#a1f65e]/20 group-hover:scale-110 group-hover:rotate-3">
          <div className="text-[#1d2229] group-hover:text-[#a1f65e] transition-colors duration-400">
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-[#1d2229] mb-4 transition-transform duration-400 group-hover:translate-x-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[#6a6a6a] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

const Services = () => {
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AIアプリケーション開発',
      description: '機械学習と深層学習を活用した、業界特化型AIアプリケーションの開発',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'データ分析・予測',
      description: 'ビッグデータを活用した洞察と、正確な将来予測で意思決定を支援',
    },
    {
      icon: <Network className="w-8 h-8" />,
      title: 'システムインテグレーション',
      description: '既存システムとAIのシームレスな連携で、スムーズなデジタル変革を実現',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'コンサルティング',
      description: 'AI導入戦略の立案から運用サポートまで、包括的なコンサルティング',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full py-24 lg:py-32 bg-[#f0f0f0] overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#a1f65e]/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-[#524ff5]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`section-subtitle justify-center mb-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            サービス
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-[#1d2229] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            あなたのビジネスを、
            <span className="text-gradient">次の段階へ</span>
          </h2>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          className={`mt-16 text-center transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ transitionDelay: '1000ms' }}
        >
          <p className="text-[#6a6a6a] mb-6">
            その他、お客様のニーズに合わせたカスタムソリューションも提供しています
          </p>
          <a href="#contact" className="btn-primary inline-flex items-center gap-2">
            <span>無料相談する</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
