
import React from 'react';

import springboard from 'springboard';

// TODO: Fix @jamtools/core to not pull in Node services in browser builds
// import './features/src/modules';

springboard.registerModule('example', {}, async (app) => {
    app.registerRoute('/', {}, () => {
        return <h1>Example</h1>;
    });

    return {

    };
})
