# Reavaliação do Produto e Roadmap de Próximos Passos

Data da avaliação: 2026-07-03. Escopo: todos os componentes, páginas, design, UX/UI, fluxo e — principalmente — o resultado que a ferramenta entrega. Avaliação feita sobre o código (`index.html`, `styles.css`, `modules/*`) e sobre a aplicação em execução (screenshots de todas as rotas em desktop e mobile).

## 1. O que está forte hoje

- **Narrativa de produto clara.** O pilar do MVP (motor de sizing automatizado + validação por resource owner) está bem contado de ponta a ponta: intake → escopo → sizing → validação → readiness → decisão, com barra de workflow de 6 passos e "recommended next action" em todas as telas.
- **Explicabilidade acima da média.** "Why this estimate?" (regra, base MD, multiplicadores, drivers), breakdown do score de readiness com pesos e caps, e thresholds de classificação sempre visíveis. Isso é exatamente o que uma ferramenta de governança precisa para gerar confiança.
- **Tela de Resource Validation é a mais madura.** Fila agrupada por produto, filtros por status, painel de decisão do owner, simulação de Email/Teams com trilha de atividade e closeout final. É o coração da ferramenta e está bem resolvido.
- **Qualidade de implementação consistente.** ES modules sem build, `escapeHtml` usado sistematicamente, empty states bem tratados com CTA, tooltips de ajuda contextuais, persistência em localStorage, visual limpo e alinhado à marca (uma família de azul, chrome flat).

## 2. Achados críticos (foco no resultado da ferramenta)

### C1. O dashboard executivo não mostra o portfólio no primeiro uso
`demoMode = true` por padrão (`modules/state.js`) faz `filteredOpportunities()` retornar apenas a oportunidade demo. O "Portfolio readiness cockpit" abre mostrando **1 oportunidade ativa** quando existem 5 no seed. A promessa central da tela (visão de portfólio para liderança) não se cumpre até o usuário descobrir que precisa sair do modo demo.

### C2. A data "hoje" é congelada em 2026-06-17
`DASHBOARD_TODAY = "2026-06-17"` (`modules/data.js:48`) alimenta `daysUntil()` e todo o cálculo de overdue, "due in Xd", bid calendar e escalação. Ou seja: o principal output operacional (o que está atrasado e o que precisa de atenção) é fictício e vai divergindo da realidade a cada dia. Ao criar oportunidade nova, os prazos usam `Date.now()` real, misturando as duas bases de tempo.

### C3. O resultado final não sai da ferramenta
O único export é "Copy pack summary" (texto puro para clipboard). O baseline validado de MD, o business case pack e a evidência de governança — o produto do trabalho — não viram PDF, planilha ou apresentação. Para SRM/BAB reais, o usuário teria que remontar tudo manualmente.

### C4. Estado persistido sem versionamento nem reset
A chave `presalesHub.state.v1` nunca migra. Quem já usou a ferramenta antes de um commit que muda o seed (ex.: os 6 produtos novos e o driver de CUSS bag drops adicionados recentemente) **nunca vê as novidades**, porque o estado antigo do localStorage vence o seed novo. Não existe botão "Reset demo data" na UI — a única saída é limpar o localStorage manualmente.

### C5. O fluxo de validação é uma simulação sem caminho para o mundo real
Owners não recebem nada e não têm como responder: o pre-sales "atua como owner" clicando por eles. Isso é adequado para demo, mas é a fronteira que separa o protótipo de uma ferramenta com resultado real. O desenho atual (requests, canais, trilha de atividade) já está pronto para plugar um backend.

## 3. Avaliação por página

| Página | Avaliação | Principais pontos |
|---|---|---|
| Dashboard | Boa, mas densa | Redundância entre "What Needs Attention", "Pending Validations" e "Blockers by Function" (o mesmo item AODB PM aparece 3x). Cartões são clicáveis mas não parecem (sem affordance de hover/cursor consistente). "94% readiness" ao lado do badge "Not Ready" confunde — o cap crítico que explica isso só aparece na tela de Readiness. |
| Intake | Funcional, modelo mental confuso | 17 campos num grid plano sem hierarquia de obrigatoriedade. O form salva em cada tecla (sync em `input`) e ainda existe um botão "Save mock intake" que só dispara toast — o usuário não sabe o que salva o quê. |
| Product Scope | Correta, não escala | 14 produtos em cartões grandes geram página quilométrica. A família "Seamless GT 11" tem 4 variantes soltas na lista — falta agrupamento por família e busca/filtro. |
| Automated Sizing | Forte | Grupos por produto com totais e exceções em destaque funcionam bem. Problema: o status de validação é editável aqui **e** na fila de Resource Validation (dois donos do mesmo dado, com regras diferentes — a fila exige justificativa, o select da tabela não). |
| Resource Validation | A melhor tela | Página muito longa (fila + detalhe + notificação + workload + closeout). Em mobile a tabela estoura. |
| Readiness | Boa | Checkboxes do checklist estão `disabled` sem explicação de que a evidência é derivada automaticamente — parece bug para quem tenta clicar. |
| Stakeholders | Fraca em descobribilidade | "Click a status to cycle" é fácil de acionar por engano e não tem undo; ciclar por 5 estados para voltar um passo é hostil. |
| Risks & Decisions | Funcionais | Vivem num side-panel estreito apesar de serem rotas dedicadas. Exclusão com "x" sem confirmação nem undo. |
| Business Case Pack | Boa ideia bem executada | Benchmark histórico com sinal (acima/dentro/abaixo da faixa) é um diferencial. Falta ser exportável (ver C3). |
| Guided Demo | Boa | Presenter notes + evidência viva por passo é ótimo para apresentação. O acoplamento com `demoMode` é o que causa C1. |

