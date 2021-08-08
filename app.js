var RegisteryLocation;
var Name;
var NodeType;
/**
 * Input prompt example
 */

'use strict';
const fs = require('fs');
const inquirer = require('inquirer');
const cp = require('child_process')
const initialize = [
    {
        type: 'confirm',
        name: 'registerySetup',
        message: "Has docker registery been setup?",
        default() {
            return false;
        },

    },
    {
        type: 'input',
        name: 'registeryLocation',
        message: "Docker registery location? (192.168.x.x:xxxx)",
        when: (answers) => answers.registerySetup === true,

    },
    {
        type: 'list',
        name: 'nodeType',
        message: "Which node is this? (Edge, Cloud, IoT)",
        choices: ['IoT', 'Edge', 'Cloud'],
        filter(val) {
            return val.toLowerCase();
        },
    },
    {
        type: 'input',
        name: 'name',
        message: "Name: ",
        default() {
            return 'My Device';
        },
        filter(val) {
            return val.toLowerCase();
        }
    },
    {
        type: 'confirm',
        name: 'registryImage',
        message: "Docker image hosted in registery?",
        when: (answers) => answers.registerySetup === true,
        default() {
            return true;
        },

    },
    {
        type: 'input',
        name: 'imageLocation',
        message: "Image location:",
        when: (answers) => answers.registryImage === false || (answers.nodeType === 'iot' && answers.registerySetup === false),
    },
    {
        type: 'confirm',
        name: 'mqttSetup',
        message: "Do you want to setup MQTT Broker?",
        when: (answers) => answers.nodeType === 'edge' || answers.nodeType === 'cloud',
        default() {
            return true
        }
    },
    {
        type: 'input',
        name: 'mqttLocation',
        message: "Mqtt broker address:",
        when: (answers) => answers.mqttSetup === false || answers.nodeType === 'iot',
    },

]

inquirer.prompt(initialize).then((answers) => {
    RegisteryLocation = answers.registeryLocation
    Name = answers.name
    NodeType = answers.nodeType
    console.log(JSON.stringify(answers));
    fs.writeFile("config.json", JSON.stringify(answers), function (err) {
        if (err) {
            console.log(err);
        }
    });
}).then(() => {
    switch (NodeType) {
        case 'iot':
            cp.fork('iot.js')
            break;
        case 'edge':
            cp.fork('edge.js')
            break;
        case 'cloud':
            cp.fork('cloud.js')
            break;
        default:
            break;
    }
});
