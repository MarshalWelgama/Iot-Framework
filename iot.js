const config = require('./config.json')

var mqtt = require('mqtt')

if (config.registerySetup == false) {
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




client.subscribe(`${config.name}`)

client.publish(`${config.name}`, 'Hello mqtt') //publish messages, topic/message

client.on('message', function (topic, message) {
    // prints out message when received from subscribe
    console.log(message.toString())
    console.log(topic.toString())
})

function AddImage(imageLoc) {
    //add image to the registery
    return null
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
    // include stop image function here
    return null
}
