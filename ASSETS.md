# Assets e procedência

Figma: https://www.figma.com/design/Ff0SksUi7UFtPWUO8kyNtw/Frontend-Challenge

| Arquivo utilizado          | Camada e origem                                                               |
| -------------------------- | ----------------------------------------------------------------------------- |
| `public/assets/ape-1.webp` | NFT Artwork 03 / Emerald Ape; hash `8459204731e6eba9d474cbc8ebc37071360d3ba5` |
| `public/assets/ape-2.webp` | NFT Artwork 04 / Sage Nomad; hash `2986a7cb16d09de8970824d2dd58bf0bb021702c`  |
| `public/assets/ape-3.webp` | NFT Artwork 05 / Neon Vessel; hash `9df2ff42dd27ba657621c304557d1a855a4be6a5` |
| `public/assets/ape-4.webp` | NFT Artwork 09 / Golden Beat; hash `87580f2def9af0ce13f4b6f6ce17bb2449bcfc16` |
| Fonte IBM Plex Mono        | @fontsource/ibm-plex-mono, distribuída localmente no build                    |
| Ícones                     | lucide-react; favicon SVG local                                               |

As quatro imagens são originais do arquivo Figma. As três primeiras foram salvas a partir dos PNGs exibidos pela prévia oficial de exportação das camadas, pois o download comum não concluía. Os PNGs dessa prévia estão preservados em `design/assets/figma-ape-1.png` até `figma-ape-3.png` e têm 291×291 pixels. Os WebP de execução têm 640×640; ampliá-los não cria detalhe adicional. Em telas de alta densidade, uma exportação dos arquivos brutos em maior resolução pode melhorar a nitidez. Golden Beat foi obtido pelo download integral do PNG, com 1254×1254 pixels.

As versões geradas inicialmente por ImageGen foram substituídas e não são consumidas pela aplicação final. Todas as imagens e fontes usadas em execução são locais, sem dependência de CDN.
