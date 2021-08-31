var mqtt = require('mqtt')
var shell = require('./shellHelp.js')
var dockerstats = require('dockerstats');
var client;
var configuration;
const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

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

function runRegistryImage(iN, rL) {
    var commands = [
        `docker pull ${rL}/${iN}`,
        `docker run --name ${iN} -e PYTHONUNBUFFERED=1 -d ${rL}/${iN}`,
        'echo done'
    ]
    console.log('Running task from registry, please wait...')
    shell.exec_commands(commands)
}

function GetTask(rL) {
    client.on('message', function (topic, message) {
        runRegistryImage(message.toString(), rL) //might need to add into a json that we are running this image.
        client.unsubscribe('Resource-Pool-Cloud')
        run(configuration)
    })
}


function SetupRegistry() {
    var commands = [
        "docker run -d -p 5000:5000 --restart=always --name registry registry:2",
        // "docker pull ubuntu:16.04",
        // "docker tag ubuntu:16.04 localhost:5000/my-ubuntu",
        // "docker push localhost:5000/my-ubuntu",
        // "docker image remove ubuntu:16.04",
        // "docker image remove localhost:5000/my-ubuntu",
        // "docker pull localhost:5000/my-ubuntu",
        "echo done"
    ]
    shell.exec_commands(commands)
    console.log('Your registry is being created in the background on port 5000, please give a few minutes...')
}

function run(config) {
    configuration = config;
    var registryLocation;

    if (!config.registrySetup) {
        SetupRegistry()
        registryLocation = 'localhost:5000'
        //check if they want us to setup the registry on this server.   
    }
    else {
        registryLocation = config.registryLocation
    }
    client = mqtt.connect(`mqtt://${config.mqttLocation}`)
    try {
        client.on('connect', function () {
            console.log('Mqtt broker connected')
            client.subscribe(`Resource-Pool-Cloud`, null, function () {
                console.log('Connected to resource pool')
                GetTask(config.registryLocation)
            })
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    run
};