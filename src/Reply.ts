import { Base } from "./Base";
import { ConsumeMessage, Channel } from "amqplib";

export class Reply<T extends any> extends Base {
    private _queue: string;
    private _channel?: Channel;

    constructor(queue: string) {
        super();
        this._queue = queue;
    }

    async listen(handler: (message: { data: T }) => void) {
        this._channel = await this._connection.createChannel();

        await this._channel.assertQueue(this._queue, { durable: false });
        await this._channel.prefetch(1);

        this._channel.consume(this._queue, async (msg: ConsumeMessage | null) => {
            const reply = await Promise.resolve(
                handler({ data: JSON.parse(msg!.content.toString()) })
            );

            await this._channel!.sendToQueue(
                msg!.properties.replyTo,
                Buffer.from(JSON.stringify(reply)),
                {
                    correlationId: msg!.properties.correlationId
                }
            );

            await this._channel!.ack(msg!);
        });
    }

    async close() {
        return this._channel!.close();
    }
}