'use strict';

import { launch } from './server';

launch()
    .then( (server) => {
        console.log(`Server up and running at: ${server.info.uri}`);
    })
    .catch((err) => {
        console.error(err);
    });