const fs = require('fs');
const docx = require('docx');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, PageBreak, WidthType, AlignmentType, BorderStyle, ImageRun
} = docx;

const path = require('path');

// Read UML Image
const umlImageBuffer = fs.readFileSync(path.join(__dirname, "uml_proc_img-1.png"));

// Helper function for header table
function createHeaderTable() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: "Wise", font: "Arial", size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: "especificação_Gerenciar_Processos.doc", font: "Arial", size: 20 })] }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: "Versão: 1.1", font: "Arial", size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: "Data: 04/09/2026", font: "Arial", size: 20 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

function pHeading1(numText, titleText) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [
      new TextRun({ text: numText + "\t", bold: true, font: "Arial", size: 24 }),
      new TextRun({ text: titleText, bold: true, font: "Arial", size: 24 }),
    ],
  });
}

function pHeading2(numText, titleText) {
  return new Paragraph({
    spacing: { before: 100, after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: numText + "\t", bold: true, font: "Arial", size: 22 }),
      new TextRun({ text: titleText, bold: true, font: "Arial", size: 22 }),
    ],
  });
}

function pBody(text, leftIndent = 360) {
  return new Paragraph({
    spacing: { before: 30, after: 30, line: 220 },
    indent: { left: leftIndent },
    children: [
      new TextRun({ text: text, font: "Arial", size: 20 }),
    ],
  });
}

