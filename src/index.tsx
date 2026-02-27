import React from 'react';
import springboard from 'springboard';

// Temporarily commented out until @jamtools/core export conditions are published
// import '@jamtools/core/modules';
// import './features/src/modules';

import './modules/ui_main';

// Demo module to test the UI shell
springboard.registerModule('demo', {}, async (moduleAPI) => {
    moduleAPI.registerRoute('', {}, () => {
        return <div><h1>Demo Module Home</h1><p>Welcome to the demo module!</p></div>;
    });

    moduleAPI.registerRoute('settings', {}, () => {
        return <div><h1>Settings</h1><p>Configure your settings here.</p></div>;
    });

    moduleAPI.registerRoute('about', {}, () => {
        return <div><h1>About</h1><p>This is the about page.</p></div>;
    });

    return {};
});
