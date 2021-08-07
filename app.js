var RegisteryLocation;
var Name;
var NodeType;
/**
 * Input prompt example
 */

'use strict';
const inquirer = require('inquirer');
const initialize = [
    {
        type: 'input',
        name: 'registeryLocation',
        message: "Docker Registery Location? (192.168.x.x:xxxx)",
        default() {
            return null;
        },

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
]

const IotQuestions = [
    {
        type: 'confirm',
        name: 'registryImage',
        message: "Docker image hosted in registery?",
        default() {
            return true;
        },

    },
    {
        type: 'input',
        name: 'imageLocation',
        message: "Image location:",
        when: (answers) => answers.registryImage === false,
    }
]


inquirer.prompt(initialize).then((answers) => {
    RegisteryLocation = answers.registeryLocation
    Name = answers.name
    NodeType = answers.nodeType
    console.log(JSON.stringify(answers, null, '  '));
}).then(() => {
    inquirer.prompt(IotQuestions).then((answers) => {
        console.log(JSON.stringify(answers, null, '  '));
    })
});

