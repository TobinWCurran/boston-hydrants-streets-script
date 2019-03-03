import fs from 'fs';

const root = __dirname.replace(/\/src/, '');
const rawdata = fs.readFileSync(root + '/results/synth-data 3-2-2019 9:58:58 PM.json');
const data = JSON.parse(rawdata);

console.log('data: ', data.length);