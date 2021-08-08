const config = require('./config.json')
const InocrrectSetup = config.registerySetup === false
if (InocrrectSetup) {
    console.log('Incorrect setup, please setup registery on edge server first')
}
