const express = require('express');
const bodyParser = require('body-parser');
const {createEventAdapter} = require('@slack/events-api');
const {WebClient} = require('@slack/web-api');
const { createMessageAdapter } = require('@slack/interactive-messages');

const port = process.env.PORT || 3000;
const app = express();

const token = process.env.BOT_TOKEN;
const webClient = new WebClient(token);
const slackEvents = createEventAdapter(process.env.CLIENT_SIGNING_SECRET);
const slackInteractions = createMessageAdapter(process.env.CLIENT_SIGNING_SECRET);

app.use('/slack/actions', slackInteractions.expressMiddleware());
app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Starts server
app.listen(port, function () {
  console.log('Bot is listening on port ' + port);
});

const modalBlock = {
  "type": "modal",
  "callback_id": "example_modal_submit",
  "title": {
    "type": "plain_text",
    "text": "My App",
    "emoji": true
  },
  "submit": {
    "type": "plain_text",
    "text": "Submit",
    "emoji": true
  },
  "close": {
    "type": "plain_text",
    "text": "Cancel",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": "This is a modal with a plain text section block.",
        "emoji": true
      }
    },
    {
      "type": "input",
      "block_id": "example_input_block",
      "element": {
        "action_id": "example_input_element",
        "type": "plain_text_input"
      },
      "label": {
        "type": "plain_text",
        "text": "Label",
        "emoji": true
      }
    }
  ]
};

slackInteractions.viewSubmission('example_modal_submit' , async (payload) => {
  const blockData = payload.view.state;
  const nameInput = blockData.values.example_input_block.example_input_element.value;
  if (nameInput.length < 2) {
    return {
      "response_action": "errors",
      "errors": {
        "example_input_block": "The input must have more than one letter."
      }
    }
  }
  return {
    response_action: "clear"
  }
});

slackInteractions.action({ actionId: 'open_modal_button' }, async (payload) => {
  try {
    await webClient.views.open({
        trigger_id: payload.trigger_id,
        view: modalBlock
      }
    )
  } catch (e) {
    console.log('Error: ', e)
  }
  return {
    text: 'Processing...',
  }
});

slackEvents.on('app_mention', async (event) => {
  try {
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
    const res = await webClient.chat.postMessage(messageBlock);
  } catch (e) {
    console.log('error: ', e);
  }
});