import * as cheerio from "cheerio";
import {
  HtmlProcessedData,
  HtmlProcessedHeader,
  HtmlProcessedTable,
  HtmlProcessedTableRow,
} from "./types";

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
        const cells: string[] = [];

        tr.children.forEach((td) => {
          if (td.type !== "tag") return;
          let cellText = td.firstChild;
          while (cellText?.type === "tag" && cellText.children) {
            cellText = cellText.firstChild;
          }
          cells.push(cellText ? cellText.data : "");
        });

        rows.push(new HtmlProcessedTableRow(cells));
      });

    return new HtmlProcessedTable(rows);
  }

  public parse(): HtmlProcessedData {
    const $ = cheerio.load(this.htmlString);

    const data: HtmlProcessedData = {
      elements: new Array<HtmlProcessedTable | HtmlProcessedHeader>(),
    };

    $("body")
      .children()
      .each((_, element) => this.traverseChildren(data, element));

    return data;
  }

  private traverseChildren(data: HtmlProcessedData, element: cheerio.Element) {
    if (element.type !== "tag") return;

    if (element.name === "table") {
      element.children.forEach((node) => {
        if (node.type === "tag" && node.name == "tbody") {
          data.elements.push(this.parseTable(node));
        }
      });
    }

    if (element.name.match(/h\d/)) {
      data.elements.push(new HtmlProcessedHeader(Number(element.name[1]), element.firstChild.data));
    }

    element.children.forEach((node) => this.traverseChildren(data, node));
  }
}
