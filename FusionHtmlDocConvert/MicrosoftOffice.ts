import { Document, Paragraph, Table, TableCell, TableRow, Packer, HeadingLevel } from "docx";
import { HtmlProcessedData, HtmlProcessedHeader, HtmlProcessedTable } from "./HtmlProcessor";

export async function GenerateDocx(data: HtmlProcessedData) : Promise<Buffer> {
    const doc = new Document();
    const docElements = [];

    data.elements.forEach((element) => {
        if (element instanceof HtmlProcessedTable) {
            docElements.push(new Table({
                rows: element.rows.map((r) => new TableRow({
                    children: r.cells.map((cell) => new TableCell({
                        children: [
                            new Paragraph(cell)
                        ]
                    }))
                }))
            }))
        } else if (element instanceof HtmlProcessedHeader) {
            let headingLevel : HeadingLevel;
            
            switch (element.level) {
                default:
                case 1:
                    headingLevel = HeadingLevel.HEADING_1;
                    break;
                case 2:
                    headingLevel = HeadingLevel.HEADING_2;
                    break;
                case 3:
                    headingLevel = HeadingLevel.HEADING_3;
                    break;
                case 4:
                    headingLevel = HeadingLevel.HEADING_4;
                    break;
                case 5:
                    headingLevel = HeadingLevel.HEADING_5;
                    break;
                case 6:
                    headingLevel = HeadingLevel.HEADING_6;
                    break;
            }

            docElements.push(new Paragraph({
                text: element.text,
                heading: headingLevel
            }))
        }
    });

    doc.addSection({
        children: docElements
    });

    return await Packer.toBuffer(doc);
}