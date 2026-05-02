import { detectPackageManager } from './scripts/detect-package-manager.js';

async function run() {
    console.log("Checking normal directory...");
    console.log(await detectPackageManager({ cwd: '.' }));

    console.log("\nChecking traversal to /etc (looking for /etc/package-lock.json)...");
    console.log(await detectPackageManager({ cwd: '../../../../../../../../etc' }));
}

run();
