const express = require('express');
const bodyParser = require('body-parser');
const {createEventAdapter} = require('@slack/events-api');
const {WebClient} = require('@slack/web-api');
const {createMessageAdapter} = require('@slack/interactive-messages');
const shoplist = require('./modals/shopList');
const Dao = require('./db/dao');

let appDao = new Dao('./db/shoplist.db');
const sl_sql = `CREATE TABLE IF NOT EXISTS shoplist (id INTEGER PRIMARY KEY AUTOINCREMENT, item TEXT)`;
appDao.run(sl_sql);


const bkShopListForm = shoplist.bkShopListForm;
const bkShopList = shoplist.bkShopList;

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

slackInteractions.action({actionId: 'removeFrom_shoplist_btn'}, async (payload) => {
  itemsToBuy = [];
  payload.actions.map((ac) => {
    console.log('removing ', ac.value);
    appDao.run(`DELETE FROM shoplist WHERE item = ?`,
      [ac.value])
  });

  return {
  };
});

slackInteractions.viewSubmission('shoplist_modal_submit', async (payload) => {
  console.log('Saving shopping list');
  let newShopItems = [];
  payload.view.state.values.addTo_shoplist_select_block.addTo_shoplist_select.selected_options.map((item) => {
    newShopItems.push(item.text.text);
  });
  let newShopTextItems = payload.view.state.values.addTo_shoplist_input_block.addTo_input.value.split('\n');
  let combinedShopItems = newShopItems.concat(newShopTextItems);
  combinedShopItems.map((citem) => {
    if(citem !== 'none') {
      appDao.run('INSERT INTO shoplist (item) VALUES (?)', [citem]);
    }

  });

  return {
    response_action: 'clear'
  };
});

slackInteractions.action({actionId: 'edit_shop_list'}, async (payload) => {
  try {
    await webClient.views.open({
        trigger_id: payload.trigger_id,
        view: bkShopListForm
      }
    );
  } catch (e) {
    console.log('Error: ', e);
  }
  return {
    text: 'Processing...'
  };
});

slackInteractions.action({actionId: 'view_shop_list'}, async (payload) => {

  appDao.all('SELECT item from shoplist').then((result) => {
    bkShopList.blocks = [    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": "This is the current shopping list. \nYou can tick off items in order to remove it from the list",
        "emoji": true
      }
    }];
    result.map((r) => {
      let section_blueprint = {
        'type': 'section',
        'text': {
          'type': 'mrkdwn',
          'text': r.item
        },
        'accessory': {
          'type': 'button',
          'action_id': 'removeFrom_shoplist_btn',
          'text': {
            'type': 'plain_text',
            'text': 'Remove',
            'emoji': true
          },
          'value': r.item
        }
      };
      bkShopList.blocks.push(section_blueprint);
    });
    try {
      webClient.views.open({
          trigger_id: payload.trigger_id,
          view: bkShopList
        }
      );
    } catch (e) {
      console.log('Error: ', e);
    }
    return {
      text: 'Processing...'
    };
  });
});

slackEvents.on('app_mention', async (event) => {
  const message_text = event.text;

  try {
    const defaultMessageBlock = {
      'channel': event.channel,
      'blocks': [{
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': ':wave: Hello'}
      }, {
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': 'If you want to add to the shopping list, click "Edit"'},
        'accessory': {
          'type': 'button', 'action_id': 'edit_shop_list',
          'text': {'type': 'plain_text', 'text': 'Edit', 'emoji': true}, 'value': 'edit_button_click'
        }
      }, {
        'type': 'section',
        'text': {'type': 'mrkdwn', 'text': 'If you want to view the shopping list, click "View"'},
        'accessory': {
          'type': 'button', 'action_id': 'view_shop_list',
          'text': {'type': 'plain_text', 'text': 'View', 'emoji': true}, 'value': 'view_button_click'
        }
      }]
    };
    const res = await webClient.chat.postMessage(defaultMessageBlock);
  } catch (e) {
    console.log('error: ', e);
  }

});