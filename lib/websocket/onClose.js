"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = handleClose;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _util = require("../util");

var Util = _interopRequireWildcard(_util);

function handleClose() {
  return function (reasonCode, description) {
    Util.log(reasonCode, description);
  };
}

module.exports = exports["default"];