## 4. Saúde técnica

- **`render.js` com 2.400 linhas e `styles.css` com 6.576** — os dois maiores riscos de manutenção. Dividir por tela (`render/dashboard.js`, `render/validation.js`, ...) e extrair CSS por componente.
- **Re-render global**: quase toda interação chama `renderAll()`, que redesenha as 10 telas via `innerHTML` — inclusive a busca do topo a cada tecla. Além do custo, `renderAirportProfile` reescreve os `value` do form durante a digitação (risco de cursor/foco saltar). Renderizar apenas a rota ativa já resolveria a maior parte.
- **Zero testes.** `sizing-engine.js` e `readiness-rules.js` são lógica pura, ideais para testes unitários; o fluxo intake→decisão é um smoke test Playwright natural. Hoje qualquer refactor é às cegas.
- **Acessibilidade razoável** (aria-labels, aria-live no toast, roles), mas pills de status dependem só de cor, e linhas de tabela clicáveis com `tabindex` merecem revisão de foco visível.
- **Idioma**: UI 100% em inglês, hardcoded — sem camada de i18n.

## 5. Próximos passos recomendados

### P0 — Destravar o valor percebido (dias)
1. **Iniciar com o portfólio completo**: `demoMode = false` por padrão; o modo demo passa a ser ativado apenas pelo botão "Start guided demo". O dashboard executivo volta a mostrar as 5 oportunidades no primeiro acesso.
2. **Data real**: substituir `DASHBOARD_TODAY` por data corrente (mantendo, se quiser, um "clock congelado" apenas dentro do modo demo para preservar a narrativa do cenário Estephan).
3. **Versionamento do estado + reset**: bump para `state.v2` com migração (merge de produtos/regras novas do seed) e botão visível "Reset demo data".
4. **Export do resultado**: Business Case Pack imprimível (CSS `@media print` → PDF pelo navegador) e download CSV das linhas de sizing (produto, workstream, initial/adjusted/final MD, owner, status). É o menor caminho para a ferramenta "entregar" algo.

### P1 — Confiança, consistência e manutenção (1–2 semanas)
5. **Testes**: unitários para `sizing-engine` e `readiness-rules` (node --test ou Vitest, sem build); smoke test Playwright do fluxo completo.
6. **Um único dono do status de validação**: a fila de Resource Validation passa a ser o único lugar que muda status (com justificativa obrigatória); na tabela de sizing o status vira read-only com link "Review in validation queue".
7. **Consolidar o dashboard**: fundir "Pending"/"Overdue"/"Blockers by Function" numa única fila priorizada; dar affordance de clique aos cartões; explicar o cap ("94% mas Not Ready porque...") direto no badge.
8. **Intake em etapas**: agrupar em 3 blocos (comercial → governança → narrativa), indicador "salvo automaticamente", validação visível de campos obrigatórios; remover o botão de save redundante.
9. **Undo/confirmação** para exclusões (riscos, assunções, decisões) e para o cycle de status de Stakeholders (trocar por select ou menu).
10. **Dividir `render.js` e `styles.css` por tela** e renderizar apenas a rota ativa.

### P2 — De protótipo a ferramenta (próximo trimestre)
11. **Backend leve + link de validação real**: persistência compartilhada (mesmo um serviço simples) e um link mágico por request para o owner aprovar/ajustar/rejeitar de verdade — converte a simulação de Email/Teams em resultado real. É o passo de maior valor de negócio.
12. **Integração Salesforce (import)**: puxar oportunidade/valor/datas do sistema de registro em vez de redigitar — hoje o Salesforce é apenas citado no rodapé.
13. **Editor de regras de sizing**: as regras são descritas como "configuráveis", mas não há UI para editá-las; um CRUD simples de regras/thresholds fecha essa promessa e permite calibração sem deploy.
14. **Auditoria**: registrar quem/quando mudou MD, status e overrides (hoje só notificações têm trilha).
15. **i18n (EN/PT), auditoria de acessibilidade (axe) e fila de validação mobile** (cards no lugar da tabela).

### Ordem sugerida
C1/C2/C3/C4 primeiro (itens 1–4): são pequenos, e cada um remove um "porém" da demo executiva. Depois 5–6 (testes + dono único do status) antes de qualquer refactor visual, e então o restante de P1. P2 começa pelo item 11, que é o que transforma o resultado da ferramenta de simulado em real.
