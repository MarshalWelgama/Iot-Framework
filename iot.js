const { builtinModules } = require('module')
var dockerstats = require('dockerstats');
var shell = require('./shellHelp.js')
//const config = require('./config.json')
var mqtt = require('mqtt')
var client


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
        `docker load -i ${iL}`, //load image to our docker images
        `docker tag ${iN} ${rL}/${iN}`, //prepare to be pushed to registry
        `docker push ${rL}/${iN}`, //push to registry
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
    const checker = setInterval(() => {
        dockerstats.dockerContainerStats(`${iN}`, function (data) {
            if (data[0].cpuPercent) { //min threshold
                // console.log(data[0].cpuPercent);
                percentages.iN.push(data[0].cpuPercent)
            }
        })
        console.log(percentages.iN.length)
        if ((percentages.iN.length > 5 && arrAvg(percentages.iN) > 100)) {
            // console.log(arrAvg(percentages.iN)) 
            client.publish('Resource-Pool', `${iN}`)
            StopImage(iN)
            percentages.iN = []
            clearInterval(checker)
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


