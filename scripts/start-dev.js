import { spawn } from 'node:child_process';

console.log('\n🚀 Starting Campus Connect AI (Backend on port 3001 + Frontend on port 3000)...\n');

const isWin = process.platform === 'win32';
const api = spawn(process.execPath, ['--watch', '--import', 'tsx', 'server/index.ts'], { stdio: 'inherit', shell: isWin });
const web = spawn(isWin ? 'npx.cmd' : 'npx', ['vite', '--port=3000', '--host=0.0.0.0'], { stdio: 'inherit', shell: isWin });

const cleanup = () => {
  try { api.kill(); } catch {}
  try { web.kill(); } catch {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
api.on('exit', code => { if (code && code !== 0) console.error(`Backend process exited with code ${code}`); });
web.on('exit', code => { if (code && code !== 0) console.error(`Frontend process exited with code ${code}`); });
