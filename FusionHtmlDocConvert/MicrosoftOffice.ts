import { Document, Paragraph, Table, TableCell, TableRow, Packer, HeadingLevel } from "docx";
import { HtmlProcessedData, HtmlProcessedHeader, HtmlProcessedTable } from "./types";

export async function GenerateDocx(data: HtmlProcessedData): Promise<Buffer> {
  const doc = new Document();
  const docElements = [];

  data.elements.forEach((element) => {
    if (element instanceof HtmlProcessedTable) {
      const rows = element.rows.map((r) => {
        const children = r.cells.map((cell) => new TableCell({ children: [new Paragraph(cell)] }));
        return new TableRow({ children });
      });
      docElements.push(new Table({ rows }));
    } else if (element instanceof HtmlProcessedHeader) {
      const headingLevels: { [index: number]: HeadingLevel } = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };

      docElements.push(
        new Paragraph({
          text: element.text,
          heading: headingLevels[element.level],
        })
      );
    }
  });

  doc.addSection({ children: docElements });

  return await Packer.toBuffer(doc);
}
