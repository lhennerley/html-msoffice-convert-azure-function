import * as cheerio from "cheerio"
import { Node, NodeWithChildren } from "domhandler";
import { html } from "cheerio";

export class HtmlProcessor {
    /**
     *
     */
    constructor(private htmlString: string) {
    }

    private parseTable(tbody: NodeWithChildren): HtmlProcessedTable {
        const rows = new Array<HtmlProcessedTableRow>();

        if (tbody.children) {
            tbody.children.filter((tr: any) => tr.name == "tr").forEach((tr: any) => {
                const cells = new Array<string>();
    
                const tableRow: NodeWithChildren = tr;
    
                tableRow.children.forEach((td: any) => {
                    const tableCell: NodeWithChildren = td;
                    if (tableCell.children) {
                        let cellText: NodeWithChildren = <NodeWithChildren>tableCell.firstChild;
                        while (cellText && cellText.children) {
                            cellText = <NodeWithChildren>cellText.firstChild;
                        }
                        if (cellText) {
                            cells.push((<any>cellText).data);
                        } else {
                            cells.push('');
                        }
                    }
                })
    
                rows.push(new HtmlProcessedTableRow(cells));
            })
        }
    
        return new HtmlProcessedTable(rows);
    }

    public parse() : HtmlProcessedData {
        const $ = cheerio.load(this.htmlString);
        
        const data : HtmlProcessedData = {
            elements: new Array<HtmlProcessedTable | HtmlProcessedHeader>()
        }

        $('body').children().each((index, element: any) => {
            switch(element.name) {
                case "table":
                    element.children.forEach((node: any) => {
                        if (node.name == "tbody") {
                            data.elements.push(this.parseTable(node));
                        }
                    });
                break;
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                    data.elements.push(new HtmlProcessedHeader(<number>element.name[1], element.firstChild.data));
                break;
            }
        })

        return data;
    }
}

export class HtmlProcessedData {
    elements: Array<HtmlProcessedTable | HtmlProcessedHeader>
}
export class HtmlProcessedTable {
    constructor(public rows: HtmlProcessedTableRow[]){} 
}
export class HtmlProcessedTableRow {
    constructor(public cells: string[]) {}
}
export class HtmlProcessedHeader {
    constructor(public level: number, public text: string) {}
}