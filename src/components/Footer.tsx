import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin, CreditCard, QrCode, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <img src={logo} alt="Tecnoiso" className="h-10 mb-6 brightness-0 invert" />
            <p className="text-background/60 text-sm leading-relaxed mb-6">
              Especialistas em instrumentos de medição e calibração há mais de 20 anos. 
              Produtos de qualidade com garantia e certificação.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-background/10 rounded-xl flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6">Links Rápidos</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/produtos" className="text-background/60 hover:text-primary transition-colors text-sm">
                Todos os Produtos
              </Link>
              <Link to="/ofertas" className="text-background/60 hover:text-primary transition-colors text-sm">
                Ofertas e Promoções
              </Link>
              <Link to="/categorias" className="text-background/60 hover:text-primary transition-colors text-sm">
                Categorias
              </Link>
              <Link to="/sobre" className="text-background/60 hover:text-primary transition-colors text-sm">
                Sobre a Tecnoiso
              </Link>
              <Link to="/contato" className="text-background/60 hover:text-primary transition-colors text-sm">
                Fale Conosco
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-lg mb-6">Categorias</h4>
            <nav className="flex flex-col gap-3">
              <Link to="/produtos?categoria=manometros" className="text-background/60 hover:text-primary transition-colors text-sm">
                Manômetros
              </Link>
              <Link to="/produtos?categoria=termometros" className="text-background/60 hover:text-primary transition-colors text-sm">
                Termômetros
              </Link>
              <Link to="/produtos?categoria=balancas" className="text-background/60 hover:text-primary transition-colors text-sm">
                Balanças
              </Link>
              <Link to="/produtos?categoria=paquimetros" className="text-background/60 hover:text-primary transition-colors text-sm">
                Paquímetros e Micrômetros
              </Link>
              <Link to="/produtos?categoria=multimetros" className="text-background/60 hover:text-primary transition-colors text-sm">
                Multímetros
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6">Contato</h4>
            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-background/60">
                  R. Dona Emma, 1541 - Floresta<br />
                  Joinville - SC, 89211-493
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-background/60">(47) 3438-3175</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-background/60">contato@tecnoiso.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-background/60">Seg-Sex: 07:42 - 17:30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Security */}
        <div className="border-t border-background/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-background/60">
                <QrCode className="w-5 h-5" />
                PIX
              </div>
              <div className="flex items-center gap-2 text-sm text-background/60">
                <CreditCard className="w-5 h-5" />
                Cartão de Crédito
              </div>
              <div className="flex items-center gap-2 text-sm text-background/60">
                <ShieldCheck className="w-5 h-5" />
                Compra Segura
              </div>
            </div>
            <p className="text-sm text-background/40">
              © 2024 Tecnoiso. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
