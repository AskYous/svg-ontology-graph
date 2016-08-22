var Edge = (function () {
    function Edge(_vertex1, _vertex2) {
        this._vertex1 = _vertex1;
        this._vertex2 = _vertex2;
    }
    Object.defineProperty(Edge.prototype, "vertex1", {
        get: function () { return this._vertex1; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Edge.prototype, "vertex2", {
        get: function () { return this._vertex2; },
        enumerable: true,
        configurable: true
    });
    return Edge;
}());
