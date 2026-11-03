import { Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center font-extrabold text-lg text-gold">
                PX
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-extrabold leading-tight">PrimeX Estate</h3>
                <span className="text-xs font-semibold text-gold tracking-wider">PropertyX</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-6">
              Connecting you to premium properties through data-driven real estate advisory powered by PropertyX Intelligence AI engine.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center hover:bg-gold/30 transition-colors">
                <Facebook className="w-5 h-5 text-gold" />
              </a>
              <a href="#" className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center hover:bg-gold/30 transition-colors">
                <Twitter className="w-5 h-5 text-gold" />
              </a>
              <a href="#" className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center hover:bg-gold/30 transition-colors">
                <Linkedin className="w-5 h-5 text-gold" />
              </a>
              <a href="#" className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center hover:bg-gold/30 transition-colors">
                <Instagram className="w-5 h-5 text-gold" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Home</Link></li>
              <li><Link to="/properties" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Properties</Link></li>
              <li><Link to="/mortgage" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Mortgage Hub</Link></li>
              <li><Link to="/schedule-meeting" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Schedule Meeting</Link></li>
              <li><Link to="/chat" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">InvestX AI Advisor</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold mb-6">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/70 hover:text-gold transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-gold flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">123 Business District, Suite 100, Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">+971 50 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">info@primexestate.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 pt-8 text-center">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} PrimeX Estate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
