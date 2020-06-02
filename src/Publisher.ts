import { Base } from "./Base";

export class Publisher<T extends any> extends Base {

    private _exchange: string;

    constructor(exchange: string) {
        super();
        this._exchange = exchange;
    }

    async send(message: T) {
        const channel = await this._connection.createChannel();

        await channel.assertExchange(this._exchange, 'fanout', {
            durable: true
        });

        await channel.publish(this._exchange, '', Buffer.from(JSON.stringify(message)), {
            persistent: true
        });

        await channel.close();
    }
}