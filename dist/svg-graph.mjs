export class Vertex {
    /**
     * 
     * @param {number} id a unique identifier for the vertex
     * @param {string} name the name to display for the vertex
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
export class Edge {
    /**
     * 
     * @param {Vertex} vertex1 the first vertex
     * @param {Vertex} vertex2 the second vertex
     */
    constructor(vertex1, vertex2) {
        this.vertex1 = vertex1;
        this.vertex2 = vertex2;
    }
}
export class Graph {
    /**
     * 
     * @param {Vertex[]} vertices a list of vertices
     * @param {Edge[]} edges a list of edges
     */
    constructor(vertices, edges) {
        this.vertices = vertices;
        this.edges = edges;
    }
}
export class Options {
    constructor() {

    }
}
/**
 * This converts a graph (as understood in computer science) to a visible graph using SVG.
 * @param {HTMLElement} container an HTML Element to contain the graph
 * @param {Graph} graph The graph
 * @param {Options} options the options for the graph
 */
export function SVGGraph(container, graph, options) {
    const XML_NAMESPACE = "http://www.w3.org/2000/svg";
    const GRAPH_WIDTH = container.getBoundingClientRect().width;
    const GRAPH_HEIGHT = container.getBoundingClientRect().width;
    const VERTEX_PADDING = 8;
    const CHAR_WIDTH = 15;
    const VERTEX_HEIGHT = 15;

    /** The SVG Element */
    const svg = document.createElementNS(XML_NAMESPACE, "svg");
    /** The  vertex elements */
    const vertices = [];
    /** The edge elements */
    const edges = [];

    svg.classList.add("svg-graph");
    container.appendChild(svg);

    // create vertex elements
    for (let v of graph.vertices) {
        /* vertex container */
        const group = document.createElementNS(XML_NAMESPACE, "g");
        /* vertex text */
        const text = document.createElementNS(XML_NAMESPACE, "text");
        /* vertex background */
        const rect = document.createElementNS(XML_NAMESPACE, "rect");
        /* vertex width without padding */
        const width = CHAR_WIDTH * v.name.length;
        /* vertex x location (from its upper left)*/
        const x = Math.random() * GRAPH_WIDTH;
        /* vertex y location (from its upper left)*/
        const y = Math.random() * GRAPH_HEIGHT;

        // save some information
        group.classList.add("vertex");
        group.dataset.vertexId = v.id;

        // append everything to each other
        group.appendChild(rect);
        group.appendChild(text);
        svg.appendChild(group);

        // set text properties
        text.innerHTML = v.name;
        text.setAttribute("x", x + VERTEX_PADDING);
        text.setAttribute("y", y + VERTEX_PADDING);
        text.setAttribute("dy", 10);

        // set rect properties
        rect.style.width = `${text.getBoundingClientRect().width + (VERTEX_PADDING * 2)}px`;
        rect.style.x = x;
        rect.style.y = y;

        // save the vertex elements
        vertices.push(group);
    }

    // create edge elements
    for (let e of graph.edges) {
        const path = document.createElementNS(XML_NAMESPACE, "path");
        const v1 = vertices
            .find(v => v.dataset.vertexId == e.vertex1.id)
            .querySelector("rect");
        const v2 = vertices
            .find(v => v.dataset.vertexId == e.vertex2.id)
            .querySelector("rect");
        const w1 = v1.getBoundingClientRect().width;
        const w2 = v2.getBoundingClientRect().width;
        const x1 = Number(v1.style.x) + (w1 / 2) + VERTEX_PADDING;
        const y1 = Number(v1.style.y) + (VERTEX_HEIGHT / 2) + VERTEX_PADDING;
        const x2 = Number(v2.style.x) + (w1 / 2) + VERTEX_PADDING;
        const y2 = Number(v2.style.y) + (VERTEX_HEIGHT / 2) + VERTEX_PADDING;

        svg.insertBefore(path, svg.firstChild);
        path.classList.add("edge");
        path.setAttribute("d", `
            M${x1},${y1}
            C${x2},${y1} ${x1},${y2} ${x2},${y2}
        `);
    }
}