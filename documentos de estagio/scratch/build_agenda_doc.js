const fs = require('fs');
const docx = require('docx');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, PageBreak, WidthType, AlignmentType, BorderStyle, ImageRun
} = docx;

const path = require('path');

// Read UML Image
const umlImageBuffer = fs.readFileSync(path.join(__dirname, "uml_img-1.png"));

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
              new Paragraph({ children: [new TextRun({ text: "especificação_Gerenciar_Agenda.doc", font: "Arial", size: 20 })] }),
            ],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({ children: [new TextRun({ text: "Versão: 1.0", font: "Arial", size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: "Data: 05/05/2026", font: "Arial", size: 20 })] }),
            ],
          }),
        ],
      }),
    ],
  });
}

function pHeading1(numText, titleText) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({ text: numText + "\t", bold: true, font: "Arial", size: 26 }),
      new TextRun({ text: titleText, bold: true, font: "Arial", size: 26 }),
    ],
  });
}

function pHeading2(numText, titleText) {
  return new Paragraph({
    spacing: { before: 160, after: 100 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: numText + "\t", bold: true, font: "Arial", size: 24 }),
      new TextRun({ text: titleText, bold: true, font: "Arial", size: 24 }),
    ],
  });
}

function pBody(text, leftIndent = 360) {
  return new Paragraph({
    spacing: { before: 60, after: 60, line: 260 },
    indent: { left: leftIndent },
    children: [
      new TextRun({ text: text, font: "Arial", size: 22 }),
    ],
  });
}

