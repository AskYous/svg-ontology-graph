var DiGraph = (function () {
    function DiGraph(_vertices, _edges) {
        this._vertices = _vertices;
        this._edges = _edges;
    }
    Object.defineProperty(DiGraph.prototype, "vertices", {
        get: function () {
            return this._vertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiGraph.prototype, "edges", {
        get: function () {
            return this._edges;
        },
        enumerable: true,
        configurable: true
    });
    return DiGraph;
}());
