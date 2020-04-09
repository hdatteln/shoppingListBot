const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const signature = require('./verifySignature');

const app = express();

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length)  req.rawBody = buf.toString(encoding || 'utf8');
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

const server = app.listen(3000);

app.post('/command', async (req, res) => {

  if(!signature.isVerified(req)) {
    res.sendStatus(404);
    return;

  } else {
    const query = req.body.text ? req.body.text : 'add, milk';
    const queries = query.split(',');
    const todo = queries.shift(); // "Pizza"
    const product = queries; // "San Francisco, CA"
    const retval = [{'name': 'milk'}, {'name': 'bread'}, {'name': 'bananas'}];
  }

  const message = {
    response_type: 'in_channel',
    text: retval[0].name,
  };
  res.json(message);
});