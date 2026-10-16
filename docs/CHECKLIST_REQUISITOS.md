# Checklist de conformidade — Desafio Frontend NFT Marketplace

Fonte: enunciado anexado em 15/10/2026. Checklist organizado pelas 12 seções do desafio. Todos os itens começam desmarcados: a leitura do requisito ou a presença de uma biblioteca não comprova atendimento. Marque após verificar o comportamento e registrar a evidência.

Use `CHECKLIST_TESTES.md` como roteiro de execução manual. Este documento também cobre arquitetura, contratos, cobertura automatizada, auditorias e entrega. O deploy permanece sob responsabilidade do proprietário do projeto.

## 1. Escopo

- [ ] Entregar descoberta, compra e conta do colecionador em desktop e mobile.
- [ ] Implementar os comportamentos do enunciado e a composição visual do Figma.
- [ ] Implementar estados não desenhados mantendo o padrão visual do projeto.
- [ ] Simular APIs, autenticação, carteiras e pagamentos de forma funcional.
- [ ] Manter blockchain, extensões de carteira e gateways reais fora do escopo.
- [ ] Tratar links externos e ações auxiliares de forma coerente.
- [ ] Não aparentar sucesso funcional em ações fora do escopo: páginas editoriais, suporte, atividade, ofertas e downloads.

## 2. Stack obrigatória — uso efetivo

Verificar chamadas e responsabilidades no código, além das dependências instaladas.

- [ ] React na interface.
- [ ] TypeScript na implementação.
- [ ] TanStack Router nas rotas, parâmetros de busca e proteção dos fluxos privados.
- [ ] TanStack Query nas consultas, mutations e sincronização do cache.
- [ ] Axios como cliente de todas as chamadas REST da aplicação.
- [ ] REST APIs como camada de integração dos dados.
- [ ] Socket.IO no fluxo real de eventos do cliente.
- [ ] Tailwind CSS na estilização.
- [ ] Componentes shadcn/ui adaptados à identidade visual.
- [ ] MSW interceptando a camada de rede.
- [ ] Playwright nos E2E e na regressão visual.
- [ ] Lighthouse nas auditorias de performance e qualidade.

## 3. Telas e fluxos

### Telas obrigatórias

- [ ] Início: destaques, catálogo, busca, filtros, ordenação e navegação ao detalhe.
- [ ] Detalhe: galeria, informações, seleção de edição, quantidade, favoritos e compra.
- [ ] Carrinho: alteração de quantidades, remoção, cupom e resumo de valores.
- [ ] Pagamento: dados do colecionador, carteira, rede, revisão e envio do pedido.
- [ ] Confirmação: resultado, identificação da transação, itens, taxas e total.
- [ ] Login: autenticação, validação e retorno ao fluxo anterior.
- [ ] Cadastro: criação de conta, validação e conflito de cadastro.
- [ ] Perfil: edição de dados, avatar e alteração de senha.
- [ ] Carteiras: cadastro e edição das carteiras principal e secundária.
- [ ] Implementar todos os frames desktop e mobile disponíveis.
- [ ] Perfil, carteiras e confirmação funcionam em mobile mesmo sem frame específico.

### Catálogo e detalhe

- [ ] Busca, filtros, ordenação e paginação compõem o estado da URL.
- [ ] Refresh e voltar/avançar do navegador restauram esses parâmetros e seus resultados.
- [ ] Filtros são combináveis; alterar filtro reinicia a paginação.
- [ ] As consultas da API recebem os parâmetros correspondentes à interface.
- [ ] Tratar resultados vazios, falhas e respostas fora de ordem.
- [ ] Permitir acesso direto ao detalhe por URL.
- [ ] Tratar NFT inexistente, edição indisponível e limite de quantidade.
- [ ] Persistir favoritos por usuário autenticado.

### Carrinho

- [ ] Adicionar, alterar e remover itens, respeitando estoque por NFT e edição.
- [ ] Manter carrinho após refresh.
- [ ] Preservar os itens do visitante ao autenticar.
- [ ] Aplicar e remover cupom; tratar código inválido e expirado.
- [ ] Exibir subtotal, desconto, taxa de rede e total conforme a resposta da API.
- [ ] Refletir alterações de preço e disponibilidade com carrinho aberto.
- [ ] Trafegar ETH como strings decimais, mantendo precisão em cálculos e apresentação.
- [ ] Aceitar somente quantidades inteiras.
- [ ] Usar a cotação da API como referência para finalizar o pedido.

### Pagamento e confirmação

