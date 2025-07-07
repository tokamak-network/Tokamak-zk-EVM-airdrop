#!/usr/bin/env node

const chokidar = require('chokidar');
const { exec } = require('child_process');

console.log('👀 Watching for Figma file changes...');
console.log('Press Ctrl+C to stop watching\n');

// Watch for changes in design system files (you can customize this)
const watcher = chokidar.watch(['./design-system/**/*', './figma-exports/**/*'], {
  ignored: /node_modules/,
  persistent: true
});

let syncing = false;

watcher.on('change', (path) => {
  if (!syncing) {
    syncing = true;
    console.log(`📁 File changed: ${path}`);
    console.log('🔄 Syncing with Figma...');
    
    exec('npm run figma:sync', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
      } else {
        console.log(stdout);
        console.log('✅ Figma sync completed!');
      }
      syncing = false;
    });
  }
});

// Manual sync every 5 minutes (optional)
setInterval(() => {
  if (!syncing) {
    console.log('🔄 Periodic sync...');
    exec('npm run figma:sync', (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Periodic sync error: ${error.message}`);
      } else {
        console.log('✅ Periodic sync completed!');
      }
    });
  }
}, 5 * 60 * 1000); // 5 minutes
