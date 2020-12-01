const { DynamoDB } = require("aws-sdk");
const client = new DynamoDB.DocumentClient();

async function getLollies(){
  const params={
    TableName: process.env.LOLLY_TABLE,
  };
  try {
    const data = await client.scan(params).promise();
    return data.Items
  } catch (err) {
    console.log("getLollies error", err);
    return null;
  }
}
export default getLollies