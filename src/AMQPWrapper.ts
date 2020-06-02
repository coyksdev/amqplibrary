import amqplib, { Connection } from 'amqplib';

class AMQPWrapper {

    private _connection?: Connection;

    async connect(url: string, socketOptions?: any) {
        this._connection = await amqplib.connect(url, socketOptions);
    }

    get connection(): Connection {
        if (!this._connection) {
            throw new Error('RabbitMQ is not connected.');
        }

        return this._connection;
    }

    async close() {
        return this._connection?.close();
    }
}

export const ampq = new AMQPWrapper();