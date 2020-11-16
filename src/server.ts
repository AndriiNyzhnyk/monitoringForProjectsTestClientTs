'use strict';

import * as Path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: Path.resolve(__dirname, '../.env') });


import { Server, Request, ResponseToolkit } from '@hapi/hapi';
import AMQP from './modules/amqp';
import { register, collectDefaultMetrics } from 'prom-client'


// Get process environments
const { HTTP_PORT, HTTP_HOST } = process.env;

const server: Server = new Server({
    port: HTTP_PORT,
    host: HTTP_HOST
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request: Request, h: ResponseToolkit) => {

        return 'Hello World!';
    }
});

server.route({
    method: 'POST',
    path: '/metrics',
    handler: async (request: Request, h: ResponseToolkit) => {
        const metrics = register.getMetricsAsJSON();
        // console.log(register.getMetricsAsJSON());

        // console.log(metrics);
        const AmqpClient = await AMQP.getInstance();

        if (AmqpClient instanceof AMQP) {
            await AmqpClient.sendDataToServer('monitoring', JSON.stringify(metrics));
        }

        return h.response(metrics).header('Content-Type', register.contentType);

        // AMQP.instance.sendDataToServer('monitoring', metrics)
    }
});

async function setup() {
    await AMQP.getInstance();
    collectDefaultMetrics();
}

export async function init() {

    await server.initialize();
    await setup();
    return server;
}

export async function launch() {

    await server.start();
    await setup();
    return server;
}

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});
