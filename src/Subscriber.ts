import { Base } from "./Base";
import { Channel, ConsumeMessage } from "amqplib";

export class Subscriber<T extends any> extends Base {

    private _exchange: string;
    private _queue: string;
    private _channel?: Channel;

    constructor(exchange: string, queue: string) {
        super();
        this._exchange = exchange;
        this._queue = queue;
    }

    async listen(handler: (message: { data: T, ack: Function, reject: Function }) => void) {
        this._channel = await this._connection.createChannel();

        await this._channel.assertExchange(this._exchange, 'fanout', {
            durable: true
        });

        const q = await this._channel.assertQueue(this._queue, { durable: true });

        await this._channel.bindQueue(this._queue, this._exchange, '');
        await this._channel.prefetch(1);

        this._channel.consume(
            q.queue,
            async (msg: ConsumeMessage | null) => {
                const ack = () => this._channel!.ack(msg!);

                const reject = () => this._channel!.reject(msg!, true);

                const data: T = JSON.parse(msg!.content.toString());

                await Promise.resolve(handler({ data, ack, reject }));
            },
            { noAck: false }
        );
    }

    async close() {
        return this._channel?.close();
    }
}