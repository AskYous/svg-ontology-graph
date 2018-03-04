export class Vertex {
    constructor(id, data) {
        this.id = id;
        this.data = data;
    }
}
export class Edge {
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
    const WIDTH = container.getBoundingClientRect().width;
    const HEIGHT = container.getBoundingClientRect().width;

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
        const element = document.createElementNS(XML_NAMESPACE, "text");

        element.classList.add("vertex");
        element.dataset.vertexId = v.id;
        element.innerHTML = v.data;

        element.setAttribute("x", Math.random() * WIDTH);
        element.setAttribute("y", Math.random() * HEIGHT);

        vertices.push(element);
        svg.appendChild(element);
    }
}