function pStep(stepNum, text, leftIndent = 720) {
  return new Paragraph({
    spacing: { before: 40, after: 40, line: 250 },
    indent: { left: leftIndent },
    children: [
      new TextRun({ text: stepNum + "\t", font: "Arial", size: 21 }),
      new TextRun({ text: text, font: "Arial", size: 21 }),
    ],
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Arial", size: 22, color: "000000" },
      },
    },
  },
  sections: [{
    properties: {
      titlePage: true,
      page: {
        margin: { top: 1134, bottom: 1134, left: 1417, right: 1417 },
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
          new TextRun({ text: "Versão 1.0", bold: true, font: "Arial", size: 22 }),
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
              new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Data", bold: true, font: "Arial", size: 22 })] })] }),
              new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Versão", bold: true, font: "Arial", size: 22 })] })] }),
              new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true, font: "Arial", size: 22 })] })] }),
              new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Autor", bold: true, font: "Arial", size: 22 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "05/05/2026", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1.0", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Preenchimento Inicial", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "João Pedro da Silva Mangerona", font: "Arial", size: 20 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
              new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "", font: "Arial", size: 20 })] })] }),
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
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "1. Breve Descrição", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "2. Fluxo Básico de Eventos", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.1. Visualizar Compromissos", font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.2. Adicionar Compromisso", font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.3. Editar Compromisso", font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "4", font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: "2.4. Excluir Compromisso", font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "3. Fluxos Alternativos", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "4. Subfluxos", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "5. Cenários Chave", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "6. Condições Prévias", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "7. Pontos de Extensão", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "8. Requisitos Especiais", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "5", bold: true, font: "Arial", size: 22 })] })] })] }),
          new TableRow({ children: [new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "9. Informações Adicionais", bold: true, font: "Arial", size: 22 })] })] }), new TableCell({ alignment: AlignmentType.RIGHT, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "6", bold: true, font: "Arial", size: 22 })] })] })] }),
        ],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 4: SPECIFICATION PART 1
      new Paragraph({
        spacing: { before: 200, after: 240 },
        children: [
          new TextRun({ text: "Especificação de Caso de Uso: Gerenciar Agenda", bold: true, font: "Arial", size: 30 }),
        ],
      }),

      pHeading1("1.", "Breve Descrição"),
      pBody("Este caso de uso permite que o Ator organize, crie, edite e acompanhe os compromissos, audiências, prazos e reuniões da agenda jurídica."),

      pHeading1("2.", "Fluxo Básico de Eventos"),
      pBody("O caso de uso segue um padrão de visualizar, adicionar, editar e excluir os compromissos."),

      pHeading2("2.1.", "Visualizar Compromissos"),
      pStep("2.1.1.", "O Ator acessa o módulo de \"Agenda\" através do menu principal."),
      pStep("2.1.2.", "O frontend envia uma requisição ao backend para recuperar listagem de compromissos ativos."),
      pStep("2.1.3.", "O sistema consulta os registros persistentes no Banco de Dados."),
      pStep("2.1.4.", "O sistema exibe os compromissos em uma visualização de calendário / tabela organizada."),
      pStep("2.1.5.", "O Ator visualiza as informações."),

      pHeading2("2.2.", "Adicionar Compromisso"),
      pStep("2.2.1.", "O Ator clica no botão \"Novo Compromisso\"."),
      pStep("2.2.2.", "O sistema abre um formulário solicitando dados como: Título, Data, Horário de Início, Horário de Término, Categoria (Audiência, Reunião, Prazo, Tarefa), Local/Link e Descrição."),
      pStep("2.2.3.", "O Ator insere os dados do compromisso."),
      pStep("2.2.4.", "O Ator aciona o comando \"Salvar\"."),
      pStep("2.2.5.", "O sistema valida e verifica a integridade dos campos obrigatórios."),
      pStep("2.2.6.", "O sistema persiste o novo registro no banco de dados."),

      pHeading2("2.3.", "Editar Compromisso"),
      pStep("2.3.1.", "O Ator seleciona um compromisso específico na lista e clica na opção \"Editar\"."),
      pStep("2.3.2.", "O sistema carrega as informações atuais do compromisso no formulário de edição."),
      pStep("2.3.3.", "O Ator realiza as alterações necessárias (ex: alteração de horário, local ou categoria)."),
      pStep("2.3.4.", "O Ator confirma a atualização."),
      pStep("2.3.5.", "O sistema valida as informações e sobrescreve o registro no banco de dados."),
      pStep("2.3.6.", "O sistema confirma o sucesso da operação e atualiza a interface."),

      new Paragraph({ children: [new PageBreak()] }),

      // PAGE 5: SPECIFICATION PART 2
      pHeading2("2.4.", "Excluir Compromisso"),
      pStep("2.4.1.", "O Ator seleciona a opção \"Excluir\" em um compromisso da listagem."),
      pStep("2.4.2.", "O sistema exibe um alerta de confirmação para evitar a perda acidental de dados históricos."),
      pStep("2.4.3.", "O Ator confirma a exclusão definitiva."),
      pStep("2.4.4.", "O sistema remove o registro e todas as movimentações vinculadas do banco de dados."),
      pStep("2.4.5.", "O sistema remove o compromisso da lista visual e atualiza."),

      pHeading1("3.", "Fluxos Alternativos"),
      pHeading2("3.1.", "Tentativa de cadastro fracassada (dados inválidos):"),
      pStep("3.1.1.", "No passo 2.2.4, se os dados informados forem inválidos ou houver campos obrigatórios ausentes, o sistema impede o salvamento.", 1080),
      pStep("3.1.2.", "O sistema exibe uma mensagem indicando os erros encontrados e permite que o Ator corrija as informações.", 1080),

      pHeading2("3.2.", "Tentativa de edição fracassada:"),
      pStep("3.2.1.", "No passo 2.3.4, se os dados alterados forem inválidos ou conflitantes, o sistema impede a atualização.", 1080),
      pStep("3.2.2.", "O sistema alerta o Ator sobre o erro e mantém os dados anteriores inalterados no banco de dados.", 1080),

      pHeading2("3.3.", "Filtrar ou alterar status do compromisso:"),
      pStep("3.3.1.", "O Ator pode filtrar os compromissos por categoria (Audiência, Prazo, Reunião, Tarefa) ou período de datas, atualizando a exibição da agenda.", 1080),
      pStep("3.3.2.", "O Ator pode marcar um compromisso como concluído ou cancelado, atualizando seu status na lista visual.", 1080),

      pHeading1("4.", "Subfluxos"),
      pBody("Não possui subfluxo", 0),

      pHeading1("5.", "Cenários Chave"),
      pBody("Os cenários chaves deste caso de uso podem ser definidos por criar, editar, listar, filtrar e alterar status de compromissos da agenda.", 0),

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
  const targetDocx = path.join(__dirname, "..", "Especificação_Gerenciar_Agenda.docx");
  fs.writeFileSync(targetDocx, buffer);
  console.log("DOCX generated at:", targetDocx);
});
