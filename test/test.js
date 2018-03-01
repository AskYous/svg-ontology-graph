const express = require('express');
const app = express();
const {
    promisify
} = require("util");


app.get('/', function (req, res) {
    res.sendFile(`${__dirname}/index.html`);
});

const temp = await promisify(app.listen)(3000);
console.log(temp);
debugger;