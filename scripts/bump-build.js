import { readFileSync, writeFileSync } from 'fs';

const path = './buildnumber.json';
const data = JSON.parse(readFileSync(path, 'utf-8'));
data.build += 1;
writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log(`Build number: ${data.build}`);