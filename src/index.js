import fs from 'fs';
import 'dotenv/config';
import findAddress from './findAddress';
import formattedDate from './formattedDate'


const batchJob = {
    start: process.argv[2],
    end: process.argv[3],
    timeout: 2013
}

const endNumber = batchJob.end - 1;

const outPutFolderName = 'results';
const outputFolder = `./${outPutFolderName}`;

if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

const thisFormattedDate = formattedDate();

// This design assumes you have downloaded the the geojson file found here:
// http://bostonopendata-boston.opendata.arcgis.com/datasets/1b0717d5b4654882ae36adc4a20fd64b_0.geojson

// This script could start with a Node HTTP.get() call to the address above

//13879 records in the file

const rawdata = fs.readFileSync(__dirname + '/Fire_Hydrants.geojson');
const bostonHydrantData = JSON.parse(rawdata);

console.log('Number of Hydrants: ', bostonHydrantData.features.length);

let slowLoopCounter = batchJob.start;

let arrayOfAddresses = [];

const slowLoop = function slowLoopBySetTimeout() {
    setTimeout(() => {

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
            .then((theAddressObject) => {
                slowLoopCounter++;
                arrayOfAddresses.push(theAddressObject);
                if (slowLoopCounter < batchJob.end) {
                    slowLoop();
                } else {
                    let arrayOfAddressesAsJSON = JSON.stringify(arrayOfAddresses);
                    fs.writeFile(`${outPutFolderName}/address-batch-${batchJob.start}-${endNumber} ${thisFormattedDate}.json`, arrayOfAddressesAsJSON, 'utf8', () => {
                        console.log(`Success! Your file "address-batch-${batchJob.start}-${endNumber} ${thisFormattedDate}.json" is available in the "${outPutFolderName}" folder.`);
                        console.log(`You have just batched ${batchJob.start}-${batchJob.end}.`)
                    });
                }
            })
            .catch((error) => {
                if (arrayOfAddresses.length > 0) {
                    let arrayOfAddressesAsJSON = JSON.stringify(arrayOfAddresses);
                    fs.writeFile(`${outPutFolderName}/address-batch-with-error${batchJob.start}-${endNumber} ${thisFormattedDate}.json`, arrayOfAddressesAsJSON, 'utf8', () => {
                        console.log(`Success, ish? Your file "address-batch-with-error${batchJob.start}-${endNumber} ${thisFormattedDate}.json" is available in the "${outPutFolderName}" folder.`);
                        console.log(`You have just batched ${batchJob.start}-${batchJob.end}, but it didn't finish.`)
                    });
                }

                fs.writeFile(`${outPutFolderName}/address-batch-error-${batchJob.start}-${endNumber} ${thisFormattedDate}.txt`, error, 'utf8', () => {
                    console.log(`Looks bad. Your error file is address-batch-error-${batchJob.start}-${endNumber} ${thisFormattedDate}.txt available in the "${outPutFolderName}" folder.`);
                });
            });
    }, batchJob.timeout)
}

const checkArguments = function checkCommandLineArgumentsForStartAndStop() {
    if (!process.argv[2]) {
        return console.log("Please provide a start and stop argument.");
    } else if (!process.argv[3]) {
        return console.log("Please prvide a stop argument.");
    } else {
        slowLoop();
    }
}

checkArguments();