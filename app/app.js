const express = require('express');
const bodyParser = require('body-parser');
const {createEventAdapter} = require('@slack/events-api');
const {WebClient} = require('@slack/web-api');
const {createMessageAdapter} = require('@slack/interactive-messages');

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

let itemsToBuy = [];

const modalBlock = {
  'type': 'modal',
  'callback_id': 'shoplist_modal_submit',
  'title': {
    'type': 'plain_text',
    'text': 'Shopping List',
    'emoji': true
  },
  'submit': {
    'type': 'plain_text',
    'text': 'Submit',
    'emoji': true
  },
  'close': {
    'type': 'plain_text',
    'text': 'Cancel',
    'emoji': true
  },
  'blocks': [
    {
      'type': 'section',
      'text': {
        'type': 'plain_text',
        'text': 'Add items to the shopping list, either by selecting from a list of items we often buy, or by entering into the input field',
        'emoji': true
      }
    },
    {
      'type': 'section',
      'block_id': 'regular_items_section',
      'text': {
        'type': 'mrkdwn',
        'text': 'Pick from items we buy regularly'
      },
      'accessory': {
        'type': 'multi_static_select',
        'action_id': 'shoplist_input_block',
        'placeholder': {
          'type': 'plain_text',
          'text': 'Select items',
          'emoji': true
        },
        'options': [
          {
            'text': {
              'type': 'plain_text',
              'text': 'Milk',
              'emoji': true
            },
            'value': 'milk'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Bread',
              'emoji': true
            },
            'value': 'bread'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Water',
              'emoji': true
            },
            'value': 'water'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Yoghurt',
              'emoji': true
            },
            'value': 'yoghurt'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Cat Food',
              'emoji': true
            },
            'value': 'catfood'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Toilet Paper',
              'emoji': true
            },
            'value': 'toilet paper'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Eggs',
              'emoji': true
            },
            'value': 'eggs'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'Coffee',
              'emoji': true
            },
            'value': 'coffee'
          }
        ]
      }
    }
  ]
};

slackInteractions.action({actionId: 'shoplist_input_block'}, async (payload) => {
  itemsToBuy = [];
  payload.actions.map((action => {
    if (action.block_id === 'regular_items_section') {
      itemsToBuy = action.selected_options.map((selOption) => {
        return selOption.text.text;
      });
    }
  }));
  return {
    text: 'Processing...'
  };
});

slackInteractions.viewSubmission('shoplist_modal_submit', async (payload) => {
  const blockData = payload.view.state;
  console.log('Saving shopping list: ', itemsToBuy);
  return {
    response_action: 'clear'
  };
});

slackInteractions.action({actionId: 'open_modal_button'}, async (payload) => {
  try {
    //console.log("button click recieved", payload);
    await webClient.views.open({
        trigger_id: payload.trigger_id,
        view: modalBlock
      }
    );
  } catch (e) {
    console.log('Error: ', e);
  }
  return {
    text: 'Processing...'
  };
});

slackEvents.on('app_mention', async (event) => {
  const message_text = event.text;
  if (message_text.toLowerCase().includes('make list')) {
    try {
      const messageBlock = {
        'channel': event.channel,
        'blocks': [{
          'type': 'section',
          'text': {'type': 'mrkdwn', 'text': 'Click the Create button to make a new list'},
          'accessory': {
            'type': 'button', 'action_id': 'open_modal_button', // We need to add this
            'text': {'type': 'plain_text', 'text': 'Create', 'emoji': true}, 'value': 'launch_button_click'
          }
        }]
      };
      const res = await webClient.chat.postMessage(messageBlock);
    } catch (e) {
      console.log('error: ', e);
    }
  } else if (message_text.toLowerCase().includes('show list')) {
    try {
      let itemString = itemsToBuy.join('\n');
      const defaultMessageBlock = {
        'channel': event.channel,
        'text': 'SHOPLIST:\n' + itemString
      };
      const res = await webClient.chat.postMessage(defaultMessageBlock);
    } catch (e) {
      console.log('error: ', e);
    }
  } else {
    try {
      const defaultMessageBlock = {
        'channel': event.channel,
        'text': 'Hello!\nIf you want to create a new shopping list, type `@shoplist make list`.\nIf you want to view the existing list, type `@shoplist show list`'
      };
      const res = await webClient.chat.postMessage(defaultMessageBlock);
    } catch (e) {
      console.log('error: ', e);
    }
  }
});