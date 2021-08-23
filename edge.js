//const config = require('./config.json')
var Assigned = false;
var MqttConnected = false;
var mqtt = require('mqtt')
var shell = require('./shellHelp.js')
var client;
var configuration;
function AssignedStatus() {
    (Assigned) ? console.log('Working on task') : console.log('Waiting for task..')
}

function runRegistryImage(iN, rL) {
    var commands = [
        `docker pull ${rL}/${iN}`,
        `docker run ${rL}/${iN}`,
        'echo done'
    ]
    Assigned = true;
    shell.exec_commands(commands)
    console.log('Running task from registry, please wait...')

    // run the image based on the name of it in the registry.
}

function GetTask(rL) { //command to get task, we will alweays stay connected to resource pool
    client.on('message', function (topic, message) {
        if (Assigned) {
            console.log(Assigned)
            console.log('working on task, cannot pickup new task')
            console.log(message.toString())
        } else {
            console.log('Inside Gettask and assigned in false so we will run the image')
            // on message, run docker node and stop subscribing. 
            runRegistryImage(message.toString(), rL)
            console.log(Assigned)
            client.unsubscribe('Resource-Pool')
            run(configuration)
        }
        //once we identify a task, run it on this node and send a message to resource pool completed for iot node to stop
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
    // var commands = [
    //     "echo hi",
    //     "echo done"
    // ]
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

    if (!Assigned) {
        client = mqtt.connect(`mqtt://${config.mqttLocation}`)
        try {
            client.on('connect', function () {
                console.log('Mqtt broker connected')
                client.subscribe(`Resource-Pool`, null, function () {
                    console.log('Connected to resource pool')
                    console.log('now in assinged is false..')
                    AssignedStatus()
                    GetTask(config.registryLocation)
                })
            })
        } catch (error) {
            console.log(error)
        }
    } else {
        //Here we can place the update node function once that is done we can subscribe again with below function and set assgined to false. 

        // client.subscribe(`Resource-Pool`, null, function () {
        //     console.log('just before the client on message function')
        // })
    }



    // all this code will need to be chagned, the questions have been altered to suit already.

}
// client.publish('presence', 'Hello mqtt') //publish messages, topic/message

//edge server will always be on standby, it will subscribve to resxource pool, when there is a mesage sent with the name it will be the first one to then access that file and grab it, maybe send another message to the pool saying done
//after that its assigned status will be true and it will stop subscribing to the pool until after it has completed its tasks or moved it to the cloud.

module.exports = {
    run
};