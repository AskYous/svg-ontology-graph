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
    const VERTEX_WIDTH = container.getBoundingClientRect().width;
    const VERTEX_HEIGHT = container.getBoundingClientRect().width;
    const VERTEX_PADDING = 8;
    const CHAR_WIDTH = 15;

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
        const group = document.createElementNS(XML_NAMESPACE, "g");
        const text = document.createElementNS(XML_NAMESPACE, "text");
        const rect = document.createElementNS(XML_NAMESPACE, "rect");

        const width = CHAR_WIDTH * v.name.length;
        const x = Math.random() * VERTEX_WIDTH;
        const y = Math.random() * VERTEX_HEIGHT;

        group.appendChild(rect);
        group.appendChild(text);
        svg.appendChild(group);

        // set text
        text.innerHTML = v.name;

        // decorate rect
        group.classList.add("vertex");
        group.dataset.vertexId = v.id;
        rect.style.width = `${text.getBoundingClientRect().width + (VERTEX_PADDING * 2)}px`;

        rect.style.x = x;
        rect.style.y = y;
        text.setAttribute("x", x + VERTEX_PADDING);
        text.setAttribute("y", y + VERTEX_PADDING);
        text.setAttribute("dy", 10);

        vertices.push(group);
    }
}