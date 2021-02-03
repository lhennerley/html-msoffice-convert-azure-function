import * as cheerio from "cheerio";
import * as fetch from "node-fetch";
import parse from "style-to-object";
import {
  HtmlProcessedData,
  HtmlProcessedHeader,
  HtmlProcessedImage,
  HtmlProcessedTable,
  HtmlProcessedTableRow,
  HtmlProcessedText,
} from "./types";
import { imageSize } from "image-size";

export class HtmlProcessor {
  /**
   *
   */
  constructor(private htmlString: string) {}

  private parseTable(tbody: cheerio.TagElement): HtmlProcessedTable {
    const rows = new Array<HtmlProcessedTableRow>();

    tbody.children
      .filter((tr) => tr.type === "tag" && tr.name == "tr")
      .forEach((tr) => {
        if (tr.type !== "tag") return;
        const cells: Array<HtmlProcessedText[]> = [];

        tr.children.forEach((td) => {
          const cellContents: HtmlProcessedText[] = [];

          if (td.type !== "tag") return;

          td.children.forEach(async (c) => {
            if (c.type == "text") {
              cellContents.push(new HtmlProcessedText(c.data));
            } else {
              const cellText = await this.parseText(c);
              if (cellText) {
                cellContents.push(cellText);
              }
            }
          });

          cells.push(cellContents);
        });

        rows.push(new HtmlProcessedTableRow(cells));
      });

    return new HtmlProcessedTable(rows);
  }

  public async parse(): Promise<HtmlProcessedData> {
    const $ = cheerio.load(this.htmlString);

    const data: HtmlProcessedData = {
      elements: new Array<HtmlProcessedTable | HtmlProcessedHeader>(),
    };

    for (const child of $("body").children().toArray()) {
      await this.traverseChildren(data, child);
    }

    return data;
  }

  private async parseText(element: cheerio.TagElement) {
    const text: cheerio.TextElement = this.traverseUntilText(element);
    if (text) {
      let style: { [attr: string]: string } = {};

      if (text.parent.type == "tag") {
        if (text.parent.attribs["style"]) {
          style = parse(text.parent.attribs["style"]);
        }
      }
      const bold =
        element.children.filter((e) => e.type == "tag" && e.name == "b").length > 0 ? true : false;

      return new HtmlProcessedText(text.data, bold, style);
    } else {
      return undefined;
    }
  }

  private async traverseChildren(data: HtmlProcessedData, element: cheerio.Element) {
    if (element.type !== "tag") return;

    if (element.name === "table") {
      element.children.forEach(async (node) => {
        if (node.type === "tag" && node.name == "tbody") {
          data.elements.push(await this.parseTable(node));
        }
      });
    } else if (element.name == "img") {
      if (element.attribs["src"]) {
        const response = await fetch(element.attribs["src"]);
        const buffer = await response.buffer();
        const imgSize = imageSize(buffer);
        data.elements.push(new HtmlProcessedImage(buffer, imgSize.height, imgSize.width));
      }
    } else if (element.name == "p" || element.name == "b") {
      const textElement = await this.parseText(element);
      if (textElement) {
        data.elements.push(textElement);
      } else {
        for (const node of element.children) {
          await this.traverseChildren(data, node);
        }
      }
    } else if (element.name.match(/h\d/)) {
      data.elements.push(new HtmlProcessedHeader(Number(element.name[1]), element.firstChild.data));
    } else {
      for (const node of element.children) {
        await this.traverseChildren(data, node);
      }
    }
  }

  private traverseUntilText(element: cheerio.Element): cheerio.TextElement {
    let currentElement: cheerio.Element = element;
    if (currentElement.type == "tag") {
      do {
        currentElement = currentElement.firstChild;
      } while (currentElement && currentElement.type !== "text");
      if (!currentElement) {
        return undefined;
      } else if (currentElement.type == "text") {
        return currentElement;
      }
    } else {
      return currentElement;
    }
  }
}
