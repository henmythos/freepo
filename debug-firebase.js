try {
    console.log("Checking firebase/app...");
    require('firebase/app');
    console.log("SUCCESS: firebase/app");

    console.log("Checking firebase/analytics...");
    require('firebase/analytics');
    console.log("SUCCESS: firebase/analytics");

    console.log("Checking firebase/in-app-messaging...");
    require('firebase/in-app-messaging');
    console.log("SUCCESS: firebase/in-app-messaging");
} catch (e) {
    console.error("ERROR:", e.message);
    if (e.code === 'MODULE_NOT_FOUND') {
        console.log("Module not found. Checking if file exists manually...");
        const fs = require('fs');
        const path = 'node_modules/firebase/in-app-messaging';
        if (fs.existsSync(path)) {
            console.log("Directory " + path + " EXISTS.");
        } else {
            console.log("Directory " + path + " DOES NOT EXIST.");
        }

        const path2 = 'node_modules/@firebase/in-app-messaging';
        if (fs.existsSync(path2)) {
            console.log("Directory " + path2 + " EXISTS.");
        } else {
            console.log("Directory " + path2 + " DOES NOT EXIST.");
        }
    }
}
