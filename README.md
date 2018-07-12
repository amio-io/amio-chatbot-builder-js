# amio-chatbot-builder-js

**!!WARNING!!** 

This project is in **Alpha**. We will very likely make breaking changes in this project.

## Installation

```bash
npm install amio-chatbot-builder --save
```

You will want to send and receive messages. For this purpose install [amio-sdk-js](https://github.com/amio-io/amio-sdk-js).
```bash
npm install amio-sdk-js --save
```

## Usage

### Prerequisities

1. Setup NodeJs - we prefer to use it with Express (use [generator](https://expressjs.com/en/starter/generator.html))
2. [Setup Amio webhooks](https://github.com/amio-io/amio-sdk-js#webhooks---setup--usage) 

### Basic setup
You can copy/paste this setup.

#### 1. Create state
```javascript
// file echo.state.js
const State = require('amio-chatbot-builder').State
const AmioApi = require('amio-sdk-js').AmioApi

const amioApi = new AmioApi({
    accessToken: 'get access token from https://app.amio.io/administration/settings/api'
})

class EchoState extends State {
  
  constructor(){
    super()
    this.addNextState(this, () => true)
  }
  
  async execute(channelId, contactId, webhook) {
    const {data} = webhook
    const payload = data.content ? data.content.payload : data.postback.payload
    await this._sendMessage(channelId, contactId, data.postback.payload)
  }
  
  async _sendMessage(channelId, contactId, text){
    await amioApi.messages.send({
      contact: {id: contactId},
      channel: {id: channelId},
      content: {
        type: 'structure',
        payload: {
          text,
          buttons: [{
            type: 'postback',
            title: 'Click me',
            payload: 'POSTBACK_CLICKED' 
          }]
        }
      }
    })
  }
}

module.exports = EchoState
```


#### 2. Setup chatbot
```javascript
// file my-chatbot.js
const Chatbot = require('amio-chatbot-builder').Chatbot
const EchoState = require('./path/to/echo.state.js')

class MyChatbot extends Chatbot {
  constructor(){
    super()
    const echoState = new EchoState()
    this.addPostback('POSTBACK_CLICKED', echoState)
    this.setInitialState(echoState)
  }
}

module.exports = new MyChatbot() // make it singleton (not obligatory ;)
```


#### 3. React to webhooks

After [setting up Amio webhooks](https://github.com/amio-io/amio-sdk-js#webhooks---setup--usage) you can pass the webhook events to your chatbot.

```javascript
// file router.js
// imports and setup...
const chatbot = require('./path/to/my-chatbot.js')
const WebhookRouter = require('amio-sdk-js').WebhookRouter

const amioWebhookRouter = new WebhookRouter({
    secretToken: 'get secret at https://app.amio.io/administration/channels/{{CHANNEL_ID}}/webhook'
})

amioWebhookRouter.onMessageReceived(async webhook => await chatbot.runNextState(webhook))
amioWebhookRouter.onPostbackReceived(async webhook => await chatbot.runPostback(webhook))
// you can react to other webhook events too

router.post('/webhooks/amio', (req, res) => amioWebhookRouter.handleEvent(req, res))

module.exports = router
```

### Advanced setup

#### Interceptors

// TODO

 

