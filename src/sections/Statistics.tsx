import { useEffect, useRef, useState } from 'react';

interface StatItemProps {
  value: string;
  label: string;
  suffix?: string;
  index: number;
  isVisible: boolean;
}

const StatItem = ({ value, label, suffix = '', index, isVisible }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value.replace(/\D/g, ''), 10);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.floor(increment * step), numericValue);
      setCount(current);

      if (step >= steps) {
        clearInterval(timer);
        setCount(numericValue);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, numericValue]);

  return (
    <div
      className={`relative flex flex-col items-center text-center transition-all duration-600 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
      }`}
      style={{
        transitionDelay: `${index * 150}ms`,
        transitionTimingFunction: 'var(--ease-elastic)',
      }}
    >
      {/* Circular progress ring */}
      <div className="relative mb-6">
        <svg width="150" height="150" className="transform -rotate-90">
          {/* Background ring */}
          <circle
            cx="75"
            cy="75"
            r="70"
            fill="none"
            stroke="#2c323a"
            strokeWidth="4"
          />
          {/* Progress ring */}
          <circle
            cx="75"
            cy="75"
            r="70"
            fill="none"
            stroke="#a1f65e"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="440"
            strokeDashoffset={isVisible ? 440 - (440 * (count / numericValue || 1)) : 440}
            className="transition-all duration-1500"
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          />
        </svg>
        
        {/* Value in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-4xl md:text-5xl font-bold text-[#1d2229]"
            style={{
              animation: isVisible ? 'numberGlow 4s ease-in-out infinite' : 'none',
            }}
          >
            {value.includes('+') ? count + '+' : value.includes('x') ? count + 'x' : count + suffix}
          </span>
        </div>
      </div>

      {/* Label */}
      <p className="text-lg text-[#6a6a6a] font-medium">{label}</p>
    </div>
  );
};

const Statistics = () => {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '150+', label: '導入企業数', suffix: '+' },
    { value: '98%', label: '顧客満足度', suffix: '%' },
    { value: '24/7', label: 'サポート体制', suffix: '' },
    { value: '3x', label: '業務効率向上', suffix: 'x' },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-24 lg:py-32 bg-[#f0f0f0] overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-[#a1f65e]/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`section-subtitle justify-center mb-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            実績
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-[#1d2229] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            数字で見る、<span className="text-gradient">私たちの成果</span>
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={index}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes numberGlow {
          0%, 100% { text-shadow: 0 0 0 transparent; }
          50% { text-shadow: 0 0 20px rgba(161, 246, 94, 0.3); }
        }
      `}</style>
    </section>
  );
};

export default Statistics;
