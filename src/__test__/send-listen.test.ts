import { ampq } from "../AMQPWrapper";
import amqpUrl from "./amqp-url";
import { Listener } from "../Listener";
import { Sender } from "../Sender";

interface SendListenEvent {
    greet: string
}

describe('send-listen', () => {

    beforeAll(async () => {
        await ampq.connect(amqpUrl);
    });

    afterAll(async () => {
        await ampq.close();
    });

    it('should receive a message', (done) => {
        const listener = new Listener<SendListenEvent>('send-listen-queue');

        listener.listen(async (message) => {
            message.ack();
            await listener.close();
            return done();
        });

        new Sender<SendListenEvent>('send-listen-queue')
            .send({ greet: 'Hello' });
    });

    it('should reject a message', (done) => {
        const listener = new Listener<SendListenEvent>('send-listen-queue');
        listener.listen(async (message) => {
            message.reject();
            await listener.close();
            return done();
        });

        new Sender<SendListenEvent>('send-listen-queue')
            .send({ greet: 'Hello <Rejected>' });
    });

    it('should consume rejected a message', (done) => {
        const listener = new Listener<SendListenEvent>('send-listen-queue');
        listener.listen(async (message) => {
            message.ack();
            await listener.close();
            return done();
        });
    });
})