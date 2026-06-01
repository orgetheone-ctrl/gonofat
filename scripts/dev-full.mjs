import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';
const apiUrl = 'http://localhost:8790';
const appUrl = 'http://localhost:5173';

console.log('');
console.log('Starting app and payment API...');
console.log(`Payment API: ${apiUrl}`);
console.log(`App: ${appUrl}`);
console.log('');
console.log('Keep this terminal open while testing payments.');
console.log('');

const processes = [
  spawn(npmCommand, ['run', 'api'], {
    stdio: 'inherit',
    shell: isWindows,
  }),
  spawn(npmCommand, ['run', 'dev'], {
    stdio: 'inherit',
    shell: isWindows,
  }),
];

function stopAll() {
  for (const child of processes) {
    if (!child.killed) {
      child.kill();
    }
  }
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stopAll();
      process.exit(code);
    }
  });
}

process.on('SIGINT', () => {
  stopAll();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopAll();
  process.exit(0);
});
