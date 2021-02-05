export class HtmlProcessedData {
  elements: Array<
    HtmlProcessedTable | HtmlProcessedHeader | HtmlProcessedImage | HtmlProcessedText
  >;
  constructor() {
    this.elements = [];
  }
}

interface Attributes {
  [attr: string]: string | undefined;
}

export interface TableAttributes extends Attributes {
  border?: string;
  bordercolor?: string;
  width?: string;
  style?: string;
}

export class HtmlProcessedTable {
  constructor(public rows: HtmlProcessedTableRow[], public tableAttributes?: TableAttributes) {}
}
export class HtmlProcessedImage {
  constructor(public buffer: Buffer, public height: number, public width: number) {}
}

export class HtmlProcessedTableRow {
  constructor(public cells: Array<HtmlProcessedText[]>) {}
}
export class HtmlProcessedText {
  constructor(public text: string, public bold: boolean = false, public style: Attributes = {}) {}
}
export class HtmlProcessedHeader {
  constructor(public level: number, public text: string) {}
}
