# Checklist manual — desafio NFT Marketplace

Marque somente após executar e conferir o resultado. Registre navegador, viewport, cenário, passos e screenshot quando encontrar uma falha. O deploy será realizado pelo proprietário do projeto e não está incluído neste roteiro.

## Preparação

- [ ] Executar `npm ci` e `npm run dev -- --port 5180`; abrir http://127.0.0.1:5180.
- [ ] Abrir **Cenários de demonstração**, no rodapé, e executar **Reset completo** com `standard` antes de cada grupo independente.
- [ ] Usar as contas fictícias `ana@kurio.demo` e `leo@kurio.demo`, ambas com senha `Kurio123!`.
- [ ] Comparar com o Figma em 1440, 768 e 390 pixels. Conferir console e aba Network do DevTools durante os fluxos.

## Visual e responsividade

- [ ] Comparar início, detalhe, carrinho, pagamento, confirmação, login, cadastro, perfil e carteiras com as referências disponíveis.
- [ ] Conferir cores, fonte, espaçamentos, alinhamentos, proporções e recortes das imagens, bordas e estados dos botões.
- [ ] Conferir a nitidez das artes no desktop/Retina; três imagens foram extraídas da prévia Figma em 291×291 pixels. A limitação está em `ASSETS.md`.
- [ ] Em 390, 768 e 1440 pixels, verificar ausência de scroll horizontal, texto cortado e controles sobrepostos.
- [ ] Conferir menu mobile, filtros em diálogo, formulários em uma coluna e leitura do resumo/recibo.
- [ ] Aplicar zoom de 200% e verificar acesso a todo o conteúdo e às ações.
- [ ] Conferir links editoriais e auxiliares: ações fora do escopo não devem aparentar sucesso funcional.

## Catálogo e detalhe

- [ ] Buscar um nome conhecido e conferir resultados correspondentes.
- [ ] Buscar um termo inexistente e conferir estado vazio com ação para recuperar a navegação.
- [ ] Combinar categoria, rede e preço máximo; conferir se todos os filtros são respeitados.
- [ ] Trocar ordenação entre menor preço, maior preço e nome; verificar a sequência exibida.
- [ ] Ir à segunda página e alterar um filtro: a paginação deve voltar para 1.
- [ ] Recarregar a página filtrada; busca, filtros, ordenação e paginação devem permanecer na URL.
- [ ] Usar voltar/avançar do navegador e conferir a restauração dos resultados.
- [ ] No cenário `out-of-order`, enviar buscas sucessivas rapidamente; uma resposta antiga não deve substituir a busca atual.
- [ ] Abrir `/nft/nft-1` diretamente; conferir imagem, informações, preço, edição e quantidade.
- [ ] Abrir `/nft/inexistente` e uma rota inexistente; conferir feedback e possibilidade de voltar.
- [ ] Tentar selecionar edição esgotada e ultrapassar o estoque; a operação deve ser impedida.
- [ ] Alternar as vistas da galeria e verificar seleção e feedback visual.

## Conta, sessão e isolamento

- [ ] Cadastrar conta com dados válidos; conferir login e persistência após refresh.
- [ ] Cadastrar e-mail existente; conferir mensagem de conflito sem criar outra conta.
- [ ] Testar e-mail inválido, senha fora da política e confirmação diferente; conferir validações.
- [ ] Entrar com senha errada e depois correta; conferir mensagens e recuperação.
- [ ] Como visitante, tentar pagamento/perfil/carteiras/pedidos; deve haver redirecionamento para login.
- [ ] Entrar após o redirecionamento e conferir retorno ao fluxo anterior.
- [ ] Recarregar uma tela autenticada; a sessão deve ser recuperada.
- [ ] Expirar sessão pelo laboratório durante navegação e durante revisão da compra; conferir novo login, preservação do carrinho e retomada.
- [ ] Sair da conta; conferir que telas privadas voltam a exigir login.
- [ ] Entrar como Ana, criar favorito/carrinho/pedido e sair. Entrar como Leo: nenhum dado privado de Ana deve aparecer.
- [ ] Tentar abrir o link de pedido de Ana como Leo; o acesso deve ser negado.

