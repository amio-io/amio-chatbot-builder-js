# amio-chatbot-builder-js

[![npm version](https://badge.fury.io/js/amio-chatbot-builder.svg)](https://badge.fury.io/js/amio-chatbot-builder)

Amio Chatbot Builder is a simple bot framework that simulates a state machine chatbot. You can easily add NLP and analytics features though.
We, are using it on our own chatbot projects. Just like [Amio](https://amio.io/), the framework aims to be platform agnostic. 
Check out all the [supported platforms](https://docs.amio.io/v1.0/reference#messages).  

Let us know how to improve this library. We'll be more than happy if you report any issues or even create pull requests. ;-)

- [Installation](https://github.com/amio-io/amio-chatbot-builder-js#installation)
- [Usage](https://github.com/amio-io/amio-chatbot-builder-js#usage)
  - [Prerequisities](https://github.com/amio-io/amio-chatbot-builder-js#prerequisities)
  - [Basic setup](https://github.com/amio-io/amio-chatbot-builder-js#basic-setup)
    - [1. Create state](https://github.com/amio-io/amio-chatbot-builder-js#1-create-state)
    - [2. Setup chatbot](https://github.com/amio-io/amio-chatbot-builder-js#2-setup-chatbot)
    - [3. React to webhooks](https://github.com/amio-io/amio-chatbot-builder-js#3-react-to-webhooks)
- [Chatbot](https://github.com/amio-io/amio-chatbot-builder-js#chatbot)
- [State](https://github.com/amio-io/amio-chatbot-builder-js#state)
  - [State transitions - static vs. dynamic](https://github.com/amio-io/amio-chatbot-builder-js#state-transitions---static-vs-dynamic)
- [Cache](https://github.com/amio-io/amio-chatbot-builder-js#cache)
- [Interceptor](https://github.com/amio-io/amio-chatbot-builder-js#interceptor)
- [Logging](https://github.com/amio-io/amio-chatbot-builder-js#logging)
- [How to get contactId/channelId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)
  
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
    this.addNextState(this, webhook => true)
  }
  
  async execute(channelId, contactId, webhook) {
    const {data} = webhook
    const payload = data.content ? data.content.payload : data.postback.payload
    await this._sendMessage(channelId, contactId, payload)
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
const express = require('express')
const router = express.Router()
const chatbot = require('./path/to/my-chatbot.js')
const WebhookRouter = require('amio-sdk-js').WebhookRouter

const amioWebhookRouter = new WebhookRouter({
    secrets: {
      // CHANNEL_ID: SECRET
      // get CHANNEL_ID at https://app.amio.io/administration/channels/
      // get SECRET at https://app.amio.io/administration/channels/{{CHANNEL_ID}}/webhook
      '15160185464897428':'thzWPzSPhNjfdKdfsLBEHFeLWW',
      '48660483859995133':'fdsafJzSPhNjfdKdfsLBEjdfks'
    }
})

amioWebhookRouter.onMessageReceived(async webhook => await chatbot.runNextState(webhook))
amioWebhookRouter.onPostbackReceived(async webhook => await chatbot.runPostback(webhook))
// you can react to other webhook events too

router.post('/webhooks/amio', (req, res) => amioWebhookRouter.handleEvent(req, res))

module.exports = router
```

## Chatbot

Chatbot represents a state machine. The most important methods you'll be using are `chatbot.runNextState()` and `chatbot.runPostback()`.

You can set it up using either inheritance or composition:
```javascript
//Inheritance
class MyChatbot extends Chatbot {
  constructor(){
    super()
    this.addPostback()
    // ...
  }
}

// Composition
const chatbot = new Chatbot()
chatbot.addPostback()
// ...
```  

Method  | Params | Description
------- | ------ | -----------  
addInterceptor  | [interceptor](https://github.com/amio-io/amio-chatbot-builder-js#interceptor) | Registers a new interceptor at the end of the interceptor chain. 
addPostback  | key<br/>[state](https://github.com/amio-io/amio-chatbot-builder-js#state) | Registers a state that will be invoked after postback with a specific `key` is received 
runNextState | [webhook](https://docs.amio.io/v1.0/reference#section-webhook-content) | How it works:<br/>&emsp;1. Iterate all interceptors\` `before()`.<br/>&emsp;2. Keep executing states while `state.execute()` returns a state.<br/>&emsp;3. Iterate all interceptors\` `after()`.<br/><br />**Warning -** If an interceptor returns false, go directly to step 3.   
runPostback | [webhook](https://docs.amio.io/v1.0/reference#section-webhook-content) | Picks a correct state that was registered using `chatbot.addPostback()`. Then it executes `chatbot.runNextState()`    
setErrorPostbackState | [state](https://github.com/amio-io/amio-chatbot-builder-js#state) | State that is executed if no postback is matching the key registered in `chatbot.addPostback(key, state)`.
setInitialState | [state](https://github.com/amio-io/amio-chatbot-builder-js#state) | If no postback starts the chatbot, the initial state will be executed as the very first state.  
setInterceptors | array([interceptor](https://github.com/amio-io/amio-chatbot-builder-js#interceptor)) interceptors | Sets the whole interceptor chain. The first interceptor is to be run first.
setPostbackKeyExtractor | function | Normalizes postback key so that it can be used to find a correct. It's useful if you're passing some data in postback like `'POSTBACK:ARBITRARY_DATA'`. In this case, you would register a state as `chatbot.addpostback('POSTBACK', state)`<br/><br/>It accepts webhook.data.postback.payload as the function argument. 

## State

State holds all the steps a chatbot shall do upon receiving a webhook. It's a reusable piece of logic. 
Generally, one state will consist of several 'message sends'. 

Method  | Params | Description
------- | ------ | -----------
addNextState | [nextState](https://github.com/amio-io/amio-chatbot-builder-js#state)<br/>condition | Adds a [static transition](https://github.com/amio-io/amio-chatbot-builder-js#state-transitions---static-vs-dynamic) to a next state. If `condition(webhook)` return true. The state will be selected for execution. 
execute | [channelId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>[contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>[webhook](https://docs.amio.io/v1.0/reference#section-webhook-content) | Executes state\`s logic. If you return a new state it will run immediately - it is so called [dynamic transition](https://github.com/amio-io/amio-chatbot-builder-js#state-transitions---static-vs-dynamic).  

### State transitions - static vs. dynamic 

**Static transitions** between states are known from the app startup (or from the compilation). They are defined as `chatbot.addPostback(key, state)` or as `state.addNextState(state, condition)`.
```javascript
function condition(webhook){
  if(now() % 2 === 0) return true // use this state after next webhook event is received
  
  return false
}
```

**Dynamic transitions** between states are decided either in `state.execute()` or anywhere you call `chatbotCache.setNextState()`. 
You can run a state immediately without having to wait for another webhook if you return it from `state.execute()`. 

```javascript
class MyState extends State {
  
  execute(channelId, contactId, {data}){
    if(data.content) { 
      console.log('I will execute YourState right now!')
      return new YourState() 
    } 
    
    console.log('just log') 
  }
}
``` 

## Cache

Chatbot uses a cache that is referenced in code like `chatbotCache`. It keeps temporary data about a contact. 
The contact is always identified by `contactId`. You can use it to store and retrieve your data using `chatbot.set()`
and `chatbot.get()`.

By default, the cache stores:
- last 100 clients (LRU)
- next state - `chatbot.setNextState()`
- last 20 states `chatbot.getPastStates()`


Method  | Params | Description
------- | ------ | -----------
get | [contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>key<br/>defaultValue = null | Returns a value for a `key` of contact with `contactId`.   
getLastState | [contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid) | Returns last visited state.
getNextState | [contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid) | Returns the next state that will be executed by chatbot.
getPastStates | [contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid) | Returns last 20 states executed for contact `contactId`.
reset | | Clears the cache.
set | [contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>key<br/>value | Add `value` to a `key` of contact with `contactId`.

## Interceptor

Interceptors are used to influence received webhook events either before or after a state is executed. 
An interceptor is a class that extends `require('amio-chatbot-builder').Interceptor`.
Register interceptors using `chatbot.setInterceptors([interceptor1, ...])`

How the interceptors work:

1. Your server receives a webhook event.
2. You pass the event over to chatbot via `chatbot.runNextState(webhook)`
3. Chatbot first iterate all interceptors\` `before()`. The first interceptor that returns `false` breaks the interceptor chain and state execution is skipped. Go directly to step 5.
4. Chatbot keeps executing states while `state.execute()` returns a new state.
5. Chatbot iterates all interceptors\` `after()`.  

[SEE EXAMPLE](docs/interceptors.md) .

Method  | Params | Description
------- | ------ | -----------  
before | [channelId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>[contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>[webhook](https://docs.amio.io/v1.0/reference#section-webhook-content)| `before()` is executed before the state itself. Return `false` if you wish to prevent the state execution. No other interceptors will be run either.<br/>You can also change state using `chatbotCache.setNextState(newState)`.
after | [channelId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>[contactId](https://github.com/amio-io/amio-chatbot-builder-js#how-to-get-contactidchannelid)<br/>[webhook](https://docs.amio.io/v1.0/reference#section-webhook-content)| `after()` is executed after the state execution. It good for a clean up. All registered interceptors are always executed. 

## Logging

If you want to enable logs, add namespace `amio-chatbot-builder-js:*` to your `DEBUG` environment variable.
```
process.env.DEBUG = 'your-project-namespace:*,amio-chatbot-builder-js:*'
```

For more details check [debug lib](https://github.com/visionmedia/debug) and the [logz.io wrapper](https://github.com/amio-io/logzio-node-debug).

## How to get contactId/channelId

`contactId`/`channelId` can be obtained from every [webhook](https://docs.amio.io/v1.0/reference#section-webhook-content). We are trying to resolve them 
for you and pass to all methods where they may be needed frequently like `state.execute(channelId, contactId, webhook)`.

```javascript
const contactId = webhook.data.contact.id
const channelId = webhook.data.channel.id
```
