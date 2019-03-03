import fs from 'fs';
import formattedDate from './formattedDate'

const root = __dirname.replace(/\/src/, '');

const outputFolderName = 'results-combined';
const outputFolder = `./${outputFolderName}`;

if (!fs.existsSync(outputFolder)){
    fs.mkdirSync(outputFolder);
}

const thisFormattedDate = formattedDate();

const readDir = function readDirectoryOfJSONFiles() {
    return new Promise((resolve, reject) => {
        fs.readdir(`${root}/results`, (err, files) => {
            if (err) {
                reject(new Error(error));
            } else {
                resolve(files);
            }
        });
    });
}

const readFile = function readBatchFileReturnObjects(inputFile) {
    return new Promise((resolve, reject) => {
        fs.readFile(inputFile, 'utf8', (err, data) => {
            if (err) {
                return reject(new Error(error));
            } else {
                resolve(data)
            }
        });
    });
}

readDir()
    .then((files) => {
        let readFilePromiseArray = [];

        for (let i = 0; i < files.length; i++) {
            if (files[i].includes('.json')) {
                readFilePromiseArray.push(readFile(`${root}/results/${files[i]}`));
            }
        }

        Promise.all(readFilePromiseArray)
            .then((values) => {

                let arrayToWrite = []

                for (let i = 0; i < values.length; i++) {
                    let theseValue = JSON.parse(values[i]);
                    for (let j = 0; j < theseValue.length; j++) {
                        arrayToWrite.push(theseValue[j]);
                    }
                }
                
                fs.writeFile(`${outputFolderName}/combined-data ${thisFormattedDate}.json`, JSON.stringify(arrayToWrite), 'utf8', () => {
                    console.log(`Success! Your file "combined-data ${thisFormattedDate}.json" is available in the "${outputFolderName}" folder.`);
                });
            }).catch((error) => {
                console.log(error);
            });
    })
    .catch((error) => {
        console.log(error);
    });

