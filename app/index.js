const express = require('express');
const bodyParser = require('body-parser');
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.CLIENT_SIGNING_SECRET);

const port = process.env.PORT || 3000;
const app = express();

app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Starts server
app.listen(port, function() {
  console.log('Bot is listening on port ' + port)
});

slackEvents.on('app_mention', async (event) => {
  try {
    console.log("I got a mention in this channel", event.channel)
  } catch (e) {
    console.log("error: ", e)
  }
});