## Favoritos

- [ ] Como visitante, tentar favoritar; deve solicitar autenticação e preservar o destino.
- [ ] Autenticado, incluir e remover favorito; conferir atualização imediata e lista de interesse.
- [ ] Após a mutation concluir, recarregar; o estado confirmado deve permanecer.
- [ ] Aplicar `favorite-error` e favoritar; conferir aviso de falha e retorno ao estado anterior.
- [ ] Voltar a `standard` e repetir; a operação deve funcionar.

## Carrinho e valores

- [ ] Adicionar NFT como visitante; conferir item, edição, preço e contador do cabeçalho.
- [ ] Adicionar novamente a mesma edição; conferir quantidade e limite de estoque.
- [ ] Adicionar edições/NFTs diferentes; conferir identificação correta de cada linha.
- [ ] Alterar quantidade e remover item; conferir atualização do resumo.
- [ ] Recarregar o carrinho e entrar na conta; itens do visitante devem permanecer/ser mesclados.
- [ ] Aplicar `KURIO10`: desconto de 10%; remover o cupom e conferir o total sem desconto.
- [ ] Aplicar `EXPIRED` e um código aleatório; conferir mensagens de expirado/inválido.
- [ ] Conferir cálculo conhecido: 2 unidades de Emerald a 1,19 ETH, cupom KURIO10 e taxa 0,005 ETH resultam em **2,147 ETH**.
- [ ] Esvaziar carrinho; conferir estado vazio e impedimento de checkout sem itens.
- [ ] Pelo laboratório, alterar preço/esgotar um NFT do carrinho; conferir aviso, valores atualizados e impedimento de compra inválida.

## Pagamento, idempotência e recibo

- [ ] Conferir preenchimento e validação dos dados do colecionador.
- [ ] Testar checkout sem carteiras; deve indicar cadastro de carteira.
- [ ] Selecionar carteira e rede compatíveis; simular conexão, recusa e desconexão.
- [ ] Tentar revisar sem conexão e sem aceitar a indicação de compra simulada; deve ser impedido.
- [ ] Abrir revisão e conferir itens, quantidades, desconto, taxa e total antes do envio.
- [ ] Alterar preço pelo laboratório com revisão aberta; confirmar deve ficar bloqueado até nova revisão.
- [ ] Executar `price-change` e `sold-out` no envio; conferir revalidação e ausência de confirmação falsa.
- [ ] Finalizar com `standard`: conferir estado pendente e só depois pedido confirmado.
- [ ] Clicar repetidamente no envio; conferir apenas um pedido em **Meus pedidos**.
- [ ] Com `order-timeout`, recuperar a tentativa; deve retornar o mesmo pedido, sem nova compra.
- [ ] Repetir recuperação após refresh; conferir a mesma identificação de pedido.
- [ ] Com `payment-declined`, conferir recusa e preservação dos itens no carrinho.
- [ ] Após confirmação, conferir remoção somente das quantidades compradas e redução do estoque.
- [ ] Alterar preço após confirmação e recarregar o recibo: valores do pedido não podem mudar.
- [ ] Conferir identificação de transação claramente simulada, itens, taxas e total.

## Tempo real e recuperação de falhas

