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
    const VERTEX_MOUSE_SAFETY_AREA = 5;

    // The SVG Element
    const svg = document.createElementNS(XML_NAMESPACE, "svg");
    // The  vertex elements
    const vertexElements = {};
    // The edge elements
    const edgeElements = {};

    svg.classList.add("svg-graph");
    container.appendChild(svg);

    // create vertex elements
    for (let v of graph.vertices) {
        // vertex container
        const group = document.createElementNS(XML_NAMESPACE, "g");
        // vertex text
        const text = document.createElementNS(XML_NAMESPACE, "text");
        // vertex background
        const rect = document.createElementNS(XML_NAMESPACE, "rect");
        // vertex width without padding
        const width = CHAR_WIDTH * v.name.length;
        // vertex x location (from its upper left
        const x = Math.random() * GRAPH_WIDTH;
        // vertex y location (from its upper left
        const y = Math.random() * GRAPH_HEIGHT;
        // whether the user is currently holding a vertex
        let isHolding = false;

        // callback function when user holds a vertex
        let onMouseDown;
        const onMouseMove = function (event) {
            rect.style.x = event.offsetX - VERTEX_MOUSE_SAFETY_AREA;
            rect.style.y = event.offsetY - VERTEX_MOUSE_SAFETY_AREA;
            text.setAttribute("x", event.offsetX + (VERTEX_PADDING / 2));
            text.setAttribute("y", event.offsetY + (VERTEX_PADDING / 2));

            for (let e in edgeElements[v.id]) {
                const v2 = vertexElements[e];
                const edge = edgeElements[v.id][e];
                const rect2 = svg.querySelector(`[data-vertex-id="${v2.dataset.vertexId}"] rect`);
                commandPath(rect, rect2, edge);
            }
        };
        let onMouseUp;

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

        // enable dragging
        onMouseDown = function () {
            isHolding = !isHolding;
            if (isHolding) svg.addEventListener("mousemove", onMouseMove);
            else svg.removeEventListener("mousemove", onMouseMove);
        }

        rect.addEventListener("mousedown", onMouseDown);
        text.addEventListener("mousedown", onMouseDown);

        // save the vertex elements
        vertexElements[v.id] = group;

        // prepare edges
        edgeElements[v.id] = {};
    }

    // create edge elements
    for (let e of graph.edges) {
        // The edge
        const path = document.createElementNS(XML_NAMESPACE, "path");
        // The rect elements for both vertices
        const r1 = vertexElements[e.vertex1.id].querySelector("rect");
        const r2 = vertexElements[e.vertex2.id].querySelector("rect");

        commandPath(r1, r2, path);

        // save the edges (but no direction yet)
        edgeElements[e.vertex1.id][e.vertex2.id] = path;
        edgeElements[e.vertex2.id][e.vertex1.id] = path;
    }

    /**
     * Fills in the "d" value of a path
     * @param {HTMLElement} vertex1 the first vertex of the path
     * @param {HTMLElement} vertex2 the second path of the vertex
     * @param {HTMLElement} path the path elememnt
     */
    function commandPath(rect1, rect2, path) {
        // The vertex widths (including padding)
        const w1 = rect1.getBoundingClientRect().width;
        const w2 = rect2.getBoundingClientRect().width;

        // The x, y coordinates of both vertices
        const x1 = Number(rect1.style.x) + (w1 / 2) + VERTEX_PADDING;
        const y1 = Number(rect1.style.y) + (VERTEX_HEIGHT / 2) + VERTEX_PADDING;
        const x2 = Number(rect2.style.x) + (w1 / 2) + VERTEX_PADDING;
        const y2 = Number(rect2.style.y) + (VERTEX_HEIGHT / 2) + VERTEX_PADDING;

        // add path to svg
        svg.insertBefore(path, svg.firstChild);

        // say it's an edge
        path.classList.add("edge");

        // create the path commands
        path.setAttribute("d", `
            M${x1},${y1}
            C${x2},${y1} ${x1},${y2} ${x2},${y2}
        `);

        return path;
    }
}