function pStep(stepNum, text, leftIndent = 720) {
  return new Paragraph({
    spacing: { before: 20, after: 20, line: 210 },
    indent: { left: leftIndent },
    children: [
      new TextRun({ text: stepNum + "\t", font: "Arial", size: 19 }),
      new TextRun({ text: text, font: "Arial", size: 19 }),
    ],
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 20, color: "000000" },
      },
    },
  },
  sections: [{
    properties: {
      titlePage: true,
      page: {
        margin: { top: 1000, bottom: 1000, left: 1417, right: 1417 },
      },
    },
    headers: {
      first: new Header({ children: [] }),
      default: new Header({ children: [createHeaderTable()] }),
    },
    children: [
      // PAGE 1: COVER
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 12, color: "000000" } },
        spacing: { before: 200, after: 100 },
        children: [],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100, after: 200 },
        children: [
          new TextRun({ text: "JESSICA LIMA SOCIEDADE INDIVIDUAL DE\nADVOCACIA", bold: true, font: "Arial", size: 28 }),
        ],
      }),
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "000000" } },
        spacing: { after: 3600 },
        children: [],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200, after: 100 },
        children: [
          new TextRun({ text: "Wise - Software Jurídico", bold: true, font: "Arial", size: 32 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100, after: 600 },
        children: [
          new TextRun({ text: "Especificação de Caso de Uso", bold: true, font: "Arial", size: 28 }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 600, after: 200 },
        children: [
          new TextRun({ text: "Versão 1.1", bold: true, font: "Arial", size: 22 }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 2: HISTÓRICO DA REVISÃO
      new Paragraph({
        spacing: { before: 300, after: 200 },
        children: [
          new TextRun({ text: "Histórico da Revisão", bold: true, font: "Arial", size: 32 }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          left: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          right: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
          insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "000000" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Data", bold: true, font: "Arial", size: 21 })] })] }),
              new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Versão", bold: true, font: "Arial", size: 21 })] })] }),
              new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true, font: "Arial", size: 21 })] })] }),
              new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Autor", bold: true, font: "Arial", size: 21 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "05/05/2026", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1.0", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Preenchimento Inicial", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "João Pedro da Silva Mangerona", font: "Arial", size: 19 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "04/09/2026", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1.1", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Atualização do módulo de Processos com histórico de movimentações, lançamento manual e sincronização via API (Infosimples / DataJud)", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "João Pedro da Silva Mangerona", font: "Arial", size: 19 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 19 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 19 })] })] }),
            ],
          }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 3: ÍNDICE
      new Paragraph({
        spacing: { before: 300, after: 200 },
        children: [
          new TextRun({ text: "Índice", bold: true, font: "Arial", size: 32 }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1. Breve Descrição", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Fluxo Básico de Eventos", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.1. Visualizar Processos e Histórico de Movimentações", font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.2. Adicionar Processo", font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.3. Editar Processo", font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.4. Excluir Processo", font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.5. Lançar Movimentação Manual no Processo", font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.6. Sincronizar Movimentações via API (Infosimples / DataJud)", font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Fluxos Alternativos", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4. Subfluxos", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5. Cenários Chave", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "6. Condições Prévias", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "7. Pontos de Extensão", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "8. Requisitos Especiais", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 21 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "9. Informações Adicionais", bold: true, font: "Arial", size: 21 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "6", bold: true, font: "Arial", size: 21 })] })] })] }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 4: SPECIFICATION PART 1
      new Paragraph({
        spacing: { before: 140, after: 140 },
        children: [
          new TextRun({ text: "Especificação de Caso de Uso: Gerenciar Processos", bold: true, font: "Arial", size: 28 }),
        ],
      }),

      pHeading1("1.", "Breve Descrição"),
      pBody("Este caso de uso permite que o Ator organize, crie, edite, acompanhe e exclua os processos jurídicos no módulo de Processos, bem como gerencie o histórico de movimentações de cada processo, realizando lançamentos manuais de andamentos e a sincronização automática de movimentações em tempo real através de APIs externas (Infosimples e DataJud)."),

      pHeading1("2.", "Fluxo Básico de Eventos"),
      pBody("O caso de uso segue o padrão de visualizar a listagem, adicionar, editar, excluir processos, lançar movimentações manuais e sincronizar andamentos via API no módulo de Processos."),

      pHeading2("2.1.", "Visualizar Processos e Histórico de Movimentações"),
      pStep("2.1.1.", "O Ator acessa o módulo de \"Processos\" através do menu principal."),
      pStep("2.1.2.", "O frontend envia requisições ao backend para recuperar a listagem de processos (com CNJ, Título, Tribunal, Vara, Cliente, Parte Contrária e Status) e contadores de métricas."),
      pStep("2.1.3.", "O sistema consulta os registros no Banco de Dados."),
      pStep("2.1.4.", "O sistema exibe os processos em uma tabela organizada com filtros por status e busca por texto."),
      pStep("2.1.5.", "O Ator pode acionar o ícone de movimentações de um processo específico para visualizar seu histórico de andamentos."),

      pHeading2("2.2.", "Adicionar Processo"),
      pStep("2.2.1.", "O Ator clica no botão \"Novo Processo\"."),
      pStep("2.2.2.", "O sistema exibe um formulário solicitando dados como: Número CNJ, Título/Causa, Status (Ativo, Suspenso, Arquivado, Encerrado), Tribunal, Vara, Cliente Vinculado, Parte Contrária e Advogados Responsáveis."),
      pStep("2.2.3.", "O Ator preenche os dados solicitados."),
      pStep("2.2.4.", "O Ator aciona o comando \"Salvar\"."),
      pStep("2.2.5.", "O sistema valida os campos obrigatórios (CNJ e Título/Causa)."),
      pStep("2.2.6.", "O sistema persiste o novo processo no banco de dados e atualiza a listagem."),

      pHeading2("2.3.", "Editar Processo"),
      pStep("2.3.1.", "O Ator seleciona a opção \"Editar\" no processo desejado."),
      pStep("2.3.2.", "O sistema carrega as informações atuais do processo no formulário."),
      pStep("2.3.3.", "O Ator realiza as alterações necessárias (ex: alteração de status ou atribuição de responsável)."),
      pStep("2.3.4.", "O Ator confirma a atualização."),
      pStep("2.3.5.", "O sistema valida as informações e sobrescreve o registro no banco de dados."),
      pStep("2.3.6.", "O sistema confirma a operação e atualiza a interface."),

      pHeading2("2.4.", "Excluir Processo"),
      pStep("2.4.1.", "O Ator seleciona a opção \"Excluir\" no processo desejado."),
      pStep("2.4.2.", "O sistema exibe um modal de confirmação para evitar perdas acidentais."),
      pStep("2.4.3.", "O Ator confirma a exclusão."),
      pStep("2.4.4.", "O sistema remove o processo e seus registros vinculados do banco de dados."),
      pStep("2.4.5.", "O sistema remove o processo da interface."),

      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 5: SPECIFICATION PART 2
      pHeading2("2.5.", "Lançar Movimentação Manual no Processo"),
      pStep("2.5.1.", "O Ator abre o modal de movimentações de um processo específico."),
      pStep("2.5.2.", "No painel \"Lançar Movimentação\", o sistema disponibiliza os campos de Data/Hora, Origem (\"Manual\") e Descrição do andamento."),
      pStep("2.5.3.", "O Ator insere a descrição da movimentação e clica no botão \"Lançar Andamento\"."),
      pStep("2.5.4.", "O sistema valida a descrição, vincula o novo andamento ao processo e o persiste no banco de dados."),
      pStep("2.5.5.", "O sistema atualiza o histórico de movimentações exibido na tela."),

      pHeading2("2.6.", "Sincronizar Movimentações via API (Infosimples / DataJud)"),
      pStep("2.6.1.", "No modal de movimentações do processo, o Ator aciona a sincronização automática (\"Sincronizar via Infosimples\" ou \"Sincronizar via DataJud\")."),
      pStep("2.6.2.", "O backend faz a consulta ao serviço externo utilizando o número CNJ do processo."),
      pStep("2.6.3.", "O sistema processa os andamentos retornados pela API e ignora registros duplicados."),
      pStep("2.6.4.", "O sistema persiste as novas movimentações importadas com a tag da API de origem (ex: \"API_INFOSIMPLES\" ou \"API_DATAJUD\")."),
      pStep("2.6.5.", "O sistema notifica o Ator sobre a quantidade de novas movimentações importadas e atualiza a linha do tempo do processo."),

      pHeading1("3.", "Fluxos Alternativos"),
      pHeading2("3.1.", "Tentativa de cadastro de processo fracassada (dados inválidos):"),
      pStep("3.1.1.", "No passo 2.2.4, se o CNJ ou Título estiverem em branco ou excederem o limite de caracteres, o sistema impede o salvamento.", 1080),
      pStep("3.1.2.", "O sistema exibe alertas nos respectivos campos informando o motivo do erro.", 1080),

      pHeading2("3.2.", "Lançamento de movimentação manual com descrição em branco:"),
      pStep("3.2.1.", "No passo 2.5.3, se o Ator tentar salvar uma movimentação sem preencher a descrição, o sistema não efetua o registro.", 1080),

      pHeading2("3.3.", "Nenhum andamento encontrado ou erro na API externa:"),
      pStep("3.3.1.", "No passo 2.6.2, se a API externa não encontrar novos andamentos ou estiver indisponível, o sistema exibe uma mensagem de aviso ao Ator e mantém o histórico atual intacto.", 1080),

      pHeading2("3.4.", "Arquivar ou Alterar Status do Processo:"),
      pStep("3.4.1.", "O Ator pode alterar o status do processo para \"Arquivado\", \"Suspenso\" ou \"Encerrado\", ajustando sua exibição e métricas.", 1080),

      pHeading1("4.", "Subfluxos"),
      pBody("Não possui subfluxo", 0),

      pHeading1("5.", "Cenários Chave"),
      pBody("Os cenários chaves deste caso de uso podem ser definidos por criar, editar, listar, excluir processos, lançar movimentações manuais e sincronizar andamentos via API no processo.", 0),

      pHeading1("6.", "Condições Prévias"),
      pBody("O Ator deve estar devidamente autenticado na plataforma Software Wise.", 0),

      pHeading1("7.", "Pontos de Extensão"),
      pBody("Os dados são persistidos e armazenados de forma segura.", 0),

      pHeading1("8.", "Requisitos Especiais"),
      pBody("A princípio não foram identificados requisitos especiais.", 0),

      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 6: INFORMAÇÕES ADICIONAIS
      pHeading1("9.", "Informações Adicionais"),
      new Paragraph({
        spacing: { before: 200 },
        children: [
          new ImageRun({
            data: umlImageBuffer,
            transformation: { width: 480, height: 288 },
          }),
        ],
      }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const targetDocx = path.join(__dirname, "..", "Especificação_Gerenciar_Processos.docx");
  fs.writeFileSync(targetDocx, buffer);
  console.log("DOCX generated at:", targetDocx);
});
