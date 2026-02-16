import { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Determine API endpoint based on environment
      const apiUrl = import.meta.env.VITE_API_URL || '/api/contact';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'メールの送信に失敗しました');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: 'メール',
      value: 'contact@hatoltd.com',
      href: 'mailto:contact@hatoltd.com',
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: '電話',
      value: '03-XXXX-XXXX',
      href: 'tel:03-XXXX-XXXX',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: '本店住所',
      value: '大阪府大阪市北区梅田1-2-2 大阪駅前第2ビル12-12',
      displayValue: '大阪府大阪市北区梅田\n1-2-2 大阪駅前第2ビル12-12',
      href: 'https://maps.google.com/?q=大阪府大阪市北区梅田1丁目2番2号',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full py-24 lg:py-32 bg-[#f0f0f0] overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-[#a1f65e]/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[#524ff5]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={`section-subtitle justify-center mb-4 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
          >
            お問い合わせ
          </span>
          <h2
            className={`text-3xl md:text-4xl lg:text-5xl font-bold text-[#1d2229] transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            まずは<span className="text-gradient">話を聞かせてください</span>
          </h2>
          <p
            className={`mt-4 text-lg text-[#6a6a6a] max-w-2xl mx-auto transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            あなたのビジネス課題を、一緒に解決していきましょう。
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-0">
          {/* Left Panel - Contact Info */}
          <div
            className={`lg:col-span-2 bg-[#1d2229] rounded-2xl lg:rounded-r-none p-8 lg:p-12 transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-24'
            }`}
            style={{ transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              お問い合わせ先
            </h3>
            <p className="text-[#bcbcbc] mb-8 leading-relaxed">
              どんな小さなご質問でも、お気軽にお問い合わせください。24時間以内にご返信いたします。
            </p>

            {/* Contact Items */}
            <ul className="space-y-6">
              {contactInfo.map((item, index) => (
                <li
                  key={index}
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-5'
                  }`}
                  style={{ transitionDelay: `${500 + index * 100}ms` }}
                >
                  <a
                    href={item.href}
                    target={item.label === '本店住所' ? '_blank' : undefined}
                    rel={item.label === '本店住所' ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#2c323a] flex items-center justify-center text-[#a1f65e] group-hover:bg-[#a1f65e] group-hover:text-[#1d2229] transition-all duration-300 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm text-[#bcbcbc]">{item.label}</p>
                      <p className="text-white font-medium group-hover:text-[#a1f65e] transition-colors duration-300 whitespace-pre-line">
                        {item.displayValue || item.value}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="mt-10 pt-8 border-t border-[#2c323a]">
              <p className="text-sm text-[#bcbcbc] mb-4">フォローする</p>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social, index) => (
                  <a
                    key={social}
                    href="#"
                    className={`w-10 h-10 rounded-lg bg-[#2c323a] flex items-center justify-center text-[#bcbcbc] hover:bg-[#a1f65e] hover:text-[#1d2229] transition-all duration-300 hover:-translate-y-1 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                    style={{
                      transitionDelay: `${800 + index * 100}ms`,
                      transitionTimingFunction: 'var(--ease-elastic)',
                    }}
                  >
                    <span className="text-xs font-bold">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div
            className={`lg:col-span-3 bg-white rounded-2xl lg:rounded-l-none lg:-ml-4 p-8 lg:p-12 shadow-xl transition-all duration-800 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'
            }`}
            style={{ transitionDelay: '200ms', transitionTimingFunction: 'var(--ease-expo-out)' }}
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-[#a1f65e]/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-[#a1f65e]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1d2229] mb-4">
                  お問い合わせありがとうございます
                </h3>
                <p className="text-[#6a6a6a]">
                  24時間以内にご返信いたします。
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-[#524ff5] font-medium hover:underline"
                >
                  新しいお問い合わせ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div
                    className={`relative transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '400ms' }}
                  >
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-[#f0f0f0] rounded-lg border-2 border-transparent focus:border-[#a1f65e] focus:bg-white outline-none transition-all duration-300 peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-4 text-[#6a6a6a] transition-all duration-300 peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-[#a1f65e] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs">
                      お名前 *
                    </label>
                  </div>

                  {/* Email */}
                  <div
                    className={`relative transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: '480ms' }}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-4 bg-[#f0f0f0] rounded-lg border-2 border-transparent focus:border-[#a1f65e] focus:bg-white outline-none transition-all duration-300 peer"
                      placeholder=" "
                    />
                    <label className="absolute left-4 top-4 text-[#6a6a6a] transition-all duration-300 peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-[#a1f65e] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs">
                      メールアドレス *
                    </label>
                  </div>
                </div>

                {/* Company */}
                <div
                  className={`relative transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '560ms' }}
                >
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-[#f0f0f0] rounded-lg border-2 border-transparent focus:border-[#a1f65e] focus:bg-white outline-none transition-all duration-300 peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-4 text-[#6a6a6a] transition-all duration-300 peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-[#a1f65e] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs">
                    会社名
                  </label>
                </div>

                {/* Message */}
                <div
                  className={`relative transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: '640ms' }}
                >
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-4 bg-[#f0f0f0] rounded-lg border-2 border-transparent focus:border-[#a1f65e] focus:bg-white outline-none transition-all duration-300 resize-none peer"
                    placeholder=" "
                  />
                  <label className="absolute left-4 top-4 text-[#6a6a6a] transition-all duration-300 peer-focus:-translate-y-7 peer-focus:text-xs peer-focus:text-[#a1f65e] peer-[:not(:placeholder-shown)]:-translate-y-7 peer-[:not(:placeholder-shown)]:text-xs">
                    お問い合わせ内容 *
                  </label>
                </div>

                {/* Submit */}
                <div
                  className={`transition-all duration-500 ${
                    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-80'
                  }`}
                  style={{ transitionDelay: '720ms', transitionTimingFunction: 'var(--ease-elastic)' }}
                >
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-[#1d2229]/30 border-t-[#1d2229] rounded-full animate-spin" />
                        <span>送信中...</span>
                      </>
                    ) : (
                      <>
                        <span>送信する</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
