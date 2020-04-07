const { Botkit } = require('botkit');
const { SlackAdapter } = require('botbuilder-adapter-slack');
require('dotenv').config();

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
  console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
  process.exit(1);
} else {
  console.log('Good job, you have the variables!');
}

const adapter = new SlackAdapter({
  clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
  botToken: process.env.BOT_TOKEN,
  json_file_store: "./db_slackbutton_slash_command/",
});

const controller = new Botkit({
  adapter,
  // ...other options
});

controller.on('message', async(bot, message) => {
  await bot.reply(message, 'I heard a message!');
});