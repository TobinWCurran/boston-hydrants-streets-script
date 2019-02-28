import fs from 'fs';

const root = __dirname.replace(/\/src/, '');
const rawdata = fs.readFileSync(root + '/results/address-batch-0-100 2-26-2019 11:30:08 PM.json');
const data = JSON.parse(rawdata);

console.log('data: ', data.length);