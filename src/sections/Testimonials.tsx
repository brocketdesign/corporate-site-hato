import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
}

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const testimonials: Testimonial[] = [
    {
      name: '田中 健一',
      role: 'CEO',
      company: '株式会社テックイノベーション',
      quote: 'AI導入により、業務効率が300%向上しました。はとさんのサポートがなければ、この変革は実現できませんでした。',
      avatar: '/avatar-1.jpg',
    },
    {
      name: '佐藤 美咲',
      role: 'CTO',
      company: 'デジタルソリューションズ株式会社',
      quote: '技術力と対応の速さに常に感動しています。本当に頼れるパートナーです。',
      avatar: '/avatar-2.jpg',
    },
    {
      name: '鈴木 大輔',
      role: '代表取締役',
      company: 'フューチャーラボ株式会社',
      quote: 'データドリブンな意思決定ができるようになり、会社全体が変わりました。',
      avatar: '/avatar-3.jpg',
    },
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full py-24 lg:py-32 bg-[#1d2229] overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-[#a1f65e]/5 blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-[#524ff5]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`inline-flex items-center gap-3 text-sm font-semibold tracking-widest uppercase text-[#a1f65e] mb-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            <span className="w-8 h-0.5 bg-[#a1f65e]" />
            お客様の声
            <span className="w-8 h-0.5 bg-[#a1f65e]" />
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            信頼される<span className="text-[#a1f65e]">パートナー</span>であり続ける
          </h2>
        </div>

        {/* Testimonials Carousel */}
        <div
          className={`relative max-w-4xl mx-auto transition-all duration-800 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
          style={{ transitionDelay: '400ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
        >
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-[#2c323a] to-[#1d2229] rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Quote icon */}
            <div
              className={`absolute -top-6 left-8 w-12 h-12 bg-[#a1f65e] rounded-full flex items-center justify-center transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
              }`}
              style={{ transitionDelay: '600ms', transitionTimingFunction: 'var(--ease-bounce)' }}
            >
              <Quote className="w-6 h-6 text-[#1d2229]" />
            </div>

            {/* Content */}
            <div className="pt-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === activeIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 absolute inset-0 translate-x-8 pointer-events-none'
                  }`}
                >
                  {/* Quote */}
                  <blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#a1f65e]/30"
                    />
                    <div>
                      <p className="text-lg font-semibold text-white">{testimonial.name}</p>
                      <p className="text-[#bcbcbc]">
                        {testimonial.role}, {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-[#2c323a] flex items-center justify-center text-white hover:bg-[#a1f65e] hover:text-[#1d2229] transition-all duration-300 hover:scale-110"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-[#a1f65e] w-8'
                      : 'bg-[#2c323a] hover:bg-[#3c424a]'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-[#2c323a] flex items-center justify-center text-white hover:bg-[#a1f65e] hover:text-[#1d2229] transition-all duration-300 hover:scale-110"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