- [ ] Conferir status **Atualizações ao vivo** e conexão WebSocket no DevTools.
- [ ] Emitir alteração de preço e verificar catálogo, detalhe e carrinho atualizados por REST após o evento.
- [ ] Enviar evento duplicado; não deve duplicar efeitos ou operações.
- [ ] Enviar evento antigo; não deve regredir preço, estoque ou pedido.
- [ ] Interromper conexão; conferir indicação de reconexão e reconciliação posterior.
- [ ] Com `pending-disconnect`, criar pedido, interromper/retomar e recarregar; recuperar estado sem criar outra compra.
- [ ] Trocar de usuário e emitir eventos; um pedido da sessão anterior não deve aparecer na nova sessão.
- [ ] Aplicar `slow`: conferir skeletons no catálogo, detalhe e resumo do carrinho, sem saltos relevantes de layout.
- [ ] Aplicar `offline` e `server-error`; conferir erro legível, ausência de sucesso falso e recuperação ao voltar para `standard`.
- [ ] Executar reset após modificações; conferir restauração integral do cenário inicial.

## Perfil e carteiras

- [ ] Editar nome, usuário, e-mail, ENS e apelido; salvar e recarregar para conferir persistência.
- [ ] Testar conflito de e-mail/usuário com a segunda conta e campos inválidos.
- [ ] Enviar avatar PNG/JPEG/WebP válido; conferir prévia, salvamento e persistência.
- [ ] Testar tipo inválido e arquivo maior que 1 MB; conferir rejeição e mensagem.
- [ ] Remover avatar e salvar; conferir resultado após refresh.
- [ ] Alterar senha com senha atual errada, nova senha inválida e confirmação divergente; conferir validações.
- [ ] Alterar senha corretamente, sair e entrar com a nova senha; a antiga deve deixar de funcionar.
- [ ] Cadastrar carteira secundária, editar endereço/rede/apelido e definir principal; conferir persistência e apenas uma principal.
- [ ] Testar endereço inválido e carteira duplicada; conferir validação.
- [ ] Voltar ao checkout; conferir disponibilidade das carteiras cadastradas/atualizadas.

## Acessibilidade

- [ ] Navegar só com Tab, Shift+Tab, Enter, Espaço e Escape; completar os fluxos principais.
- [ ] Conferir foco visível e ordem de navegação coerente.
- [ ] Abrir diálogos de navegação, filtro, laboratório e revisão: foco deve entrar, permanecer no diálogo e retornar ao acionador ao fechar.
- [ ] Usar o link **Pular para o conteúdo**.
- [ ] Conferir labels, mensagens de validação, textos alternativos e nomes acessíveis dos ícones.
- [ ] Com leitor de tela, conferir anúncio de erro, mutation e alteração de preço.
- [ ] Conferir contraste e se sucesso/erro/seleção possuem indicação além da cor.
- [ ] Ativar preferência por movimento reduzido; shimmer e animações devem ser desativados.

## Verificações reproduzíveis

- [ ] `npm run typecheck` e `npm run lint` passam.
- [ ] `npm test` passa.
- [ ] `npm run test:e2e` passa nos dois projetos; abrir `playwright-report/index.html`.
- [ ] `npm run test:visual` passa. Não atualizar baselines antes de inspecionar diferenças.
- [ ] `npm run test:responsive` passa e gera capturas em `reports/screenshots`.
- [ ] `npm run build` passa e `npm run preview -- --port 5181` abre a aplicação com mocks.
- [ ] Executar `npm run audit` com o preview ativo: conferir três execuções por página/perfil e medianas em `reports/lighthouse/summary.json`.
- [ ] Conferir metas: Performance ≥90, Accessibility ≥95, Best Practices ≥95 e SEO ≥90; verificar também LCP, CLS e TBT.
- [ ] Conferir execução a partir de checkout limpo usando apenas o README e dados fictícios.

## Registro de falhas

Copie este modelo para cada problema:

```text
ID / título:
Prioridade: bloqueador | alta | média | baixa
Requisito relacionado:
Navegador e viewport:
Conta e cenário:
Passos para reproduzir:
Resultado esperado:
Resultado observado:
Screenshot / trace / console:
Reteste após correção:
```

Priorize primeiro os eliminatórios: stack efetiva, compra dependente da simulação, isolamento entre usuários, eventos através do Socket.IO e E2E executáveis. Em seguida, revise recuperação de compra, cálculos, acessibilidade e fidelidade visual.
