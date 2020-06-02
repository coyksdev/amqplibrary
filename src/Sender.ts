import { Connection, Options, Channel } from "amqplib";
import { Base } from "./Base";

export class Sender<T extends any> extends Base {

    private _queue: string;

    constructor(queue: string) {
        super();
        this._queue = queue;
    }

    async send(message: T) {
        const channel: Channel = await this._connection.createChannel();

        await channel.assertQueue(this._queue, { durable: true });
        await channel.sendToQueue(this._queue, Buffer.from(JSON.stringify(message)), { persistent: true });

        await channel.close();
    }
}