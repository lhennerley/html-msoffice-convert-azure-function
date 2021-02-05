import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { HtmlProcessor } from "./FusionHtmlDocConvert/HtmlProcessor";
import { GenerateDocx } from "./FusionHtmlDocConvert/MicrosoftOffice";

const htmlStringToDocxBuffer = async (html: string): Promise<Buffer> => {
    const htmlProcessor = new HtmlProcessor(html);
    const processedData = htmlProcessor.parse();
    return await GenerateDocx(await processedData);
};

const args = process.argv.slice(2);
if (!args.length) {
    console.error("No input file");
    process.exit(1);
}

const inputFilename = args[0];
const inputFilepath = path.join(process.cwd(), inputFilename);

console.log(`Loading ${inputFilename}`);
let html = "";
try {
    html = readFileSync(inputFilepath).toString();
} catch (err) {
    console.error(err.message);
    process.exit(1);
}

(async () => {
    console.log("Converting HTML to Docx");
    const doc = await htmlStringToDocxBuffer(html);

    const outputFilename = `${inputFilename.replace(/\.html/i, "")}.docx`;
    console.log(`Saving as ${outputFilename}`);
    writeFileSync(path.join(process.cwd(), outputFilename), doc);
})();
