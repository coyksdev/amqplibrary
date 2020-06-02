#### INSTALLATION

npm install --save amqplibrary

#### Setting up a connection

```javascript
import { amqp } from 'amqplibrary';

async function main() {
    await amqp.connect('amqp://localhost:5672');
}
```

### Usage

---

### request-reply

```javascript
import { Reply, Request } from 'amqplibrary';
```

Process A:

```javascript
// receive a request
interface Add {
    num1: number
    num2: number
}

new Reply<Add>('request-reply-queue')
    .listen((message) => {
        const num1 = message.data.num1;
        const num2 = message.data.num2;

        return num1 + num2;
    });
```

Process B:

```javascript

interface Add {
    num1: number
    num2: number
}

// send a request
const response = await new Request<Add>('request-reply-queue').send({ num1: 10, num2: 15 });
console.log(response) // 25
```

---

### send - listen

```javascript
import { Listener, Sender } from 'amqplibrary';
```

Process A:

```javascript
interface Message {
    greet: string
}

// listen to an event
new Listener<Message>('send-listen-queue')
    .listen(async (message) => {
        console.log(message.data.greet); // 'Hello' 

        message.ack(); // acknowledge message
        // message.reject(); // reject message
    });
```

Process B:

```javascript

interface Message {
    greet: string
}

new Sender<Message>('send-listen-queue')
            .send({ greet: 'Hello' });
```

---

### publish - subscribe

```javascript
import { Subscriber, Publisher } from 'amqplibrary';
```

Process A:

```javascript

interface Message {
    greet: string
}

new Subscriber<Message>('broadcast', 'broadcast-queue1')
    .listen(async (message) => {
        console.log(message.data.greet); // 'Hello, this is a broadcast message' 

        message.ack(); // acknowledge message
        // message.reject(); // reject message
    });
```

Process B:

```javascript
interface Message {
    greet: string
}

new Subscriber<Message>('broadcast', 'broadcast-queue2')
    .listen(async (message) => {
        console.log(message.data.greet); // 'Hello, this is a broadcast message' 

        message.ack(); // acknowledge message
        // message.reject(); // reject message
    });
```

Process C:

```javascript
new Publisher<Message>('broadcast')
            .send({ greet: 'Hello, this is a broadcast message' });
```