- [ ] Validar os campos previstos no layout e permitir revisão antes do envio.
- [ ] Usar carteiras cadastradas, selecionar rede e simular conexão, recusa e desconexão.
- [ ] Revalidar preço, disponibilidade, cupom e taxas antes de confirmar.
- [ ] Exigir nova confirmação do usuário se qualquer valor ou condição mudar.
- [ ] Impedir pedidos duplicados por cliques repetidos e reenvio após timeout.
- [ ] Representar pedido pendente, confirmado e recusado.
- [ ] Recuperar o pedido após refresh ou reconexão.
- [ ] Exibir confirmação somente após pedido efetivamente confirmado pela simulação.
- [ ] Preservar itens em falhas.
- [ ] Na confirmação, remover do carrinho somente itens e quantidades comprados.
- [ ] Produzir recibo com snapshot do pedido, imutável diante de mudanças posteriores no catálogo.
- [ ] Identificar transações e links de exploração como simulados.

### Conta e sessão

- [ ] Cadastro, login, logout e consulta de sessão integrados à API simulada.
- [ ] Exigir autenticação no checkout, perfil, carteiras, favoritos e pedidos.
- [ ] Recuperar a sessão após refresh.
- [ ] Tratar expiração durante navegação e checkout, preservando contexto para retomada.
- [ ] Limpar cache privado e subscriptions anteriores no logout e na troca de usuário.
- [ ] Validar cadastro, perfil, senha e carteiras, inclusive erros retornados pela API.
- [ ] Persistir alterações confirmadas após refresh.
- [ ] Usar credenciais fictícias e não armazenar senhas em claro.

## 4. Integração e estado

- [ ] Contratos tipados entre transporte, estado e interface.
- [ ] Estados de carregamento, vazio, erro, sucesso e atualização em segundo plano.
- [ ] Invalidação coerente após mutations e eventos.
- [ ] Cancelamento ou descarte de respostas obsoletas.
- [ ] Isolamento por usuário e pelos parâmetros da consulta.
- [ ] Recuperação de falhas sem duplicar operações.
- [ ] Rotas inexistentes tratadas e acesso direto a todas as telas previstas.
- [ ] Pelo menos uma interação otimista, com rollback em caso de falha.
- [ ] Política de cache, retries e sincronização documentada.

## 5. Contratos REST

Verificar implementação, tipos e documentação de requisições/respostas.

- [ ] Sessão/conta: cadastro, login, consulta de sessão, logout e expiração.
- [ ] NFTs: listagem com busca, filtros, ordenação e paginação; detalhe por identificador.
- [ ] Favoritos: consulta, inclusão e remoção.
- [ ] Carrinho: consulta, inclusão, alteração e remoção.
- [ ] Cotação: cupom, disponibilidade, descontos, taxas e total.
- [ ] Pedidos: criação idempotente, consulta do estado e recibo.
- [ ] Perfil: consulta, atualização de dados/avatar e alteração de senha.
- [ ] Carteiras: consulta, cadastro e atualização.
- [ ] Respostas representam erros de validação, sessão inválida, falta de permissão, recurso inexistente, conflito de disponibilidade e falha transitória.
- [ ] Mutations de pedido aceitam chave de idempotência.
- [ ] Repetir a mesma tentativa recupera o mesmo pedido.
- [ ] Reutilizar a chave com conteúdo diferente gera conflito — verificar especificamente esse caso.

## 6. Mocking com MSW

### Organização e consistência

- [ ] Mocks implementados na camada de rede.
- [ ] Contratos e cenários reutilizados em desenvolvimento, demonstração e testes.
- [ ] Componentes, hooks e cliente Axios não possuem respostas fictícias nem caminhos alternativos de negócio.
- [ ] Catálogo, favoritos, carrinho, perfil, carteiras e pedidos mantêm estado consistente.
- [ ] Persistência local permite refresh, quando utilizada.
- [ ] Reset restaura integralmente um cenário conhecido.
- [ ] Fixtures têm variedade suficiente para filtros e paginação e pelo menos dois usuários.
- [ ] Mocks são ativados por configuração e estão disponíveis no build de demonstração.
- [ ] Alterações simuladas aparecem nas respostas REST e nos eventos correspondentes.

### Cenários configuráveis e reproduzíveis

- [ ] Sucesso e resultado vazio.
- [ ] Lentidão, latência variável e respostas fora de ordem.
- [ ] Timeout, indisponibilidade de conexão e erros HTTP 4xx/5xx.
- [ ] Sessão expirada e acesso não autorizado.
- [ ] Conflito de cadastro e erro de validação de formulário.
- [ ] Cupom inválido e expirado.
- [ ] Preço alterado e edição esgotada durante a compra.
- [ ] Timeout após criação do pedido, recuperável por idempotência.
- [ ] Pagamento confirmado e pagamento recusado.

