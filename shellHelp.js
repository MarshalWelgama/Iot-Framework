const { exec } = require('child_process');
var finished = false
var exec_commands = (commands) => {
  var command = commands.shift()
  exec(command, (error, stdout, stderr) => {
    
    if (error) {
        console.log(`error: ${error.message}`);
       // process.exit(1)
       return;
    }
    // if (stderr) {
    //     console.log(`stderr: ${stderr}`);
 
    // }
    // if (stdout) {
    //     console.log(`stdout: ${stdout}`); 
    
    // }
    if(commands.length) exec_commands(commands)
    if(!commands.length){
        finished = !finished
    } 
    if(finished) console.log("Completed!")
    
  })

}
module.exports = {
    exec_commands,
};