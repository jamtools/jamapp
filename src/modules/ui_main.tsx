import springboard from 'springboard';
import {ApplicationShell} from '../components/application_shell';

springboard.registerModule('UIMain', {}, async (moduleAPI) => {
    moduleAPI.registerApplicationShell(ApplicationShell);

    return {};
});
