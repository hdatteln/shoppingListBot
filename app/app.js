const express = require('express');
const bodyParser = require('body-parser');
const {createEventAdapter} = require('@slack/events-api');
const {WebClient} = require('@slack/web-api');
const {createMessageAdapter} = require('@slack/interactive-messages');
const shoplist = require('./modals/shopList');
const Dao = require('./db/dao');
const appDao = new Dao('shoplist.db');
const port = process.env.PORT || 3000;
const app = express();
const slackEvents = createEventAdapter(process.env.CLIENT_SIGNING_SECRET);
const slackInteractions = createMessageAdapter(process.env.CLIENT_SIGNING_SECRET);
const token = process.env.BOT_TOKEN;
const webClient = new WebClient(token);

let currentListView = null;

app.use('/slack/actions', slackInteractions.expressMiddleware());
app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Starts server
app.listen(port, function () {
  console.log('Bot is listening on port ' + port);
});

slackInteractions.action({actionId: 'removeFrom_shoplist_btn'}, async (payload) => {
  let removeItem = [];
  payload.actions.map((ac) => {
    removeItem.push(ac.value);
    appDao.run(`DELETE FROM shoplist WHERE item = ?`,
      [ac.value]);
  });
  webClient.views.update(shoplist.getUpdatedShopListView(currentListView, removeItem)).then((r) => {
    currentListView = r.view;
  });
});

slackInteractions.viewSubmission('shoplist_modal_submit', async (payload) => {
  const shopItemsToAdd = shoplist.getAddedShopListItems(payload.view.state.values);
  shopItemsToAdd.map((citem) => {
    if (citem.trim() !== 'none' && citem.trim() !== '') {
      appDao.run('INSERT INTO shoplist (item) VALUES (?)', [citem.trim()]);
    }
  });
  return {
    response_action: 'clear'
  };
});

slackInteractions.action({actionId: 'edit_shop_list'}, async (payload) => {
  webClient.views.open({
      trigger_id: payload.trigger_id,
      view: shoplist.bkShopListForm
    }
  ).then((res, err) => {
    if (err) {
      console.log('Error: ', rr);
    }
  });
});

slackInteractions.action({actionId: 'view_shop_list'}, async (payload) => {
  appDao.all('SELECT item from shoplist').then((result) => {
    webClient.views.open({
        trigger_id: payload.trigger_id,
        view: shoplist.getShopListView(result)
      }
    ).then((res, err) => {
      if (err) {console.log('Error: ', err);}
      currentListView = res.view;
    });
  });
});

slackEvents.on('app_mention', async (event) => {
  shoplist.bkStartMessage.channel = event.channel;
  webClient.chat.postMessage(shoplist.bkStartMessage).then((res, err) => {
    if (err) {
      console.log('error: ', err);
    }
  });
});