### Eventos simulados

- [ ] MSW também participa da simulação de eventos.
- [ ] Integração compatível com o protocolo Socket.IO, como `@mswjs/socket.io-binding`.
- [ ] Cenários exercitam `socket.io-client` efetivamente.
- [ ] Eventos não são substituídos por chamadas diretas a setters, callbacks ou cache.
- [ ] Transporte e limitações do ambiente de mocks documentados.

## 7. Tempo real com Socket.IO

- [ ] `nft.updated` atualiza preço e disponibilidade no catálogo, detalhe e carrinho.
- [ ] `order.updated` atualiza estado do pedido e apresenta confirmação ou recusa.
- [ ] Eventos possuem identidade estável, recurso afetado e versão.
- [ ] Duplicatas e eventos antigos não regridem estado nem reaplicam efeitos.
- [ ] Reconexão reconcilia recursos ativos com REST.
- [ ] Eventos da sessão anterior não atualizam dados de outro usuário.
- [ ] Listeners e subscriptions são liberados ao encerrar seu ciclo de vida.

### Cenários obrigatórios completos

- [ ] Colocar um NFT no carrinho, alterar preço/estoque durante navegação, observar aviso e resumo atualizado, e comprovar que o checkout rejeita cotação antiga.
- [ ] Interromper conexão com pedido pendente; reconectar e recuperar o estado sem criar outra compra.
- [ ] Repetir a recuperação de pedido pendente após recarregar a página.
- [ ] Comprovar que pedidos confirmados ou recusados permanecem terminais.

## 8. Interface, responsividade e acessibilidade

### Fidelidade e assets

- [ ] Conferir tipografia, cores, espaçamentos, hierarquia, imagens, proporções e composição com o Figma.
- [ ] Conferir adaptação dos componentes shadcn/ui à identidade do projeto.
- [ ] Todas as telas funcionam em desktop, tablet e mobile.
- [ ] Avaliar no mínimo 390, 768 e 1440 pixels, incluindo filtros, navegação, formulários, carrinho e checkout.
- [ ] Usar assets do arquivo quando disponíveis.
- [ ] Imagens e fontes necessárias funcionam localmente.
- [ ] Documentar substituições de assets e ajustes de acessibilidade em relação ao layout.

### Carregamento

- [ ] Skeletons com shimmer nos componentes dependentes de dados, incluindo catálogo, detalhe e resumo do carrinho.
- [ ] Dimensões reservadas evitam deslocamentos de layout.
- [ ] Preferência por movimento reduzido é respeitada.

### Acessibilidade

- [ ] Navegação por teclado e foco visível.
- [ ] Controle e retorno de foco em diálogos e drawers.
- [ ] Semântica adequada, labels e mensagens de erro associadas aos campos.
- [ ] Textos alternativos para imagens relevantes.
- [ ] Contraste legível e estados que não dependem somente de cor.
- [ ] Feedback acessível para mutations e mudanças em tempo real.
- [ ] Ausência de overflow horizontal indevido e perda de conteúdo com zoom.

## 9. Playwright — cobertura automatizada obrigatória

Cada item abaixo precisa de teste executável e assertions sobre a interface/resultados. Um teste manual aprovado não comprova cobertura E2E automatizada.

- [ ] Busca, filtros combinados, ordenação, paginação e restauração pelo histórico.
- [ ] Acesso direto ao detalhe e recurso inexistente.
- [ ] Cadastro, login, expiração, logout e troca de usuário.
- [ ] Favoritos, falha de mutation e recuperação do estado.
- [ ] Carrinho, quantidades, remoção, cupom e persistência após refresh/login.
- [ ] Compra completa, do catálogo ao recibo confirmado.
- [ ] Pagamento recusado.
- [ ] Clique repetido no envio da compra — teste específico, além da implementação de idempotência.
- [ ] Timeout com recuperação do mesmo pedido.
- [ ] Edição de perfil, incluindo erros de validação.
- [ ] Alteração de avatar, incluindo erros de validação.
- [ ] Alteração de senha, incluindo erros de validação.
- [ ] Cadastro/edição de carteiras, incluindo erros de validação.
- [ ] Alteração de preço e disponibilidade via Socket.IO durante checkout.
- [ ] Eventos duplicados e antigos, desconexão e retomada de pedido pendente.
- [ ] Teclado, foco de diálogos e validação de formulários.
- [ ] Skeletons com rede lenta, erro e recuperação por nova tentativa.

### Execução e evidências

