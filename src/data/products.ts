import { Product, Category } from "@/types/product";

// Importe suas imagens aqui - mesma pasta (src/data/)
import manometro1 from "./manometro-1.jpg";
import termometro1 from "./termometro-1.jpg";
import balanca1 from "./balanca-1.jpg";
import paquimetro1 from "./paquimetro-1.jpg";
import multimetro1 from "./multimetro-1.jpg";

export const categories: Category[] = [
  { id: "manometros", name: "Manômetros", icon: "Gauge", productCount: 1 },
  { id: "termometros", name: "Termômetros", icon: "Thermometer", productCount: 1 },
  { id: "balancas", name: "Balanças", icon: "Scale", productCount: 1 },
  { id: "paquimetros", name: "Paquímetros", icon: "Ruler", productCount: 1 },
  { id: "multimetros", name: "Multímetros", icon: "Zap", productCount: 1 },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Manômetro Digital de Precisão MDT-1000",
    description: "Manômetro digital profissional com display LCD retroiluminado, alta precisão para aplicações industriais e laboratoriais.",
    price: 1299.90,
    originalPrice: 1599.90,
    image: manometro1,
    category: "Manômetros",
    inStock: true,
    discount: 19,
    rating: 4.8,
    reviews: 120,
    specifications: {
      "Faixa de Medição": "0-1000 bar",
      "Precisão": "±0.1%",
      "Conexão": "1/4 NPT",
      "Material": "Aço Inox 316",
    },
  },
  {
    id: "2",
    name: "Termômetro Infravermelho TI-850 Pro",
    description: "Termômetro infravermelho industrial sem contato, ideal para medições de temperatura em ambientes de difícil acesso.",
    price: 899.90,
    originalPrice: 1099.90,
    image: termometro1,
    category: "Termômetros",
    inStock: true,
    discount: 18,
    rating: 4.6,
    reviews: 89,
    specifications: {
      "Faixa": "-50°C a 850°C",
      "Precisão": "±1.5%",
      "Emissividade": "Ajustável 0.1-1.0",
      "Resposta": "< 500ms",
    },
  },
  {
    id: "3",
    name: "Balança Analítica BA-220 Premium",
    description: "Balança de precisão analítica com calibração interna automática, câmara de pesagem e proteção contra correntes de ar.",
    price: 2499.90,
    image: balanca1,
    category: "Balanças",
    inStock: true,
    rating: 4.9,
    reviews: 156,
    specifications: {
      "Capacidade": "220g",
      "Legibilidade": "0.0001g",
      "Calibração": "Interna automática",
      "Proteção": "Câmara de pesagem",
    },
  },
  {
    id: "4",
    name: "Paquímetro Digital 150mm Inox",
    description: "Paquímetro digital profissional em aço inoxidável temperado com display LCD de alta visibilidade e precisão absoluta.",
    price: 189.90,
    originalPrice: 249.90,
    image: paquimetro1,
    category: "Paquímetros",
    inStock: true,
    discount: 24,
    rating: 4.7,
    reviews: 234,
    specifications: {
      "Faixa": "0-150mm",
      "Resolução": "0.01mm",
      "Material": "Aço Inox Temperado",
      "Bateria": "CR2032 (inclusa)",
    },
  },
  {
    id: "5",
    name: "Multímetro Digital True RMS MT-900",
    description: "Multímetro digital profissional True RMS com capacidade de medir tensão, corrente, resistência, capacitância e temperatura.",
    price: 389.90,
    image: multimetro1,
    category: "Multímetros",
    inStock: true,
    rating: 4.6,
    reviews: 145,
    specifications: {
      "Tensão DC": "0-1000V",
      "Corrente DC": "0-10A",
      "Resistência": "0-60MΩ",
      "Certificação": "CAT III 1000V",
    },
  },
];