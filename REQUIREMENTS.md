# Mapa da implementação

| Requisito                                         | Arquivo principal / evidência                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------ |
| React, TypeScript, Tailwind, shadcn/ui            | `src/main.tsx`, `src/styles.css`, `src/components/ui`, `components.json` |
| Rotas, parâmetros e proteção                      | `src/router.tsx`                                                         |
| Catálogo, filtros combinados, detalhe, favoritos  | `src/pages/catalog.tsx`                                                  |
| Carrinho, cupom, cotação, checkout e recibo       | `src/pages/commerce.tsx`                                                 |
| Login, cadastro, perfil, avatar, senha, carteiras | `src/pages/account.tsx`                                                  |
| Axios, Query, cancelamento, invalidação           | `src/api.ts` e queries das páginas                                       |
| Cálculos exatos ETH                               | `src/domain.ts`, `src/domain.test.ts`                                    |
| Contratos e banco simulado                        | `src/domain.ts`, `src/mocks/db.ts`                                       |
| REST e cenários MSW                               | `src/mocks/handlers.ts`                                                  |
| Socket.IO real com MSW                            | `src/realtime.ts`, `src/mocks/realtime.ts`                               |
| Idempotência, snapshot e recuperação              | handler `/orders`, Checkout, OrderPage                                   |
| Diálogos, foco, teclado                           | `src/components/ui/dialog.tsx`, teste de foco                            |
| E2E desktop/mobile                                | `tests/marketplace.spec.ts`                                              |
| Regressão visual                                  | `tests/visual.spec.ts` e baselines                                       |
| Lighthouse e medianas                             | `scripts/audit.mjs`, `reports/lighthouse`                                |
| Deploy SPA                                        | `vercel.json`, `public/_redirects`, `.openai/hosting.json`               |

Pendências de preparação para envio: comparar todos os espaçamentos com Figma; conferir a resolução das artes exportadas pela prévia do Figma; definir repositório externo e audiência pública do deploy. A existência deste mapa não substitui a execução dos testes nem a revisão manual.
