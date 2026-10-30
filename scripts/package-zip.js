import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = path.resolve('C:/Users/mulag/OneDrive/Documents/4-1/AD/campus-connect-ai/campus-connect-ai-updated');
const outputZip = path.resolve('C:/Users/mulag/OneDrive/Documents/4-1/AD/campus-connect-ai-updated.zip');
const tempDir = path.join(process.env.TEMP || 'C:/Temp', 'campus-pack-' + Date.now());

fs.mkdirSync(tempDir, { recursive: true });
const targetDir = path.join(tempDir, 'campus-connect-ai-updated');

// Copy all files except node_modules, dist, and .git
fs.cpSync(rootDir, targetDir, {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(rootDir, src);
    if (!rel) return true;
    const parts = rel.split(path.sep);
    return !['node_modules', '.git'].includes(parts[0]);
  }
});

if (fs.existsSync(outputZip)) {
  fs.unlinkSync(outputZip);
}

execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${targetDir}' -DestinationPath '${outputZip}' -Force"`);

fs.rmSync(tempDir, { recursive: true, force: true });
const stat = fs.statSync(outputZip);
console.log(`Successfully packaged ${outputZip} (${stat.size} bytes)`);
