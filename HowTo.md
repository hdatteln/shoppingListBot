# How to develop a Slack Bot App

I used the steps from https://www.javascriptjanuary.com/blog/building-a-slack-app-with-express-and-the-node-sdk as a base, but some steps had changed a little since the article was written, so adjusted them below.

## Creating a Slack Application & Bot

1) Go to https://api.slack.com/apps
2) Click 'Create New App', select a name for your bot, and select the workspace to which you want to connect the bot.
   ![click Create New App](images/botreg1.png)
   ![Select bot name and workspace](images/botreg2.png)

## Configuring your bot
First, assign a scope to your bot token
A bot token makes it possible for users to interact with your app. A bot token lets users at-mention it, and add it to channels and conversations. It also allows you to turn on tabs in your app’s home.  
In order to do this:
1) Go to 'App Home'
   ![App Home](images/botsetup1.png)
2) Click 'Review Scopes to Add'
   ![Review Scopes](images/botsetup2.png)
3) Let's add the following bot token scopes to start with (these can be adjusted later:
   * `app_mentions:read`
   * `chat:write`
   * `commands`
   * `users:read`
   ![Token Scopes](images/botsetup3.png)
4) After that, you can go ahead and install your new app to your workspace
   ![Install to workspace](images/botsetup4.png)
   
## Setting up the Node.js App
1) Create a new basic express app:
    ```
   const express = require('express');
   const bodyParser = require('body-parser');
       
   const port = process.env.PORT || 3000;
   const app = express();
       
   app.use(bodyParser.urlencoded({extended: true}));
   app.use(bodyParser.json());
       
   // Starts server
   app.listen(port, function() {
      console.log('Bot is listening on port ' + port)
   });
   ```
   
   
2) Add Node SDK Events API: `yarn add @slack/events-api`
3) Creating a URL for our Node Server to Accept Events:
    So you can develop locally, without having to constantly redeploy.
    Follow the steps here: https://api.slack.com/tutorials/tunneling-with-ngrok
    In the last step, run `./ngrok http 3000` (3000 matches the port in your express)
4) Create a URL endpoint to accepts the events on our Express server. Let's use this format:
  `https://[ngroc forwarding domain]/slack/events`
  this could look e.g. like this: `https://b6c1ae28.ngrok.io/slack/events`  
5) Authentication:
    Get the client signin secret under 'Basic Information':
    ![](images/appauth1.png)
    
    Then run:
   
   `$ ./node_modules/.bin/slack-verify --secret <client signin secret> https://b6c1ae28.ngrok.io/slack/events --port=3000`
   
   (if you get a 'port in already in use' error message, check if your express app is already running, and if so, stop it.)
   
6) While on the 'Basic Information' tab, save the different credentials as environment variables for later use:

```
export CLIENT_ID=xxx
export CLIENT_SECRET=xxx
export VERIFICATION_TOKEN=xxx
export CLIENT_SIGNING_SECRET=xxx
export BOT_TOKEN=xxx
```

## Enable Events:
1) Go to 'Events Subscriptions' and enable the toggle button:
   ![](images/eventsub1.png)
2) Enter your events endpoint URL, e.g.: `https://b6c1ae28.ngrok.io/slack/events` 
3) Once this URL is verified, we can stop the ./node_modules/.bin/slack-verify server.

   
Next, we need to register to which events we want our bot to have access.

1) Click Into Subscribe to bot events
2) Click Add Bot User Event
3) Search for app_mention and add it
4) Save your changes at the bottom of the page!!!!
   
## We can code now!

We can now call on the slack events-api from our express app.
In index.js, I added (note that CLIENT_SIGNING_SECRET is taken from the environment variables):

```
const { createEventAdapter } = require('@slack/events-api');
const slackEvents = createEventAdapter(process.env.CLIENT_SIGNING_SECRET);
.
.
.
(...)

app.use('/slack/events', slackEvents.expressMiddleware());

```
    
Once that's installed, we can add an event listener:

```
slackEvents.on('app_mention', async (event) => {
  try {
    console.log("I got a mention in this channel", event.channel)
  } catch (e) {
    console.log("error: ", e)
  }
});
```  
  
Start the app using `node index.js`   
To test, invite the bot to a slack channel, and mention it in a message. 
You should see the expected console output:

![](images/bottest.png)

  
