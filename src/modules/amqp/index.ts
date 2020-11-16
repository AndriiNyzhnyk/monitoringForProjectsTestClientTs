'use strict';

import * as Amqplib from 'amqplib';

// Get process environments
const { AMQP_URL } = process.env;

export default class AMQP {
    public static instance: object | undefined;
    connection: Amqplib.Connection;
    channel: Amqplib.Channel;
    queue: object;


    static async getInstance() {
        if (typeof AMQP.instance === 'undefined') {
            const data = await AMQP._initializeConnection();
            return new AMQP(data);
        }

        return AMQP.instance;
    }

    static async _initializeConnection() {
        const targetQueue = 'monitoring';
        const connection: Amqplib.Connection = await Amqplib.connect(AMQP_URL);
        const channel = await connection.createChannel();
        const queue = await channel.assertQueue(targetQueue);

        console.log('Connection to AMQP server was successful');
        return { connection, channel, queue, targetQueue };
    }

    constructor({ connection, channel, queue, targetQueue }) {
        if (typeof AMQP.instance !== 'undefined') {
            return;
            // return AMQP.instance;
        }

        this.sendDataToServer = this.sendDataToServer.bind(this);

        this.connection = connection;
        this.channel = channel;
        this.queue = queue;

        AMQP.instance = this;
        return this;
    }

    public async sendDataToServer(targetQueue = 'monitoring', message) {
        return this.channel.sendToQueue(targetQueue, Buffer.from(message));
    }
}
