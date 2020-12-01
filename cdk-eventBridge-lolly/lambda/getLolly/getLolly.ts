const { DynamoDB } = require("aws-sdk");
const client = new DynamoDB.DocumentClient();

async function getLolly(lollyPath:string) {
  const params = {
    TableName: process.env.LOLLY_TABLE,
    Key:{
      lollyPath:lollyPath
    }
  };
  try {
    const data = await client.get(params).promise();
    console.log(data)
    return data.Item
  } catch (err) {
    console.log("catch error", err);
    return null;
  }
}
export default getLolly;