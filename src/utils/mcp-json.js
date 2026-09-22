import fs from 'node:fs/promises';
import path from 'node:path';

export async function hasBlockishMcp(configPath, serversKey = 'mcpServers') {
  try {
    const fileContent = await fs.readFile(configPath, 'utf8');
    if (fileContent.trim() === '') {
      return false;
    }
    const existingConfig = JSON.parse(fileContent);
    return Boolean(existingConfig[serversKey]?.blockish);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

export async function mergeBlockishMcpJson(configPath, mcpConfig, serversKey = 'mcpServers') {
  await fs.mkdir(path.dirname(configPath), { recursive: true });

  let existingConfig = {};
  try {
    const fileContent = await fs.readFile(configPath, 'utf8');
    if (fileContent.trim() !== '') {
      existingConfig = JSON.parse(fileContent);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  if (!existingConfig[serversKey]) {
    existingConfig[serversKey] = {};
  }

  existingConfig[serversKey].blockish = mcpConfig;
  await fs.writeFile(configPath, JSON.stringify(existingConfig, null, 2), 'utf8');
}
