import { Base } from "./Base";
import { Channel, ConsumeMessage } from "amqplib";

export class Listener<T extends any> extends Base {

    private _queue: string;
    private _channel?: Channel;

    constructor(queue: string) {
        super();
        this._queue = queue;
    }

    async listen(handler: (message: { data: T, ack: Function, reject: Function }) => void) {
        this._channel = await this._connection.createChannel();

        await this._channel.assertQueue(this._queue, { durable: true });
        await this._channel.prefetch(1);

        await this._channel.consume(
            this._queue,
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
        return this._channel!.close();
    }
}