# 🌼 608 Flores e Floricultura

Site institucional e loja virtual da **608 Flores e Floricultura**, floricultura de bairro localizada em Samambaia Norte, Brasília - DF. O projeto apresenta a história da loja, o catálogo de buquês, a localização e os canais de contato, além de uma área de compras com carrinho e um painel administrativo para gerenciar os produtos.

Desenvolvido como projeto acadêmico, com foco em uma identidade visual natural, elegante e acolhedora, totalmente responsiva e com tema claro e escuro.

## ✨ Funcionalidades

- **Página inicial** com apresentação da floricultura, história do proprietário, destaques do catálogo, depoimentos e contatos
- **Catálogo de buquês** renderizado dinamicamente, com filtro por categoria e indicação de estoque
- **Carrinho de compras** com controle de quantidade, subtotal e finalização do pedido via WhatsApp
- **Localização** com Google Maps incorporado, endereço e horários de funcionamento
- **Login e cadastro** de clientes (simulados no front-end)
- **Painel administrativo** para cadastrar, excluir e editar o preço e o estoque dos produtos
- **Tema claro e escuro** com alternância manual e persistência da escolha
- **Animações sutis** de entrada ao rolar a página e microinterações nos botões e cards
- **Layout responsivo** para celular, tablet e desktop

## 🛠️ Tecnologias

- **HTML5** — estrutura semântica das páginas, formulários, navegação e incorporação do Google Maps
- **CSS3** — variáveis CSS, Flexbox, Grid, media queries, `clamp()`, transições e temas claro/escuro
- **JavaScript (Vanilla)** — manipulação do DOM, `localStorage`, `IntersectionObserver` e lógica da loja e do painel, sem frameworks ou bibliotecas externas
- **Google Fonts** — tipografias Fraunces e Karla

## 📁 Estrutura do projeto

```
├── IMG/                     # Imagens dos produtos e do proprietário
└── PAGINAS/
    ├── home.html            # Página inicial
    ├── vendas.html          # Catálogo e carrinho
    ├── localizacao.html     # Mapa, endereço e horários
    ├── loginpage.html       # Login e cadastro
    ├── admin.html           # Painel administrativo
    ├── STYLE SITE/
    │   └── style.css        # Estilos globais e temas
    └── SCRIPTS/
        ├── script.js        # Tema, menu responsivo e animações de scroll
        ├── produtos.js      # Dados dos produtos (compartilhado entre loja e painel)
        ├── loja.js          # Renderização do catálogo, filtros e carrinho
        ├── admin.js         # Gerenciamento de produtos
        └── login.js         # Abas e formulários de acesso
```

## 🚀 Como executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   ```
2. Adicione as imagens na pasta `IMG/`, com os nomes referenciados nas páginas (`AntonioFoto.avif`, `userlogin.png`, `BuqueGirassol.jpg`, `BuqueGirassol2.webp`, `BuqueLiriosBrancos.jpg`, `BuqueLiriosBrancos2.jpg` e `BuqueRosasVermelhas2.jpg`).
3. Abra o arquivo `PAGINAS/home.html` no navegador ou utilize a extensão **Live Server** do VS Code.

## ⚠️ Observações

- Nesta versão, os dados de produtos, carrinho e tema são armazenados no `localStorage` do navegador, dispensando servidor e banco de dados.
- Os formulários de login e cadastro são apenas demonstrativos, e o painel administrativo não possui autenticação real.
- A estrutura está preparada para uma futura integração com banco de dados.

## 📄 Licença

Projeto desenvolvido para fins acadêmicos.
