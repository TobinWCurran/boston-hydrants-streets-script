import fs from 'fs';
//import util from 'util';
import 'dotenv/config';
//import '@google/maps';
import * as https from 'https'

//import './Fire_Hydrants.geojson';

// fs.readFile( __dirname + '/Fire_Hydrants.geojson', 'utf8', (error, data) => {
//     if (error) throw error;
//     //console.log(JSON.stringify(data, null, 4));
//     InitCleanse(data);
// } );

// const InitCleanse = function InitCleanseOfOriginalGEOJSON(data){
//     console.log(data.features[0]);
// }

const APIKey = process.env.GOOGLE_API_KEY;
const googleMapsClient = require('@google/maps').createClient({
    key: APIKey
});

const batchJob = {
    start: 2000,
    end: 2001,
}

const rawdata = fs.readFileSync(__dirname + '/Fire_Hydrants.geojson');
const data = JSON.parse(rawdata);

console.log('data.features.length: ', data.features.length);

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

const findAddress = function findAddressFromGoogleAPI(query, i) {
    return new Promise(function (resolve, reject) {
        // googleMapsClient.reverseGeocode(query, function (error, response) {
        //     if (!error) {
        //         let objectToReturn = {
        //             OBJECTID: data.features[i].properties.OBJECTID,
        //             googleData: response.json.place_id
        //         }
        //         resolve(objectToReturn);
        //     }
        //     reject(error)
        // })

        //const nomUrl = ` https://nominatim.openstreetmap.org/reverse?${query}`;
        const httpsOptions = {
            hostname: 'nominatim.openstreetmap.org',
            path: `/reverse?${query}`,
            port: 443,
            method: 'get',
            headers: { 'User-Agent': 'hydrant.tobinwcurran.com' },
        }
        let thisObjectID = data.features[i].properties.OBJECTID;

            // https.get(httpsOptions, res => {
            //     //res.setEncoding("utf8");
            //     let body = "";
            //     res.on("data", data => {
            //         // let objectToReturn = {
            //         //     OBJECTID: thisObjectID,
            //         //     googleData: data
            //         // }
            //         body += data;
            //         //console.log('data: ', data);
            //         //resolve(objectToReturn);
            //     });
            //     res.on("end", () => {
            //         body = JSON.parse(body);
            //         //console.log('body: ', body);
            //         let objectToReturn = {
            //             OBJECTID: thisObjectID,
            //             osmData: body
            //         }
                    
            //         resolve(objectToReturn);
            //     });
            // });

        setTimeout( () => { 
            https.get(httpsOptions, res => {
                //res.setEncoding("utf8");
                let body = "";
                res.on("data", data => {
                    // let objectToReturn = {
                    //     OBJECTID: thisObjectID,
                    //     googleData: data
                    // }
                    body += data;
                    //console.log('data: ', data);
                    //resolve(objectToReturn);
                });
                res.on("end", () => {
                    body = JSON.parse(body);
                    //console.log('body: ', body);
                    let objectToReturn = {
                        OBJECTID: thisObjectID,
                        osmData: body
                    }
                    
                    resolve(objectToReturn);
                });
            });
        }, 5013);

        //setTimeout(theLoop, 10000);

    });
}

const getAddresses = function getAddressesLoop() {
    let responseArray = [];

    //for (let i = 0; i < data.features.length; i++){

    for (let i = batchJob.start; i < batchJob.end; i++) {
        //console.log('Looping number ', i);
        let coords = data.features[i].geometry.coordinates;
        // let query = {
        //     latlng: {
        //         lat: coords[1],
        //         lng: coords[0]
        //     }
        // }
        let osmQuery = {
            format: 'jsonv2',
            lat: coords[1],
            lon: coords[0]
        }
        osmQuery = Object.keys(osmQuery).map(function (k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(osmQuery[k]);
        }).join('&');
        //let thisI = i;

        responseArray.push(findAddress(osmQuery, i));
        //setDelay(responseArray, osmQuery, i);
    }
    //console.log('responseArray: ', responseArray)
    return responseArray;
}

const addresses = getAddresses();
const endNumber = batchJob.end - 1;
Promise.all(addresses)
    .then((returnedVals) => {
        //console.log('Promises Kept')
        //console.log('returnVals: ', util.inspect(returnedVals, { depth: null }));
        let returnedValsAsJson = JSON.stringify(returnedVals);
        fs.writeFile(`results/address-batch-${batchJob.start}-${endNumber} ${rightNowFormatted}.json`, returnedValsAsJson, 'utf8', () => {
            //extra
            //console.log(util.inspect(responseArray, { depth: null }))
            console.log(`Success! Your file "address-batch-${batchJob.start}-${endNumber} ${rightNowFormatted}.json" is available in the "results" folder.`);
        });

    })
    .catch((error) => {
        fs.writeFile(`results/address-batch-error-${batchJob.start}-${endNumber} ${rightNowFormatted}.txt`, error, 'utf8', () => {
            //extra
            console.log('Looks bad. Your error file is available in the "results" folder.');
        });
    });

// const loopItems = async () => {
//     let responseArray = [];

//     for (let i = 0; i < 3; i++) {
//         //console.log(data.features[i].geometry.coordinates);

//         //console.log(util.inspect(data.features[i], { depth: null }))

//         let coords = data.features[i].geometry.coordinates;
//         let query = {
//             latlng: {
//                 lat: coords[1],
//                 lng: coords[0]
//             }
//         }
//         //console.log(query);
//         //console.log(googleMapsClient);
//         // let objectToReturn = {
//         //     OBJECTID: null,
//         //     googleData: null
//         // }

//         googleMapsClient.reverseGeocode(query, function (error, response) {
//             //console.log(response);
//             //console.log(error);
//             //console.log(response.json);
//             if(!error){
//                 let objectToReturn = {
//                     OBJECTID: data.features[i].properties.OBJECTID,
//                     googleData: response.json
//                 }
//                 //console.log('objectToReturn', util.inspect(objectToReturn, { depth: null }))
//                 return objectToReturn
//             }
//         }).then(function(objectToReturn){
//             responseArray.push(objectToReturn);
//         });
//         //console.log('objectToReturn: ', util.inspect(objectToReturn, { depth: null }))
//         console.log('Working the loop, number ' + i);
//         //console.log('objectToReturn: ', objectToReturn)
//     }
//     console.log(responseArray);

//     return responseArray;

// }

// loopItems().then(function(responseArray){
//     //let parsedObject = JSON.parse(responseArray);
//     console.log('I will write the file');
//     //console.log(util.inspect(responseArray, { depth: null }))
//     let responseAsJson = JSON.stringify(responseArray);
//     //var fs = require('fs');
//     fs.writeFile(`googleResonse-${rightNow}.json`, responseAsJson, 'utf8', function () {
//         //console.log(util.inspect(responseArray, { depth: null }))
//         console.log('Success! Your file is available in the "results" folder.');
//     });
// })





// AIzaSyCl7vBxwEVxA-rf1DkfFZhJwXOSLEaK-7M

//const hydrantDataParsed = JSON.parse(hydrantDataRaw);

//console.log(JSON.stringify(hydrantDataRaw, null, 2));

//console.log(hydrantDataParsed.features[1]);

//export default hydrantDataParsed;