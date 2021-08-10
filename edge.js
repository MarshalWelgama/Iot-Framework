//const config = require('./config.json')
var Assigned = false;
var MqttConnected = false;
var mqtt = require('mqtt')
var shell = require('./shellHelp.js')
function AssignedStatus() {
    (Assigned) ? console.log('Working on task') : console.log('Waiting for task..')
}

function GetTask(imageLocation) {
    client.subscribe(`Resource-Pool`, null, function () {
        console.log('Connected to resource pool')
        AssignedStatus()
        //add logic for this edge server to be standy and wait for an application to be assigned to it
    })
    client.on('message', function (topic, message) {
        // prints out message when received from subscribe
        // on message, run docker node and stop subscribing. 
        console.log(message.toString())
        //once we identify a task, run it on this node and send a message to resource pool completed for iot node to stop
    }) 
}

function SetupRegistry() {
    var commands = [
        "docker run -d -p 5000:5000 --restart=always --name registry registry:2",
        "docker pull ubuntu:16.04",
        "docker tag ubuntu:16.04 localhost:5000/my-ubuntu",
        "docker push localhost:5000/my-ubuntu",
        "docker image remove ubuntu:16.04",
        "docker image remove localhost:5000/my-ubuntu",
        "docker pull localhost:5000/my-ubuntu",
        "echo done"
      ]
    // var commands = [
    //     "ls",
    //     "mkdir yee",
    //     "echo done"
    // ]
      shell.exec_commands(commands)
      console.log('Your registry is being created in the background on port 5000, please give a few minutes...')
}

function run(config) {

    if (!config.registrySetup) {
        SetupRegistry()
        
        //check if they want us to setup the registry on this server.   
    }
    
    //  if (config.mqttLocation) { //connect to mqqt broker if already setup
    //      var client = mqtt.connect(`mqtt://${config.mqttLocation}`)
    //      try {
    //          client.on('connect', function () {
    //              console.log('Mqtt broker connected')
    //             GetTask()
    //          })
    //      } catch (error) {
    //          console.log(error)
    //      }
    //  }

    
    
    // all this code will need to be chagned, the questions have been altered to suit already.
    
}
// client.publish('presence', 'Hello mqtt') //publish messages, topic/message

//edge server will always be on standby, it will subscribve to resxource pool, when there is a mesage sent with the name it will be the first one to then access that file and grab it, maybe send another message to the pool saying done
//after that its assigned status will be true and it will stop subscribing to the pool until after it has completed its tasks or moved it to the cloud.

module.exports = {
    run
};