
var MqttConnected = false;
var mqtt = require('mqtt')
var shell = require('./shellHelp.js')
var dockerstats = require('dockerstats');
var client;
var configuration;
const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
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
        if (percentages.iN.length > 5 && arrAvg(percentages.iN) > 100) { //gets average every two minutes roughly
            console.log(arrAvg(percentages.iN)) //here we can send mqtt message if > our max threshold.
            client.publish('Resource-Pool-Cloud', `${iN}`) //put this if it is above max threshold
            StopImage(iN)
            percentages.iN = []
            clearInterval(checker)
        }
    }, 2000); //gets recording every two seconds
}

function StopImage(iN) {
    var commands = [
        `docker stop ${iN}`,
        `docker container rm ${iN}`,
        'echo done'
    ]
    console.log('Stoping docker iamge please wait..')
    shell.exec_commands(commands)
    //stop image from running 
    return null
}

function runRegistryImage(iN, rL) {
    var commands = [
        `docker pull ${rL}/${iN}`,
        `docker run --name ${iN} -e PYTHONUNBUFFERED=1 -d ${rL}/${iN}`,
        'echo done'
    ]
    shell.exec_commands(commands)
    console.log('Running task from registry, please wait...')
    updateNode(iN, rL)
    // run the image based on the name of it in the registry.
}

function GetTask(rL) { //command to get task, we will alweays stay connected to resource pool
    client.on('message', function (topic, message) {
        runRegistryImage(message.toString(), rL) //might need to add into a json that we are running this image.
        client.unsubscribe('Resource-Pool')
        run(configuration)
    })
}
//once we identify a task, run it on this node and send a message to resource pool completed for iot node to stop

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

    client = mqtt.connect(`mqtt://${config.mqttLocation}`)
    try {
        client.on('connect', function () {
            console.log('Mqtt broker connected')
            client.subscribe(`Resource-Pool`, null, function () {
                console.log('Connected to resource pool')
                GetTask(config.registryLocation)
            })
        })
    } catch (error) {
        console.log(error)
    }
    // } else {
    //     //Here we can place the update node function once that is done we can subscribe again with below function and set assgined to false. 

    //     // client.subscribe(`Resource-Pool`, null, function () {
    //     //     console.log('just before the client on message function')
    //     // })
    // }



    // all this code will need to be chagned, the questions have been altered to suit already.

}
// client.publish('presence', 'Hello mqtt') //publish messages, topic/message

//edge server will always be on standby, it will subscribve to resxource pool, when there is a mesage sent with the name it will be the first one to then access that file and grab it, maybe send another message to the pool saying done
//after that its assigned status will be true and it will stop subscribing to the pool until after it has completed its tasks or moved it to the cloud.

module.exports = {
    run
};