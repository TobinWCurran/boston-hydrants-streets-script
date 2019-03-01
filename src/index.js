import fs from 'fs';
import findAddress from './findAddress';
import 'dotenv/config';

const batchJob = {
    start: process.argv[2], //3500
    end: process.argv[3], //4000
    timeout: 3013
}

const endNumber = batchJob.end - 1;

const rightNow = new Date(Date.now());
const dateFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
};

let rightNowFormatted = rightNow.toLocaleDateString('en-US', dateFormatOptions);

rightNowFormatted = rightNowFormatted.replace(/\//g, '-');
rightNowFormatted = rightNowFormatted.replace(/,/g, '');


// This design assumes you have downloaded the the geojson file found here:
// http://bostonopendata-boston.opendata.arcgis.com/datasets/1b0717d5b4654882ae36adc4a20fd64b_0.geojson

// This script could start with a Node HTTP.get() call to the address above

const rawdata = fs.readFileSync(__dirname + '/Fire_Hydrants.geojson');
const bostonHydrantData = JSON.parse(rawdata);

console.log('Number of Hydrants: ', bostonHydrantData.features.length);

let slowLoopCounter = batchJob.start;

let arrayOfAddresses = [];

const slowLoop = function slowLoopBySetTimeout() {
    setTimeout( () => {

        console.log("Working on number ", slowLoopCounter);
        let coords = bostonHydrantData.features[slowLoopCounter].geometry.coordinates;

        let osmQuery = {
            format: 'jsonv2',
            lat: coords[1],
            lon: coords[0]
        }
        osmQuery = Object.keys(osmQuery).map(function (k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(osmQuery[k]);
        }).join('&');

        findAddress(osmQuery, bostonHydrantData, slowLoopCounter)
            .then( (theAddressObject) => {
                slowLoopCounter++;
                arrayOfAddresses.push(theAddressObject);
                if (slowLoopCounter < batchJob.end) {
                    slowLoop();
                } else {
                    let returnedValsAsJson = JSON.stringify(arrayOfAddresses);
                    fs.writeFile(`results/address-batch-${batchJob.start}-${endNumber} ${rightNowFormatted}.json`, returnedValsAsJson, 'utf8', () => {
                        console.log(`Success! Your file "address-batch-${batchJob.start}-${endNumber} ${rightNowFormatted}.json" is available in the "results" folder.`);
                        console.log(`You have just batched ${batchJob.start}-${batchJob.end}.`)
                    });
                }
            })
            .catch( (error) => {
                fs.writeFile(`results/address-batch-error-${batchJob.start}-${endNumber} ${rightNowFormatted}.txt`, error, 'utf8', () => {
                    console.log('Looks bad. Your error file is available in the "results" folder.');
                });
            });
    }, batchJob.timeout)
}

const checkArguments = function checkCommandLineArgumentsForStartAndStop(){
    if(!process.argv[2]){
        return console.log("Please provide a start and stop argument.");
    }else if(!process.argv[3]){
        return console.log("Please prvide a stop argument.");
    }else{
        slowLoop();
    }
}

checkArguments();