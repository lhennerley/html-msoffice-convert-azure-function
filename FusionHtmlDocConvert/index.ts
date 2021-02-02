import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { HtmlProcessor } from "./HtmlProcessor";
import { GenerateDocx } from "./MicrosoftOffice";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  const htmlProcessor = new HtmlProcessor(req.body.toString());
  const processedData = htmlProcessor.parse();

  const docBuffer = await GenerateDocx(processedData);

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: docBuffer,
    headers: {
      "Content-Disposition": "attachment; filename=" + "test.docx",
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  };
};

export default httpTrigger;
