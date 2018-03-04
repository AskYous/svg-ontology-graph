import * as Vertex from "./Vertex";
import * as Edge from "./Edge";
export default class Graph {
    /**
     * 
     * @param {Vertex} vertices a list of vertices
     * @param {Edge} edges a list of edges
     */
    constructor(vertices, edges) {
        this.vertices = vertices;
        this.edges = edges;
    }
}