export class HtmlProcessedData {
  elements: Array<
    HtmlProcessedTable | HtmlProcessedHeader | HtmlProcessedImage | HtmlProcessedText
  >;
}

export class HtmlProcessedTable {
  constructor(public rows: HtmlProcessedTableRow[]) {}
}
export class HtmlProcessedImage {
  constructor(public buffer: Buffer, public height: number, public width: number) {}
}

export class HtmlProcessedTableRow {
  constructor(public cells: Array<HtmlProcessedText[]>) {}
}
export class HtmlProcessedText {
  constructor(
    public text: string,
    public bold: boolean = false,
    public style: { [attr: string]: string } = {}
  ) {}
}
export class HtmlProcessedHeader {
  constructor(public level: number, public text: string) {}
}
