const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require('fs');
const apiRoutes = express.Router();
const exec = require('child_process').exec;

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());


const PORT = 5000;
const HOST = '0.0.0.0';


app.post("/compile", (req,res) => {
    
    let code = req.body.code;

    if(code === undefined || code === null) return res.status(400).json({error:"fakk off"});

    createFile(code, () => {
        execFile((status, output) => {
            return res.status(status).json({output : output});
        })
    })

});

function createFile(code, callback){
    fs.unlink('./main', (e) => {
        fs.writeFile('main.rs', code, () => {callback()});
    })
}

function execFile(callback){

    let d = "";

    const compShell = exec('rustc ./main.rs', (err, out ,err2) => {
        console.log(err2);

        if(err2){
            fs.exists('./main', r => {
                if(r){
                    const shell = exec('./main');
                    shell.stdout.on('data', (data) => d+=data);
                    shell.stderr.on('data', (data) => d+=data);        
                    shell.on('exit', () => {callback(200, d)});
                } else {
                    return callback(200, err2);
                }
            });
        } else {
            const shell = exec('./main');
            shell.stdout.on('data', (data) => d+=data);
            shell.stderr.on('data', (data) => callback(501, data));
            shell.on('exit', () => {callback(200, d)});
        }
    });
    
}

app.listen(PORT,HOST);

console.log(`Running Joe's server on ${HOST}:${PORT}`);
