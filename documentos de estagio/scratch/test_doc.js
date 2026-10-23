const fs = require('fs');
const docx = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, PageBreak, WidthType, BorderStyle } = docx;

const doc = new Document({
  sections: [{
    properties: {
      titlePage: true,
    },
    headers: {
      first: new Header({ children: [] }),
      default: new Header({
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Wise", font: "Arial", size: 20 })] }),
                      new Paragraph({ children: [new TextRun({ text: "especificação_Gerenciar_Agenda.doc", font: "Arial", size: 20 })] }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "Versão: 1.0", font: "Arial", size: 20 })] }),
                      new Paragraph({ children: [new TextRun({ text: "Data: 05/05/2026", font: "Arial", size: 20 })] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    },
    children: [
      new Paragraph({ children: [new TextRun({ text: "Page 1 Content", font: "Arial" })] }),
      new Paragraph({ children: [new PageBreak()] }),
      new Paragraph({ children: [new TextRun({ text: "Page 2 Content", font: "Arial" })] }),
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/home/jp_mangerona/Documents/estagio/demo-wise/scratch/test.docx", buffer);
  console.log("DOCX generated successfully");
});
