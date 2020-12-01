import createLolly from "./createlolly/createLolly";
import getLollies from "./getlollies/getLollies";
import getLolly from "./getLolly/getLolly";
import { lolly } from "./lolly/lolly";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    lolly: lolly;
    lollyPath: string;
  };
};
exports.handler = async function (event: AppSyncEvent) {
  switch (event.info.fieldName) {
    case "getLolly":
      return await getLolly(event.arguments.lollyPath);
    case "createLolly":
      return await createLolly(event.arguments.lolly);
    case "getLollies":
      return await getLollies();
    default:
      break;
  }
};
