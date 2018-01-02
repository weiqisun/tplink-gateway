var sock = require('net');
var http = require('http');
var url = require('url');
var hs100api = require('hs100-api');

const log4js = require('log4js');

log4js.configure(
  {
    appenders: {
      file: {
        type: 'file',
        filename: './logs/hs105.log',
        maxLogSize: 1 * 1024 * 1024, // = 1Mb
        numBackups: 3, // keep three backup files
      }
    },
    categories: {
      default: { appenders: ['file'], level: 'info' }
    }
  }
);
const logger = log4js.getLogger('hs105');

const PORT = 8083;

var server = http.createServer(onRequest);
server.listen(PORT);
logger.info("The HS-105 controller has started");

function onRequest(request, response){
  var command = request.headers["x-hs100-command"];
  var deviceIP = request.headers["x-hs100-ip"];
  var hs100 = new hs100api.Client().getPlug({host:deviceIP});
  var msg = '';
  switch(command) {
    case "on":
      msg = 'ON  command sent to ' + deviceIP;
      logger.info(msg);
      hs100.setPowerState(true);
      response.end(msg);
      break;
    case "off":
      msg = 'OFF command sent to ' + deviceIP;
      logger.info(msg);
      hs100.setPowerState(false);
      response.end(msg);
      break;
    case "status":
      logger.info('STATUS check at ' + deviceIP);
      var p = Promise.resolve(hs100.getPowerState());
      p.then(function(data){
         var state = ((data) ? "on" : "off");
         msg = "you checked " + deviceIP +  " status:" + state;
         response.setHeader("x-hs100-status", state);
         response.end(msg);
      });
      break;
    default:
      response.end('hs100');
  }
}
