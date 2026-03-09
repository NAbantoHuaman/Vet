const fs = require('fs');
const path = require('path');

const envDirectory = path.join(__dirname, '../src/environments');

if (!fs.existsSync(envDirectory)) {
  fs.mkdirSync(envDirectory, { recursive: true });
}

const targetPath = path.join(envDirectory, 'environment.ts');

const envConfigFile = `export const environment = {
  production: true,
  geminiApiKey: '${process.env.GEMINI_API_KEY || ''}'
};
`;

console.log('Generating environment.ts with API Key...');

fs.writeFileSync(targetPath, envConfigFile);

console.log(`Output generated at ${targetPath}`);
