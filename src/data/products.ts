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
    name: "Relógio Manômetro de Pressão até 500psi / 35bar",
    description: "Relógio / Manômetro Importado Pressão suportada - até 500 psi / 35 bar Rosca BSP de 1/4 Com Glicerina",
    price: 63.32,
    originalPrice: 89.90,
    image: manometro1,
    category: "Manômetros",
    inStock: true,
    discount: 19,
    rating: 4.8,
    reviews: 120,
    specifications: {
      "Fabricante": "enérico",
      "Referência do fabricante": "até 500 psi/ 35 bar",
      "ASIN": "B0DBWTQDCZ",
      "Certificação": "Não se aplica",
    },
  },
  {
    id: "2",
    name: "Termômetro Digital Infravermelho Culinário com Laser -50ºC a 400ºC - Alta Precisão, Sem Contato, Para Assados, Frituras e Alimentos",
    description: "Eleve sua experiência culinária com o Termômetro Digital Infravermelho com Caneta Laser, desenvolvido para medições precisas de temperatura em alimentos sem a necessidade de contato físico. Com ampla faixa de leitura de -50ºC a 400ºC, é ideal para diversas aplicações culinárias como frituras, assados e controle de temperatura de superfícies quentes. Com margem de erro de apenas 1,5ºC, garante alto nível de precisão, sendo perfeito tanto para chefs profissionais quanto cozinheiros amadores. A caneta laser integrada permite apontar com exatidão para a área de medição, tornando a leitura ainda mais eficiente. Seu design ergonômico e leve facilita o manuseio, enquanto o display digital proporciona leitura clara e instantânea. O sistema de desligamento automático conserva a bateria, oferecendo praticidade no uso diário. Seja para controlar o ponto da carne, verificar a temperatura do óleo da fritura ou medir superfícies quentes sem contato, este termômetro é uma ferramenta essencial na sua cozinha. Garanta maior segurança alimentar e resultados mais precisos nas suas receitas!",
    price: 65.99,
    originalPrice: 129.90,
    image: termometro1,
    category: "Termômetros",
    inStock: true,
    discount: 18,
    rating: 4.6,
    reviews: 89,
    specifications: {
      "Marca": "Genérico",
      "Características especiais": "Alta precisão, Sem contato",
      "Componentes incluídos": "1 Termômetro Digital",
      "Tipo de visor": "digital",
    },
  },
  {
    id: "3",
    name: "Gourmet Mix Balança de Cozinha Digital de Precisão até 10Kg Compacta para Receitas Doces e Salgadas, artesanato, delivery e laboratórios",
    description: "Precisão e praticidade para receitas que exigem exatidão A Balança de Cozinha Digital de Precisão 10Kg GOURMET MIX é um equipamento versátil, desenvolvida para quem precisa de medições confiáveis em diferentes aplicações. Além de ser amplamente utilizada no preparo de receitas culinárias e confeitaria, ela também é muito procurada para artesanatos, rotinas de delivery e uso em pequenos laboratórios, onde a precisão é essencial. Seu funcionamento é simples e intuitivo: basta ligar, posicionar o item sobre a base e visualizar o peso de forma rápida e clara. Essa praticidade torna a balança ideal tanto para uso doméstico quanto profissional. Compacta e leve, facilita o transporte, o armazenamento e a limpeza diária, sendo uma excelente escolha para quem busca precisão, praticidade e versatilidade em um único produto. Diferenciais do produto Alta precisão para receitas que exigem medidas exatas Capacidade máxima de até 10 kg Operação simples e intuitiva Leve, compacta e fácil de transportar Ideal para uso doméstico ou profissional Fácil de limpar e conservar Informações técnicas Marca: Gourmet Mix Referência: GX8002 Material: Polipropileno Peso do produto: 0,332 kg Dimensões (CxLxA): 17 x 24 x 3,5 cm Alimentação: 2 pilhas AAA (não inclusas) Recomendações de uso e limpeza Para a limpeza, utilize apenas um pano seco e macio. Caso necessário, use um pano levemente umedecido com água e sabão neutro. Não utilize produtos químicos, pois podem comprometer o acabamento e o funcionamento do produto.",
    price: 19.00,
    originalPrice: 30.99,
    image: balanca1,
    category: "Balanças",
    inStock: true,
    rating: 4.9,
    reviews: 156,
    specifications: {
      "Nome da marca": "Gourmet Mix",
      "Fabricante": "Marcamix",
      "Modelo": "GX8002",
      "Cor": "Branco",
    },
  },
  {
    id: "4",
    name: "MTX Paquímetro Digital 150Mm 6 Pol Em Aço Inoxidável Alta Precisão Com Display LCD Para Medições Internas E Externas Estojo Plástico De Proteção Ideal Para Uso Profissional Em Oficinas E Manutenção",
    description: "Paquímetro digital profissional em aço inoxidável temperado com display LCD de alta visibilidade e precisão absoluta.",
    price: 69.89,
    originalPrice: 89.99,
    image: paquimetro1,
    category: "Paquímetros",
    inStock: true,
    discount: 24,
    rating: 4.7,
    reviews: 234,
    specifications: {
      "Marca": "Mtx",
      "Faixa": "150 millimeters",
      "Material": "Aço Inox Temperado",
      "Precisão da medição": "<0.01mm",
    },
  },
  {
    id: "5",
    name: "Multímetro Digital Portátil Profissional Corrente Ac + Dc Tensão 200M~600V Bateria 9V Teste Bipe",
    description: "O Multímetro é uma ferramenta essencial e indispensável para profissionais que trabalham com equipamentos eletrônicos, ideal para laboratórios, oficinas, bricolagem, uso doméstico, entre outros.Ele auxilia o técnico nas medições evitando possíveis descargas elétricas e a queima dos componentes, é portátil, com fusível de auto restauração, teste de linha viva, holster protetor, congelamento de leitura, desligamento automático e mudança de faixa manual. Realiza medidas de tensão DC e AC, corrente DC e AC, resistência e testes de linha viva, hFE de transistor, diodo e continuidade.Com esse multímetro, poderá realizar medições precisas de várias maneiras e em várias escalas, conta com suporte acoplado de mesa e devido ser um aparelho digital, possui LCD de 3 ½ dígitos com iluminação de fundo e bateria 9v e aviso (Beep) sonoro.",
    price: 29.99,
    originalPrice: 59.99,
    image: multimetro1,
    category: "Multímetros",
    inStock: true,
    rating: 4.6,
    reviews: 145,
    specifications: {
      "Fabricante": "BWX",
      "Referência do fabricante": "YAMOOCO",
      "Dimensões do produto": "15 x 10 x 5 cm; 400 g",
      "ASIN": "B09SFH7SLJ",
      "cor" : "azul",
    },
  },
];