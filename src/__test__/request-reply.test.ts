import { ampq } from "../AMQPWrapper";
import amqpUrl from "./amqp-url";
import { Reply } from "../Reply";
import { Request } from "../Request";

interface RequestReply {
    num1: number
    num2: number
}

describe('request-reply', () => {

    beforeAll(async () => {
        await ampq.connect(amqpUrl);
    });

    afterAll(async () => {
        await ampq.close();
    });

    it('should receive a message and reply a message', async () => {
        const reply = new Reply<RequestReply>('request-reply-queue')
        reply.listen((message) => {
            const num1 = message.data.num1;
            const num2 = message.data.num2;

            return num1 + num2;
        });

        const response = await new Request<RequestReply>('request-reply-queue').send({ num1: 10, num2: 15 });

        expect(response).toBe(25);

        reply.close();
    });
})