const express = require('express');
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');

app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));
app.get('/graph.js', (req, res) => res.sendFile(path.resolve("./dist/script.js")));

app.listen(3000, async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('pageerror', msg => {
        throw new Error(msg);
    });
    await page.goto('http://localhost:3000/');
    await page.screenshot({
        path: 'test.png'
    });

    await browser.close();
})