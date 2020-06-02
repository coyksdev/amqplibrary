import { ampq } from "../AMQPWrapper";
import amqpUrl from "./amqp-url";

describe('AMQPWrapper', () => {
    it('should create a connection', async () => {
        await ampq.connect(amqpUrl);

        expect(ampq.connection).not.toBeNull;
        expect(ampq.connection).not.toBeUndefined;

        ampq.close();
    });
});
