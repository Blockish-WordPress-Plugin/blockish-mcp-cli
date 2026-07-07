import os from 'node:os';
import path from 'node:path';

export function getVSCodeConfigDir() {
  const platform = os.platform();
  const homedir = os.homedir();
  
  if (platform === 'darwin') {
    return path.join(homedir, 'Library', 'Application Support', 'Code', 'User');
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(homedir, 'AppData', 'Roaming');
    return path.join(appData, 'Code', 'User');
  } else {
    return path.join(homedir, '.config', 'Code', 'User');
  }
}
