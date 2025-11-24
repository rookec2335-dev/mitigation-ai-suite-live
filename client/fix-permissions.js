const fs = require('fs');
const path = require('path');

const reactScriptsPath = path.join(
  __dirname,
  'node_modules',
  '.bin',
  'react-scripts'
);

fs.access(reactScriptsPath, fs.constants.X_OK, (err) => {
  if (err) {
    console.log('Fixing permissions for react-scripts...');
    fs.chmod(reactScriptsPath, 0o755, (chmodErr) => {
      if (chmodErr) {
        console.error('Unable to fix permissions:', chmodErr);
      } else {
        console.log('Permissions fixed for react-scripts');
      }
    });
  } else {
    console.log('Permissions already OK');
  }
});
