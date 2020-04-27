const bkShopList = {
  "type": "modal",
  "callback_id": "shoplist_modal_view",
  "title": {
    "type": "plain_text",
    "text": "Shopping List",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": "This is the current shopping list. \nYou can tick off items in order to remove it from the list",
        "emoji": true
      }
    }
  ]
};
const bkShopListForm = {
  "type": "modal",
  "callback_id": "shoplist_modal_submit",
  "title": {
    "type": "plain_text",
    "text": "Shopping List",
    "emoji": true
  },
  "submit": {
    "type": "plain_text",
    "text": "Submit",
    "emoji": true
  },
  "close": {
    "type": "plain_text",
    "text": "Close",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Add items to the list by picking from a list of common items, or enter an item manually"
      }
    },
    {
      "type": "input",
      "block_id": "addTo_shoplist_select_block",
      "element": {
        "type": "multi_static_select",
        "action_id": "addTo_shoplist_select",
        "placeholder": {
          "type": "plain_text",
          "text": "Select conversations",
          "emoji": true
        },
        "options": [
          {
            "text": {
              "type": "plain_text",
              "text": "none",
              "emoji": true
            },
            "value": "none"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "bananas",
              "emoji": true
            },
            "value": "bananas"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "chocolate",
              "emoji": true
            },
            "value": "chocolate"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "coffee",
              "emoji": true
            },
            "value": "coffee"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "milk",
              "emoji": true
            },
            "value": "milk"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "water",
              "emoji": true
            },
            "value": "water"
          }
        ]
      },
      "label": {
        "type": "plain_text",
        "text": "Pick one or more items from the list",
        "emoji": true
      }
    },
    {
      "type": "input",
      "block_id": "addTo_shoplist_input_block",
      "element": {
        "type": "plain_text_input",
        "action_id": "addTo_input",
        "multiline": true
      },
      "label": {
        "type": "plain_text",
        "text": "Add additional items (one item per line)",
        "emoji": true
      }
    }
  ]
};
module.exports = {
  bkShopList,
  bkShopListForm
};