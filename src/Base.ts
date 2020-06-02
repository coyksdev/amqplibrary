import { Connection } from "amqplib";
import { ampq } from "./AMQPWrapper";

export class Base {
    protected _connection: Connection;

    constructor() {
        this._connection = ampq.connection;
    }
}