import { Base } from "./Base";
import { v1 as uuidv1 } from 'uuid';
import { ConsumeMessage } from "amqplib";

export class Request<T extends any> extends Base {

    private _queue: string;

    constructor(queue: string) {
        super();
        this._queue = queue;
    }

    async send(message: T): Promise<any> {
        const channel = await this._connection.createChannel();

        const q = await channel.assertQueue('', { exclusive: true, autoDelete: true });

        const correlationId = uuidv1();

        await channel.sendToQueue(this._queue, Buffer.from(JSON.stringify(message)), {
            correlationId,
            replyTo: q.queue
        });

        return Promise.race([
            new Promise(async (resolve, _) => {
                await channel.consume(
                    q.queue,
                    async (msg: ConsumeMessage | null) => {
                        if (msg!.properties.correlationId === correlationId) {
                            channel.close();
                            resolve(JSON.parse(msg!.content.toString()));
                        }
                    },
                    { noAck: true }
                );
            }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject('rpc timeout');
                }, 20000);
            })
        ]).catch(error => {
            channel.close();
            throw error;
        });
    }
}