var RegistryLocation;
var Name;
var NodeType;
/**
 * Input prompt example
 */

'use strict';
// const fs = require('fs');
const inquirer = require('inquirer');
const iot = require('./iot.js');
const edge = require('./edge.js');
const cloud = require('./cloud.js');
var configuration;

const initialize = [
    {
        type: 'confirm',
        name: 'registrySetup',
        message: "Has docker registery been setup?",
        default() {
            return true;
        },

    },
    {
        type: 'input',
        name: 'registryLocation',
        message: "Docker registery location? (192.168.x.x:xxxx)",
        when: (answers) => answers.registrySetup === true,

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
    // {
    //     type: 'confirm',
    //     name: 'registryImage',
    //     message: "Docker image hosted in registery?",
    //     when: (answers) => answers.registrySetup === true && answers.nodeType != 'iot',
    //     default() {
    //         return true;
    //     },

    // },
    {
        type: 'input',
        name: 'imageLocation',
        message: "Image location:",
        when: (answers) => answers.nodeType == 'iot',
    },
    {
        type: 'input',
        name: 'imageName',
        message: "Name of docker image:",
        when: (answers) => answers.nodeType == 'iot',
    },
    {
        type: 'input',
        name: 'mqttLocation',
        message: "Mqtt broker address:"
    },

]

inquirer.prompt(initialize).then((answers) => {
    RegistryLocation = answers.registryLocation
    Name = answers.name
    NodeType = answers.nodeType
    console.log(JSON.stringify(answers));
    // fs.writeFile("config.json", JSON.stringify(answers), function (err) {
    //     if (err) {
    //         console.log(err);
    //     }
    // });
    configuration = answers
}).then(() => {
    switch (NodeType) {
        case 'iot':
            iot.run(configuration)
            break;
        case 'edge':
            edge.run(configuration)
            break;
        case 'cloud':
            cloud.run(configuration)
            break;
        default:
            break;
    }
});
