import fs from 'fs';

const root = __dirname.replace(/\/src/, '');
const rawdata = fs.readFileSync(root + '/results/address-batch-2100-2199 2-28-2019 11:18:27 PM.json');
const data = JSON.parse(rawdata);

console.log('data: ', data.length);