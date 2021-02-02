import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { HtmlProcessor } from "./HtmlProcessor";
import { GenerateDocx } from "./MicrosoftOffice";

export const htmlStringToDocxBuffer = async (html: string): Promise<Buffer> => {
    const htmlProcessor = new HtmlProcessor(html);
    const processedData = htmlProcessor.parse();

    return await GenerateDocx(processedData);
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const docBuffer = htmlStringToDocxBuffer(req.body.toString())

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: docBuffer,
        headers: {
            "Content-Disposition": 'attachment; filename=' + 'test.docx',
            "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
    };
};

export default httpTrigger;