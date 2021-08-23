const { builtinModules } = require('module')
var dockerstats = require('dockerstats');
var shell = require('./shellHelp.js')
//const config = require('./config.json')
var mqtt = require('mqtt')


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

function updateNode() {
    setInterval(() => {
        dockerstats.dockerContainerStats('registry', function (data) {
            console.log(data[0].cpuStats);
        })
    }, 1000);

    // this is where we can assess how much the docker image is using, set certain threshold and send mqtt message
    // send mqtt message to higher up
    // include stop image function here
    return null
}

function RunImage(iN) {
    var commands = [
        `docker run --name ${iN} ${iN}`,
        'echo done'
    ]
    console.log('Running docker image please wait..')
    shell.exec_commands(commands, () => { updateNode() })
    //run docker image on the node
    //if we want this globally accessed we need to make an optional param which will add that infront of the image name if it is running the image form the registry 
    return null
}

function StopImage(iN) {
    var commands = [
        `docker stop ${iN}`,
        'echo done'
    ]
    console.log('Stoping docker iamge please wait..')
    shell.exec_commands(commands)
    //stop image from running 
    return null
}


function run(config) {
    console.log(config)
    if (config.registrySetup == false) {
        console.log('Incorrect setup, please setup registery on edge server first')
        process.exit()
    }
    var client = mqtt.connect(`mqtt://${config.mqttLocation}`) //connect to mqtt broker
    try {
        client.on('connect', function () {
            console.log('Mqtt broker connected')
        })
    } catch (error) {
        console.log(error)
    }
    AddImage(config.imageLocation, config.registryLocation, config.imageName)
    RunImage(config.imageName)
    //client.subscribe(`${config.name}`)

    //client.publish('Resource-Pool', 'Hello mqtt') //publish messages, topic/message

    // client.on('message', function (topic, message) {
    //     // prints out message when received from subscribe
    //     console.log(message.toString())
    //     console.log(topic.toString())
    // })
    // start doing shit
}

module.exports = {
    run
};