- [ ] Fluxos principais executados em Chromium desktop e mobile.
- [ ] Regressão visual de início, detalhe, carrinho e pagamento.
- [ ] Baselines versionadas e dados estáveis.
- [ ] Cada teste parte de estado isolado.
- [ ] Relógio, latência e disparo de eventos controlados nos cenários sensíveis a tempo.
- [ ] Relatório HTML entregue e traces de falhas preservados quando ocorrerem.
- [ ] Testes REST passam pelos handlers MSW.
- [ ] Testes de tempo real passam pelo cliente Socket.IO.

## 10. Lighthouse e performance

- [ ] Auditar início e detalhe, cada um em mobile e desktop.
- [ ] Usar build otimizado e cenário padrão dos mocks.
- [ ] Executar três medições por página/perfil: 12 execuções ao todo.
- [ ] Reportar a mediana de cada categoria por página/perfil.
- [ ] Mediana de Performance ≥ 90.
- [ ] Mediana de Accessibility ≥ 95.
- [ ] Mediana de Best Practices ≥ 95.
- [ ] Mediana de SEO ≥ 90.
- [ ] Registrar LCP, CLS e TBT.
- [ ] Justificar resultados abaixo das metas e identificar causas.
- [ ] Versionar configuração da auditoria.
- [ ] Entregar relatórios HTML/JSON, versões das ferramentas, ambiente e condições de execução.
- [ ] Carregar imagens, fontes e funcionalidades reais da entrega; não usar simplificações exclusivas para melhorar pontuação.

## 11. Avaliação e eliminatórios

| Critério | Pontos |
| --- | ---: |
| Fidelidade visual e responsividade | 20 |
| Fluxos e experiência de uso | 20 |
| Integração e estado | 15 |
| Tempo real | 10 |
| Mocking | 10 |
| Testes | 10 |
| Acessibilidade | 5 |
| Performance | 5 |
| Arquitetura e documentação | 5 |
| **Total** | **100** |

Prioridade máxima: não enviar enquanto houver qualquer eliminatório sem verificar.

- [ ] Toda a stack obrigatória participa efetivamente da solução.
- [ ] Fluxos principais são funcionais, não somente visuais.
- [ ] Compra só é confirmada após resposta da simulação.
- [ ] Não há exposição de dados entre usuários.
- [ ] Eventos não são simulados diretamente na UI.
- [ ] Testes E2E são executáveis.

## 12. Entrega e documentação

### Arquivos e execução

- [ ] Código-fonte e lockfile.
- [ ] Assets, mocks, fixtures, testes e configurações de auditoria.
- [ ] Execução a partir de checkout limpo.
- [ ] Nenhuma dependência de serviços privados ou backend de produção para executar a entrega.
- [ ] Comandos para desenvolvimento com mocks, build, preview, tipos, lint, Playwright e Lighthouse.

### README

- [ ] Setup e pré-requisitos.
- [ ] Variáveis de ambiente.
- [ ] Credenciais fictícias.
- [ ] Seleção e reset dos cenários.
- [ ] Comandos de execução.
- [ ] Instruções para reproduzir fluxos de falha.

### Arquitetura

- [ ] Contratos REST e de eventos.
- [ ] Política de sessão.
- [ ] Estado/persistência do carrinho.
- [ ] Estratégia de cache e retries.
- [ ] Reconciliação entre REST e Socket.IO.
- [ ] `ARCHITECTURE.md` registra limitações, decisões de UX e desvios do Figma.

### Repositório e deploy — execução pelo proprietário

O deploy continua obrigatório no desafio, embora seja feito por você. Uma prévia privada não substitui o acesso exigido para avaliação.

- [ ] Disponibilizar link do repositório para a banca.
- [ ] Publicar a aplicação e disponibilizar URL pública.
- [ ] Conferir que o código publicado corresponde ao código entregue.
- [ ] Manter a aplicação acessível durante a avaliação.
- [ ] Confirmar mocks e tempo real funcionando no ambiente publicado.
- [ ] Abrir diretamente e recarregar todas as rotas previstas no host publicado.
- [ ] Repetir os fluxos principais no deploy antes do envio.

## Registro de evidência e pendências

Para cada requisito aprovado ou reprovado, registrar:

```text
Seção / requisito:
Resultado: aprovado | reprovado | pendente
Tipo de verificação: manual | código | E2E | auditoria | documentação
Ambiente / viewport / cenário:
Passos ou comando:
Resultado esperado e observado:
Arquivo / teste / screenshot / relatório:
Correção necessária e reteste:
```

Revisar especialmente: cobertura E2E específica de avatar e clique repetido; conflito de mesma chave de idempotência com conteúdo diferente; erros associados aos campos; limpeza de subscriptions; precisão das imagens; e funcionamento das rotas após o deploy. Esses itens exigem evidência própria mesmo que o build e a suíte existente estejam passando.
