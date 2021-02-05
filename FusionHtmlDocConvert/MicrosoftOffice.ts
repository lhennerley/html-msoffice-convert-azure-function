import {
  Document,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  Packer,
  HeadingLevel,
  Media,
  TextRun,
  BorderStyle,
  WidthType,
} from "docx";
import {
  HtmlProcessedData,
  HtmlProcessedHeader,
  HtmlProcessedImage,
  HtmlProcessedTable,
  HtmlProcessedText,
} from "./types";

export async function GenerateDocx(data: HtmlProcessedData): Promise<Buffer> {
  const doc = new Document();
  const docElements: any[] = [];

  data.elements.forEach((element) => {
    if (element instanceof HtmlProcessedTable) {
      const borderAttr = Number(element.tableAttributes?.border || "0");
      const borderStyle = {
        style: borderAttr ? BorderStyle.SINGLE : BorderStyle.NONE,
        size: borderAttr,
        color: element.tableAttributes?.bordercolor || "black",
      };
      const borders = {
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle,
      };

      const rows = element.rows.map((r) => {
        const children = r.cells.map((cell) => {
          const children = [
            new Paragraph({
              children: cell.map((c) => {
                return new TextRun({ text: c.text, bold: c.bold, break: 1 });
              }),
            }),
          ];
          return new TableCell({ borders, children });
        });
        return new TableRow({ children });
      });

      const tableWidth = Number(element.tableAttributes?.width);
      docElements.push(
        new Table({
          rows,
          borders,
          width:
            !isNaN(tableWidth) && tableWidth > 0
              ? { size: tableWidth * 20, type: WidthType.DXA }
              : { size: 100, type: WidthType.PERCENTAGE },
        })
      );
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
    } else if (element instanceof HtmlProcessedImage) {
      const docImage = Media.addImage(doc, element.buffer, element.width, element.height);
      docElements.push(new Paragraph(docImage));
    } else if (element instanceof HtmlProcessedText) {
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: element.text,
              bold: element.bold,
            }),
          ],
        })
      );
    }
  });

  doc.addSection({ children: docElements });

  return await Packer.toBuffer(doc);
}
