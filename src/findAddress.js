import * as https from 'https';
import 'dotenv/config';

const findAddress = function findAddressFromNominatumAPI(osmQuery, bostonData, iterator) {
    return new Promise((resolve, reject) => {
        
        const httpsOptions = {
            hostname: 'nominatim.openstreetmap.org',
            path: `/reverse?${osmQuery}`,
            port: 443,
            method: 'get',
            headers: { 'User-Agent': process.env.USER_AGENT_FOR_NOMINATUM },
        }
        
        let thisObjectID = bostonData.features[iterator].properties.OBJECTID;
        https.get(httpsOptions, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected application/json but received ${contentType}`);
            }
            if (error) {
                console.error(error.message);
                reject(error);
                // consume response data to free up memory
                res.resume();
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedDataObject = {
                        OBJECTID: thisObjectID,
                        osmData: JSON.parse(rawData)
                    }
                    //console.log(parsedDataObject);
                    resolve(parsedDataObject);
                } catch (e) {
                    console.error(e.message);
                }
            });
        }).on('error', (e) => {
            console.error(`Looks bad. Error: ${e.message}`);
        });
    });
}

export default findAddress;