
import * as SVGGraph from "../dist/svg-graph.mjs";
import * as SampleData from "./sample-data";

// tools
import express from 'express';
import path from 'path';
import puppeteer from 'puppeteer';

// setup
const app = express();

// data
const __dirname = path.resolve(path.dirname(''));
const vertices = SampleData.vertices.map(v => new SVGGraph.Vertex(v.id, v.data));
const edges = SampleData.edges
    .map(e => new SVGGraph.Edge(
        vertices.find(v => v.id == e[0]),
        vertices.find(v => v.id == e[1])
    ));

// serve index.html in a web server
app.get('/', (req, res) => res.sendFile(`${__dirname}/test/index.html`));

// serve sample-data.js
app.get('/sample-data.mjs', (req, res) => res.sendFile(`${__dirname}/test/sample-data.mjs`));

// serve graph.js too
app.use(express.static('./'));

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
    let edgeElements;

    // log the browser's console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // throw errors on if the browser throws an error
    page.on('pageerror', msg => { throw new Error(msg); });
    // go go localhost:3000
    await page.goto("http://localhost:3000/", { "waitUntil": "networkidle2" });

    // might as well have a screenshot
    await page.screenshot({ path: "screenshot.png" });

    // assert there's an avg graph in the page.
    svgGraphElement = await page.evaluate(() => document.querySelector(".svg-graph"));
    console.assert(svgGraphElement != null, "No graph element found in page!");

    // assert there are vertices elements on the page
    vertexElements = await page.evaluate(() => document.querySelectorAll(".vertex"));
    console.assert(Object.keys(vertexElements).length == vertices.length, "Vertices are missing on the page!");

    // assert there are edges elements on the page
    edgeElements = await page.evaluate(() => document.querySelectorAll(".edge"));
    console.assert(Object.keys(edgeElements).length == edges.length, "Edges are missing on the page!");

    // done.
    await browser.close();
});