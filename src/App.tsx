import Header from './sections/Header'
import Hero from './sections/Hero'
import About from './sections/About'
import Services from './sections/Services'
import Products from './sections/Products'
import Statistics from './sections/Statistics'
import Testimonials from './sections/Testimonials'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import Tokusho from './pages/Tokusho'

const path = window.location.pathname.replace(/\/$/, '')

function App() {
  if (path === '/tokusho') {
    return <Tokusho />
  }

  return (
    <main className="w-full min-h-screen bg-[#f0f0f0] overflow-x-hidden">
      <Header />
      <Hero />
      <About />
      <Services />
      <Products />
      <Statistics />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}

export default App
