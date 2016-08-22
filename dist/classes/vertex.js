var Vertex = (function () {
    function Vertex(id) {
        this._id = id;
        this.radius = 30;
        this.isDragging = false;
        this.ns = 'http://www.w3.org/2000/svg';
        this.svgGroup = document.createElementNS(this.ns, 'g');
        this.displayed = false;
    }
    Object.defineProperty(Vertex.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    return Vertex;
}());
