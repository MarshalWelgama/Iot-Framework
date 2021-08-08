const config = require('./config.json')
var mqtt = require('mqtt')
if (config.mqttLocation) { //connect to mqqt broker if already setup
    var client = mqtt.connect(`mqtt://${config.mqttLocation}`)
    try {
        client.on('connect', function () {
            console.log('Mqtt broker connected')
        })
    } catch (error) {
        console.log(error)
    }
}

// client.on('message', function (topic, message) {
//     // prints out message when received from subscribe
//     console.log(message.toString())

// })

// client.subscribe('presence')

// client.publish('presence', 'Hello mqtt') //publish messages, topic/message

//edge server will always be on standby, make a way for it to identify which image it is going to be looking out for. 
//therefore we will need to alter some of the questions that we are asking for edge server
//maybe do the topic as name+imagename so we know its specific