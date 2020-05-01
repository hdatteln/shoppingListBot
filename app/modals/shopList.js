const bkStartMessage = {
  'blocks': [{
    'type': 'section',
    'text': {'type': 'mrkdwn', 'text': ':wave: Hello'}
  }, {
    'type': 'section',
    'text': {'type': 'mrkdwn', 'text': 'To add to the shopping list, click *Edit*'},
    'accessory': {
      'type': 'button',
      'action_id': 'edit_shop_list',
      'style': 'primary',
      'text': {'type': 'plain_text', 'text': 'Edit', 'emoji': true},
      'value': 'edit_button_click'
    }
  }, {
    'type': 'section',
    'text': {'type': 'mrkdwn', 'text': 'To view the shopping list, click *View*'},
    'accessory': {
      'type': 'button',
      'action_id': 'view_shop_list',
      'style': 'primary',
      'text': {'type': 'plain_text', 'text': 'View', 'emoji': true},
      'value': 'view_button_click'
    }
  }]
};

const bkShopList = {
  'type': 'modal',
  'callback_id': 'shoplist_modal_view',
  'title': {
    'type': 'plain_text',
    'text': 'Shopping List',
    'emoji': true
  },
  'blocks': []
};

const bkShopListDesc = {
  'type': 'section',
  'text': {
    'type': 'plain_text',
    'text': ':shopping_trolley: We need to buy this!\n',
    'emoji': true
  }
};

const bkShopListItem = {
  'type': 'section',
  'text': {
    'type': 'mrkdwn',
    'text': ''
  },
  'accessory': {
    'type': 'button',
    'action_id': 'removeFrom_shoplist_btn',
    'style': 'danger',
    'text': {
      'type': 'plain_text',
      'text': 'Remove',
      'emoji': true
    },
    'value': ''
  }
};

const bkShopListForm = {
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
    'text': 'Close',
    'emoji': true
  },
  'blocks': [
    {
      'type': 'section',
      'text': {
        'type': 'mrkdwn',
        'text': 'Add items to the list by picking from a list of common items, or enter an item manually'
      }
    },
    {
      'type': 'input',
      'block_id': 'addTo_shoplist_select_block',
      'optional': true,
      'element': {
        'type': 'multi_static_select',
        'action_id': 'addTo_shoplist_select',
        'placeholder': {
          'type': 'plain_text',
          'text': 'Pick from popular items',
          'emoji': true
        },
        'options': [
          {
            'text': {
              'type': 'plain_text',
              'text': 'bananas',
              'emoji': true
            },
            'value': 'bananas'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'blueberries',
              'emoji': true
            },
            'value': 'blueberries'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'chocolate',
              'emoji': true
            },
            'value': 'chocolate'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'coffee',
              'emoji': true
            },
            'value': 'coffee'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'eggs',
              'emoji': true
            },
            'value': 'eggs'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'milk',
              'emoji': true
            },
            'value': 'milk'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'toilet paper',
              'emoji': true
            },
            'value': 'toilet paper'
          },
          {
            'text': {
              'type': 'plain_text',
              'text': 'water',
              'emoji': true
            },
            'value': 'water'
          }
        ]
      },
      'label': {
        'type': 'plain_text',
        'text': 'Pick one or more items from the list',
        'emoji': true
      }
    },
    {
      'type': 'input',
      'block_id': 'addTo_shoplist_input_block',
      'element': {
        'type': 'plain_text_input',
        'action_id': 'addTo_input',
        'multiline': true,
        'initial_value': ' '
      },
      'label': {
        'type': 'plain_text',
        'text': 'Add additional items (one item per line)',
        'emoji': true
      }
    }
  ]
};

const bkListUpdateNotifyMessage = {
  'blocks': [{
    'type': 'section',
    'text': {
      'type': 'mrkdwn',
      'text': ':ok_hand: The shopping list has been updated!'
    },
    'accessory': {
      'type': 'button',
      'action_id': 'view_shop_list',
      'style': 'primary',
      'text': {'type': 'plain_text', 'text': 'View', 'emoji': true},
      'value': 'view_button_click'
    }
  }]
};

const bkListNoItems = {
  'type': 'section',
  'text': {
    'type': 'plain_text',
    'text': 'Looks like you don\'t need to buy anything',
    'emoji': true
  }
};

function getShopListView (listItems = [], exclude = []) {
  bkShopList.blocks = [bkShopListDesc];
  listItems.map((listItem) => {
    let shopItemBase = JSON.parse(JSON.stringify(bkShopListItem));
    if (listItem.item === '') {
      return null;
    } else {
      if (!exclude.includes(listItem.item)) {
        shopItemBase.text.text = `*${listItem.item}*`;
        shopItemBase.accessory.value = listItem.item;
        bkShopList.blocks.push(shopItemBase);
      }
    }
  });
  if (bkShopList.blocks.length === 1) {
    // only contains description; add blurb to say no items yet
    bkShopList.blocks.push(bkListNoItems);
  }
  return bkShopList;
}

function getUpdatedShopListView (currentListView = {}, removeItem = []) {
  let listItems = [];
  currentListView.blocks.map((block) => {
    if (block.accessory) {
      listItems.push({item: block.accessory.value});
    }
  });
  return {
    view_id: currentListView.id,
    hash: currentListView.hash,
    view: getShopListView(listItems, removeItem)
  };
}

function getAddedShopListItems (payloadViewValues) {
  let newShopItems = [];
  if (payloadViewValues.addTo_shoplist_select_block.addTo_shoplist_select.selected_options) {
    payloadViewValues.addTo_shoplist_select_block.addTo_shoplist_select.selected_options.map((item) => {
      newShopItems.push(item.text.text);
    });
  }
  let newShopTextItems = payloadViewValues.addTo_shoplist_input_block.addTo_input.value.split('\n');
  return newShopItems.concat(newShopTextItems);
}



module.exports = {
  bkShopList,
  bkShopListItem,
  bkShopListDesc,
  bkShopListForm,
  bkStartMessage,
  bkListUpdateNotifyMessage,
  getShopListView,
  getUpdatedShopListView,
  getAddedShopListItems
};