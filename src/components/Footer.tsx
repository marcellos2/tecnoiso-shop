import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <img src={logo} alt="Tecnoiso" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-background/70 text-sm leading-relaxed">
              Especialistas em calibração de equipamentos de medição com certificados 
              rastreáveis ao INMETRO. Mais de 20 anos de experiência no mercado.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-background/70 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Links Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/produtos" className="text-background/70 hover:text-primary transition-colors text-sm">
                Produtos
              </Link>
              <Link to="/servicos" className="text-background/70 hover:text-primary transition-colors text-sm">
                Serviços de Calibração
              </Link>
              <Link to="/sobre" className="text-background/70 hover:text-primary transition-colors text-sm">
                Sobre a Tecnoiso
              </Link>
              <Link to="/contato" className="text-background/70 hover:text-primary transition-colors text-sm">
                Fale Conosco
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Categorias</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/produtos?categoria=manometros" className="text-background/70 hover:text-primary transition-colors text-sm">
                Manômetros
              </Link>
              <Link to="/produtos?categoria=termometros" className="text-background/70 hover:text-primary transition-colors text-sm">
                Termômetros
              </Link>
              <Link to="/produtos?categoria=balancas" className="text-background/70 hover:text-primary transition-colors text-sm">
                Balanças
              </Link>
              <Link to="/produtos?categoria=paquimetros" className="text-background/70 hover:text-primary transition-colors text-sm">
                Paquímetros
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Contato</h4>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-background/70">
                  R. Dona Emma, 1541 - Floresta<br />
                  Joinville - SC, 89211-493
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-background/70">(47) 3438-3175</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-background/70">contato@tecnoiso.com.br</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-background/70">Seg-Sex: 07:42 - 17:30</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/50">
          <p>© 2024 Tecnoiso. Todos os direitos reservados. CNPJ: XX.XXX.XXX/0001-XX</p>
          <p className="mt-2">Pagamentos seguros com PIX, Cartão de Crédito e Boleto</p>
        </div>
      </div>
    </footer>
  );
}
