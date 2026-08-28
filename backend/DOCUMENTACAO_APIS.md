# 📘 Documentação de Integração e Limitações das APIs de Processos

Este documento detalha o escopo de atuação, limitações, regras de privacidade (LGPD) e o funcionamento das duas APIs de consulta processual integradas ao sistema: **Infosimples** e **DataJud (CNJ)**.

---

## ⚡ 1. API Infosimples (TJPR / TJSP / TJRJ / TJMG / TJRS)
A Infosimples utiliza raspagem automatizada em tempo real (RPA de alta velocidade) diretamente nos portais de consulta pública de cada tribunal estadual.

### 🔍 Escopo de Atuação
*   **Tribunais Estaduais Suportados (1º e 2º Grau):**
    *   **TJPR** (Paraná)
    *   **TJSP** (São Paulo)
    *   **TJRJ** (Rio de Janeiro)
    *   **TJMG** (Minas Gerais)
    *   **TJRS** (Rio Grande do Sul)

### ❌ Limitações e O que NÃO Consegue Consultar
1.  **Sem Suporte a Processos Federais (TRF4 / TRF3):** A Infosimples **não possui** serviço de consulta processual para o TRF4 (Paraná/Santa Catarina/Rio Grande do Sul) ou TRF3. *Para esses casos, use a consulta via DataJud.*
2.  **Sem Suporte a Processos Trabalhistas (TRTs):** A Infosimples **não possui** serviço de consulta processual para a Justiça do Trabalho. *Para esses casos, use a consulta via DataJud.*
3.  **Busca por OAB Bloqueada/Não Suportada:** 
    *   A API da Infosimples reflete as opções da página pública do tribunal. Como o TJPR (Projudi) **não disponibiliza** busca por OAB de forma pública (apenas mediante login com certificado digital), a API não suporta busca por OAB.
    *   Buscas genéricas por `nome_advogado` são bloqueadas pelo tribunal com erro **608** (*Refine sua consulta*) para evitar sobrecargas, devido à grande quantidade de processos ativos de um mesmo advogado.
4.  **Processos em Segredo de Justiça:** Processos sob sigilo ou segredo de justiça não retornam movimentações detalhadas ou PDFs na consulta pública.

### 💰 Funcionamento da Cobrança
*   **Modelo:** Pré-pago (debitado do saldo de créditos).
*   **Regra:** Só cobra por requisições HTTP que retornam com sucesso (**Código 200**). Consultas com erro, timeout ou indisponibilidade do tribunal (**não são cobradas**).
*   **Melhor Prática:** Cadastre apenas os CNJ no banco de dados e faça a consulta detalhada via Infosimples apenas **sob demanda** (quando o usuário clicar para ver), evitando o consumo desnecessário de créditos.

---

## 🏛️ 2. API DataJud (Conselho Nacional de Justiça)
A API pública do DataJud consulta a base nacional unificada mantida pelo CNJ, que consolida os metadados enviados periodicamente por todos os tribunais do país.

### 🔍 Escopo de Atuação
*   **Tribunais Suportados (Cobertura Nacional):**
    *   Todos os Tribunais de Justiça Estaduais (TJs)
    *   Todos os Tribunais Regionais Federais (TRFs - incluindo **TRF4**)
    *   Todos os Tribunais Regionais do Trabalho (TRTs)
    *   Superior Tribunal de Justiça (STJ) e Supremo Tribunal Federal (STF)

### ❌ Limitações e O que NÃO Consegue Consultar
1.  **Delay de Sincronização (Delay do CNJ):** O DataJud funciona com sincronização em lote (os tribunais enviam os dados periodicamente para o CNJ). Isso gera uma latência de **semanas ou meses** em relação ao estado em tempo real do processo no tribunal de origem.
2.  **Restrições da LGPD e Omissão de Dados Privados:** A API pública do DataJud omite informações sensíveis para preservar a privacidade das partes:
    *   **NÃO traz** nomes das partes (Autores e Réus).
    *   **NÃO traz** nomes de advogados e OABs.
    *   **NÃO traz** nomes de magistrados (juízes).
    *   **NÃO traz** inteiros teores de decisões ou anexos em PDF.
3.  **Descrições Simplificadas das Movimentações:** Como o CNJ unifica os dados de centenas de sistemas diferentes (Projudi, eproc, PJe, Esaj), ele traduz as descrições escritas pelos escrivães para a **Tabela Unificada do CNJ**. Por isso, a movimentação virá com termos genéricos (ex: em vez de *"Ato ordinatório praticado: Registro de Depósito Eletrônico..."*, virá apenas *"Petição"* ou *"Ato Ordinatório"*).

### 💰 Funcionamento da Cobrança
*   **Modelo:** **100% Gratuito**.
*   **Regra:** Não consome créditos e pode ser consultado quantas vezes forem necessárias, respeitando os limites de requisições por minuto do CNJ.

---

## 📋 Tabela Comparativa de Recursos

| Recurso / Funcionalidade | API Infosimples | API DataJud (CNJ) |
| :--- | :---: | :---: |
| **Tempo Real (Live)** | Sim (TJPR, TJSP, etc.) | Não (Delay de semanas/meses) |
| **Justiça Federal (TRF4)** | Não | Sim |
| **Justiça do Trabalho (TRTs)** | Não | Sim |
| **Nomes das Partes (Autor/Réu)** | Sim | Não |
| **Nomes dos Advogados / OAB** | Sim | Não |
| **Histórico de Movimentações** | Detalhado (Original do Tribunal) | Simplificado (Tabela CNJ) |
| **Acesso a PDFs/Decisões** | Sim (Se públicos) | Não |
| **Custo por Consulta** | Sim (Aprox. R$ 0,20) | Gratuito |

---

## 💡 Recomendações Técnicas para o Sistema
*   Para processos do **TJPR** (e outros TJs estaduais): Priorize a consulta via **Infosimples** quando precisar do histórico completo, nomes de partes, advogados e valores reais atualizados.
*   Para processos do **TRF4 / TRTs**: Utilize a consulta via **DataJud**, pois é a única API pública integrada com cobertura a estes tribunais.
*   Para economizar créditos: Dê preferência a carregar as movimentações usando o **DataJud** por padrão caso o delay de sincronização não seja um problema para a visualização inicial, deixando a **Infosimples** como opção manual "Live" sob demanda.
