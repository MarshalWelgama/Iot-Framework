const { builtinModules } = require('module')
const ObjectsToCsv = require('objects-to-csv')
var dockerstats = require('dockerstats');
var shell = require('./shellHelp.js')
var moment = require('moment')
//const config = require('./config.json')
var mqtt = require('mqtt')
var client
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
    path: 'out.csv',
    header: [
        { id: 'time', title: 'Time' },
        { id: 'percent', title: 'Percent' },
        { id: 'point', title: 'Point' },
    ]
});

const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

function AddImage(iL, rL, iN) {
    var commands = [
        `docker load -i ${iL}`, //load image to our docker images
        `docker tag ${iN} ${rL}/${iN}`, //prepare to be pushed to registry
        `docker push ${rL}/${iN}`, //push to registry
        'echo done'
    ]
    console.log('Adding image to registry please wait..')
    shell.exec_commands(commands)

}

function RunImage(iN) {
    var commands = [
        `docker run --name ${iN} ${iN}`,
        'echo done'
    ]
    console.log('Running docker image please wait..')
    shell.exec_commands(commands, () => { updateNode(iN) })
    //run docker image on the node
    //if we want this globally accessed we need to make an optional param which will add that infront of the image name if it is running the image form the registry 
    return null
}

function StopImage(iN) {
    var commands = [
        `docker stop ${iN}`,
        `docker container rm ${iN}`,
        'echo done'
    ]
    console.log('Stoping docker iamge please wait..')
    shell.exec_commands(commands)
    return null
}

function AddRun(iL, iN, rL) {
    var imageName = iN
    var commands = [
        `docker run --name ${iN} -e PYTHONUNBUFFERED=1 -d ${iN}`,
        'echo done'
    ]
    console.log('Running image and adding to registry, please wait.')
    shell.exec_commands(commands)
    updateNode(imageName, rL)

}

function updateNode(iN, rL) {
    var percentages = {}
    percentages.iN = []
    percentages.results = {}
    percentages.results.iN = []
    const checker = setInterval(() => {
        dockerstats.dockerContainerStats(`${iN}`, function (data) {
            //min threshold
            // console.log(data[0].cpuPercent);
            percentages.iN.push(data[0].cpuPercent)


            percentages.results.iN.push({
                time: `${moment().format()}`,
                percent: `${data[0].cpuPercent}`,
                point: `${percentages.iN.length}`
            })
            console.log(percentages.results.iN)
        })

        if (percentages.iN.length > 29) { //gets average every two minutes roughly
            if (arrAvg(percentages.iN) > 155) {
                const csv = new ObjectsToCsv(percentages.results.iN)
                csv.toDisk(`./${iN}.csv`)
                console.log(arrAvg(percentages.iN)) //here we can send mqtt message if > our max threshold.
                client.publish('Resource-Pool', `${iN}`) //put this if it is above max threshold
                StopImage(iN)
                clearInterval(checker)
            }
            else {
                if (percentages.results.iN.length > 89) {
                    const csv = new ObjectsToCsv(percentages.results.iN)
                    csv.toDisk(`./${iN}.csv`)
                    console.log(arrAvg(percentages.iN))
                    StopImage(iN)
                    clearInterval(checker)
                }
                percentages.iN = []
            }
        }
    }, 2000); //gets recording every two seconds
    return null
}



function run(config) {
    console.log(config)
    if (config.registrySetup == false) {
        console.log('Incorrect setup, please setup registery on edge server first')
        process.exit()
    }
    client = mqtt.connect(`mqtt://${config.mqttLocation}`) //connect to mqtt broker
    try {
        client.on('connect', function () {
            console.log('Mqtt broker connected')
            AddRun(config.imageLocation, config.imageName, config.registryLocation)
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    run
};


