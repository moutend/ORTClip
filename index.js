var ORTClipServer = require("./lib/server");
var port = (process.env.PORT || 5000);
var server = new ORTClipServer(port);
