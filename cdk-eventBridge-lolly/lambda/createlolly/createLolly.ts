import { lolly } from "../lolly/lolly";
const { DynamoDB, EventBridge } = require("aws-sdk");
const client = new DynamoDB.DocumentClient();
const eb = new EventBridge();

async function createLolly(lolly: lolly) {
  const params = {
    TableName: process.env.LOLLY_TABLE,
    Item: lolly,
  };
  const eventParams = {
    Entries: [
      {
        Source: "appsync",
        DetailType: "lollyCreated",
        EventBusName: "lollyAppEventBridge",
        Detail: JSON.stringify({
          lolly: lolly,
        }),
      },
    ],
  };
  try {
    const result = await eb.putEvents(eventParams).promise();
    console.log(await result);
    const data = await client.put(params).promise();
    return lolly;
  } catch (err) {
    console.log("catch error", err);
    return null;
  }
}
export default createLolly;
