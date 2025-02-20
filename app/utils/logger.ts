import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, `api-${new Date().toISOString().split('T')[0]}.log`);

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

export const logger = {
  log: (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    
    // Log to console
    console.log(message);
    
    // Log to file
    fs.appendFileSync(LOG_FILE, logMessage);
  },

  logObject: (label: string, obj: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${label}:\n${JSON.stringify(obj, null, 2)}\n`;
    
    // Log truncated to console
    console.log(`${label}:`, obj);
    
    // Log full object to file
    fs.appendFileSync(LOG_FILE, logMessage);
  }
}; 