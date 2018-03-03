const Vertex = require("../dist/Vertex");
const Edge = require("../dist/Edge");
const Graph = require("../dist/Graph");

const express = require('express');
const app = express();
const path = require('path');
const puppeteer = require('puppeteer');
const sampleData = require("./sample-data");
const vertices = sampleData.vertices.map(v => new Vertex(v.id, v.data));
const edges = sampleData.edges
    .map(e => new Edge(
        vertices.find(v => v.id == e[0]),
        vertices.find(v => v.id == e[1])
    ));


// serve index.html in a web server
app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));

// serve sample-data.js
app.get('/sample-data.js', (req, res) => res.sendFile(`${__dirname}/sample-data.js`));

// serve graph.js too
app.use(express.static('../dist'));

// start the web server on port 3000
app.listen(3000, async () => {
    // launch a web browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    /** @type{HTMLElement} */
    let svgGraphElement;
    /** @type{HTMLElement[]} */
    let vertexElements;
    /** @type{HTMLElement[]} */
    let EdgeElements;

    // throw errors on if the browser throws an error
    page.on('pageerror', msg => { throw new Error(msg); });

    // go go localhost:3000
    await page.goto("http://localhost:3000/", { "waitUntil": "networkidle2" });

    // might as well have a screenshot
    await page.screenshot({ path: "screenshot.png" });

    // assert there's an avg graph in the page.
    svgGraphElement = await page.evaluate(() => document.querySelector(".svg-graph"));
    console.assert(svgGraphElement != null, "No graph element found in page!");

    // assert there are verticex elements on the page
    vertexElements = await page.evaluate(() => document.querySelectorAll(".vertex"));
    console.assert(vertexElements.length == vertices.length, "Vertices are missing on the page!");

    // assert there are verticex elements on the page
    edgeElements = await page.evaluate(() => document.querySelectorAll(".edge"));
    console.assert(edgeElements.length == edges.length, "Edges are missing on the page!");

    // done.
    await browser.close();
})