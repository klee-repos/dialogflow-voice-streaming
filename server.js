
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').createServer(app);

// You can find your project ID in your Dialogflow agent settings
const projectId = 'my-weather-55a85'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const languageCode = 'en-US';

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();
// Record speech
const record = require('node-record-lpcm16');
// Imports the Google Cloud client library
const speech = require('@google-cloud/speech');
// Instantiate Google Speech Client
const speechClient = new speech.SpeechClient();

// Define Dialogflow session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

// Define Speech to text settings
const speechEncoding = 'LINEAR16';
const speechSampleRateHertz = 16000;
const speechLanguageCode = 'en-US';

function runDF(data) {
  var requestDF = {
    session: sessionPath,
    queryInput: {
      text: {
        text: data,
        languageCode: languageCode,
      },
    },
  };
  sessionClient
    .detectIntent(requestDF)
    .then(function(responses) {
      const result = responses[0].queryResult;
      console.log(result.parameters.fields.quantity.numberValue)
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

const speechRequest = {
  config: {
    encoding: speechEncoding,
    sampleRateHertz: speechSampleRateHertz,
    languageCode: speechLanguageCode,
  },
  interimResults: false, // If you want interim results, set this to true
};

// Create a recognize stream
const recognizeStream = speechClient
  .streamingRecognize(speechRequest)
  .on('error', console.error)
  .on('data', data =>
    runDF(data.results[0].alternatives[0].transcript)
  );

// Start recording and send the microphone input to the Speech API
record
  .start({
    sampleRateHertz: speechSampleRateHertz,
    threshold: 0,
    // Other options, see https://www.npmjs.com/package/node-record-lpcm16#options
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '10.0',
  })
  .on('error', console.error)
  .pipe(recognizeStream);

console.log('Listening, press Ctrl+C to stop.');

app.get('/', function(req, res){
  res.sendFile(path.resolve('./index.html'));
});

server.listen(process.env.PORT || 8080, function() {
	console.log("Node server started")
});
