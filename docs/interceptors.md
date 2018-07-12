# Setup interceptor

## 1. Create interceptor 
```javascript
// file default-notification.interceptor.js
const Interceptor = require('amio-chatbot-builder').Interceptor

class DefaultNotificationsInterceptor extends Interceptor {
  
  async before(channelId, contactId, webhook) {
    await sendNotification(channelId, contactId, 'typing_on')
    await sendNotification(channelId, contactId, 'messages_read')
  }
  
  async after(channelId, contactId, webhook) {
    await sendNotification(channelId, contactId, 'typing_off')
  }
  
}

async function sendNotification(channelId, contactId, type) {
  await amioApi.notifications.send({
    contact: {id: contactId},
    channel: {id: channelId},
    type
  })
}

module.exports = new DefaultNotificationsInterceptor()
```

## 2. Register interceptor


```javascript
const defaultNotificationsInterceptor = require('./path/to/default-notification.interceptor.js')

class MyChatbot extends Chatbot {
  constructor(){
    super()
    // other chatbot settings
    
    this.setInterceptors([
      defaultNotificationsInterceptor
    ])
  }
}

module.exports = new MyChatbot() // make it singleton (not obligatory ;)
```

 



