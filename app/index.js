const express = require('express');
const bodyParser = require('body-parser');
const {createEventAdapter} = require('@slack/events-api');
const {WebClient} = require('@slack/web-api');

const token = process.env.BOT_TOKEN;
const webClient = new WebClient(token);
const slackEvents = createEventAdapter(process.env.CLIENT_SIGNING_SECRET);

const port = process.env.PORT || 3000;
const app = express();

app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Starts server
app.listen(port, function () {
  console.log('Bot is listening on port ' + port);
});

slackEvents.on('app_mention', async (event) => {
  try {
    console.log(event);
    const messageBlock = {
      'channel': event.channel,
      'blocks': [{
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': 'Hello, thanks for calling me. Would you like to launch a modal?'},
        'accessory': {
          'type': 'button', 'action_id': 'open_modal_button', // We need to add this
          'text': {'type': 'plain_text', 'text': 'Launch', 'emoji': true}, 'value': 'launch_button_click'
        }
      }]
    };
    webClient.chat.postMessage(messageBlock);
  } catch (e) {
    console.log('error: ', e);
  }
});