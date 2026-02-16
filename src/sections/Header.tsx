import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const navItems = [
    { id: 'about', label: '会社概要', labelEn: 'About' },
    { id: 'services', label: 'サービス', labelEn: 'Services' },
    { id: 'products', label: 'プロダクト', labelEn: 'Products' },
    { id: 'contact', label: 'お問い合わせ', labelEn: 'Contact' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Detect active section
      const sections = navItems.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#f0f0f0]/80 backdrop-blur-xl shadow-lg shadow-[#1d2229]/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="relative group"
            >
              <div className="flex items-center gap-3">
                {/* Logo Mark */}
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-[#a1f65e] rounded-xl transform rotate-3 transition-transform duration-300 group-hover:rotate-6" />
                  <div className="absolute inset-0 bg-[#1d2229] rounded-xl flex items-center justify-center transform -rotate-3 transition-transform duration-300 group-hover:-rotate-6">
                    <span className="text-white font-bold text-lg">H</span>
                  </div>
                </div>
                {/* Logo Text */}
                <div className="flex flex-col">
                  <span className="text-[#1d2229] font-bold text-lg tracking-tight">
                    合同会社はと
                  </span>
                  <span className="text-[#6a6a6a] text-xs tracking-widest uppercase">
                    HATO Ltd.
                  </span>
                </div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                    activeSection === item.id
                      ? 'text-[#1d2229]'
                      : 'text-[#6a6a6a] hover:text-[#1d2229]'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-1">
                    {item.label}
                    <span className="text-[10px] opacity-50">{item.labelEn}</span>
                  </span>
                  {/* Active indicator */}
                  {activeSection === item.id && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#a1f65e] rounded-full" />
                  )}
                  {/* Hover effect */}
                  <span className="absolute inset-0 bg-[#a1f65e]/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
                </button>
              ))}

              {/* CTA Button */}
              <button
                onClick={() => scrollToSection('contact')}
                className="ml-4 relative overflow-hidden group bg-[#1d2229] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#524ff5]/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  無料相談
                  <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-[#524ff5] to-[#a1f65e] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden relative w-10 h-10 flex items-center justify-center rounded-xl transition-colors duration-300 hover:bg-[#1d2229]/5"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-[#1d2229] rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'top-3 rotate-45' : 'top-1'
                  }`}
                />
                <span
                  className={`absolute left-0 top-3 w-6 h-0.5 bg-[#1d2229] rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                <span
                  className={`absolute left-0 w-6 h-0.5 bg-[#1d2229] rounded-full transition-all duration-300 ${
                    isMobileMenuOpen ? 'top-3 -rotate-45' : 'top-5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d2229]/5">
          <div
            className="h-full bg-gradient-to-r from-[#a1f65e] to-[#524ff5] transition-all duration-150"
            style={{
              width: `${(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%`
            }}
          />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#1d2229]/60 backdrop-blur-sm transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute top-0 right-0 w-full max-w-sm h-full bg-[#f0f0f0] shadow-2xl transition-transform duration-500 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 pb-8 px-6">
            {/* Mobile Nav Items */}
            <nav className="flex-1 space-y-2">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 group ${
                    activeSection === item.id
                      ? 'bg-[#a1f65e]/20 text-[#1d2229]'
                      : 'text-[#6a6a6a] hover:bg-[#1d2229]/5 hover:text-[#1d2229]'
                  }`}
                  style={{
                    transitionDelay: isMobileMenuOpen ? `${index * 75}ms` : '0ms'
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg">{item.label}</span>
                    <span className="text-xs opacity-60">{item.labelEn}</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </button>
              ))}
            </nav>

            {/* Mobile CTA */}
            <div className="pt-6 border-t border-[#1d2229]/10">
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full bg-[#1d2229] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#524ff5] transition-colors duration-300"
              >
                <span>無料相談はこちら</span>
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>

            {/* Company Info */}
            <div className="mt-6 text-center">
              <p className="text-[#1d2229] font-bold">合同会社はと</p>
              <p className="text-[#6a6a6a] text-sm">HATO Ltd.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
