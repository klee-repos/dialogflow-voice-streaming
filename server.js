
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// You can find your project ID in your Dialogflow agent settings
const projectId = 'my-weather-55a85'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Define Dialogflow session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

io.on('connection', function(socket) {
  console.log('Connected to browser...');
  socket.on('final_transcript', function(final_transcript) {
    runDF(final_transcript)
  });
});

var runDF = function(data) {
  var requestDF = {
    session: sessionPath,
    queryInput: {
      text: {
        text: data,
        languageCode: languageCode,
      },
    },
  }
  sessionClient
    .detectIntent(requestDF)
    .then(function(responses) {
      const result = responses[0].queryResult;
      // console.log(result.parameters.fields.quantity.numberValue)
      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      console.log(`  Parameters: ${result.parameters.fields.quantity}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
      } else {
        console.log(`  No intent matched.`);
      }
    })
    .catch(function(err) {
      console.error('ERROR:', err);
    })
}

app.get('/', function(req, res){
  res.sendFile(path.resolve('./index.html'));
});

server.listen(process.env.PORT || 8080, function() {
	console.log("Node server started...")
});
