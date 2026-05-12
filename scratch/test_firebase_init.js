const pushService = require('./backend/utils/pushNotificationService');
const notifyUser = require('./backend/utils/notifyUser');

console.log('Push Service loaded. Firebase Initialized:', pushService.firebaseInitialized);
console.log('Notify User loaded.');

process.exit(0);
