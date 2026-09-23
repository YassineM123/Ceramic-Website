import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#17324D] text-white">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-16 lg:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="space-y-6">
            <h3 className="text-2xl font-serif text-[#B86F3B]">Le Monde Céramique</h3>
            <p className="text-white/70 leading-relaxed">
              Céramique artisanale tunisienne pour la table, la maison et les cadeaux élégants.
              <br />
              خزف تونسي يدوي للمائدة والديكور والهدايا.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#075D9A] transition-colors duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#075D9A] transition-colors duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#075D9A] transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-lg font-serif text-[#B86F3B] mb-6">Boutique</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Toutes les collections
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Art de la table
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Café et thé
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Vases décoratifs
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Coffrets cadeaux
                </a>
              </li>
            </ul>
          </div>

          {/* Information Column */}
          <div>
            <h4 className="text-lg font-serif text-[#B86F3B] mb-6">Informations</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Notre histoire
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Artisanat tunisien
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Questions fréquentes
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Livraison en Tunisie
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Paiement sécurisé
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#075D9A] transition-colors duration-300">
                  Confidentialité
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-lg font-serif text-[#B86F3B] mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#075D9A] flex-shrink-0 mt-0.5" />
                <span className="text-white/70">
                  Tunisie<br />
                  Livraison partout en Tunisie
                </span>
              </li>
              <li className="flex gap-3">
                <Phone className="w-5 h-5 text-[#075D9A] flex-shrink-0" />
                <span className="text-white/70">+216 XX XXX XXX</span>
              </li>
              <li className="flex gap-3">
                <Mail className="w-5 h-5 text-[#075D9A] flex-shrink-0" />
                <span className="text-white/70">contact@lemondeceramique.tn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">
              © 2026 Le Monde Céramique. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/50 hover:text-[#075D9A] transition-colors duration-300 text-sm">
                Conditions
              </a>
              <a href="#" className="text-white/50 hover:text-[#075D9A] transition-colors duration-300 text-sm">
                Confidentialité
              </a>
              <a href="#" className="text-white/50 hover:text-[#075D9A] transition-colors duration-300 text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
