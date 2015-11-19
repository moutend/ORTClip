import * as Util from "../util"

export default function handleClose() {
  return function(reasonCode, description) {
    Util.log(reasonCode, description);
  }
}
