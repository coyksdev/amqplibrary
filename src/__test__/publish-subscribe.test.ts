import { ampq } from "../AMQPWrapper";
import amqpUrl from "./amqp-url";
import { Subscriber } from "../Subscriber";
import { Publisher } from "../Publisher";

interface PublishSubscribeEvent {
    greet: string
}

describe('publish-subscribe', () => {
    beforeAll(async () => {
        jest.setTimeout(60000);
        await ampq.connect(amqpUrl);
    });

    afterAll(async () => {
        await ampq.close();
    });

    it('should receive a message', (done) => {
        const subscriber = new Subscriber<PublishSubscribeEvent>('subscriber-exchange1', 'subscriber-queue');
        subscriber.listen(async (message) => {
            message.ack();

            await subscriber.close();
            return done();
        });

        new Publisher<PublishSubscribeEvent>('subscriber-exchange1')
            .send({ greet: 'Hi' });
    });

    it('should receive by multiple subscriber', (done) => {
        let count = 0;
        let oneDone = false;
        let twoDone = false

        function tryDone() {
            count++;
            if (count === 2 && oneDone && twoDone) {
                return done();
            }
        }
        const subscriber1 = new Subscriber<PublishSubscribeEvent>('subscriber-exchange2', 'subscriber-queue1');
        subscriber1.listen(async (message) => {
            message.ack();
            oneDone = true;

            await subscriber1.close();

            return tryDone();
        });

        const subscriber2 = new Subscriber<PublishSubscribeEvent>('subscriber-exchange2', 'subscriber-queue2');
        subscriber2.listen(async (message) => {
            message.ack();
            twoDone = true;

            await subscriber2.close();

            return tryDone();
        });

        new Publisher<PublishSubscribeEvent>('subscriber-exchange2')
            .send({ greet: 'Hi' });

        new Publisher<PublishSubscribeEvent>('subscriber-exchange2')
            .send({ greet: 'Hi' });
    });
})