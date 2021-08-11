const { builtinModules } = require('module')
var shell = require('./shellHelp.js')
//const config = require('./config.json')
var mqtt = require('mqtt')




function AddImage(iL, rL, iN) {
    var commands = [
        `docker load -i ${iL}`, //load image to our docker images
        `docker tag ${iN} ${rL}/${iN}`, //prepare to be pushed to registry
        `docker push ${rL}/${iN}`, //push to registry
    ]
    console.log('Adding image to registry please wait..')
    shell.exec_commands(commands)
}
function RunImage() {
    //run docker image on the node
    return null
}
function StopImage() {
    //stop image from running 
    return null
}
function updateNode() {
    // this is where we can assess how much the docker image is using, set certain threshold and send mqtt message
    // send mqtt message to higher up
    // include stop image function here
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
    //client.subscribe(`${config.name}`)

    //client.publish('Resource-Pool', 'Hello mqtt') //publish messages, topic/message

    // client.on('message', function (topic, message) {
    //     // prints out message when received from subscribe
    //     console.log(message.toString())
    //     console.log(topic.toString())
    // })
    console.log('wtf')
    // start doing shit
}

module.exports = {
    run
};


