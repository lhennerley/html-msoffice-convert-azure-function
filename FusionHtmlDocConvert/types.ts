export class HtmlProcessedData {
  elements: Array<HtmlProcessedTable | HtmlProcessedHeader>;
}

export class HtmlProcessedTable {
  constructor(public rows: HtmlProcessedTableRow[]) {}
}

export class HtmlProcessedTableRow {
  constructor(public cells: string[]) {}
}

export class HtmlProcessedHeader {
  constructor(public level: number, public text: string) {}
}
