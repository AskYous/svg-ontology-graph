var people;
var relations;
var graph;
var isDragging = false;
var draggingVertexId = null;
$.getJSON('sample-data/people.json', function (peopleResults) {
    $.getJSON('sample-data/relations.json', function (relationsResults) {
        var vertices = Array(peopleResults.length);
        var edges = Array(relationsResults.length);
        people = peopleResults;
        relations = relationsResults;
        people.forEach(function (person) {
            vertices.push(new Vertex(person.id));
        });
        relations.forEach(function (relation) {
            var firstVertex = vertices.filter(function (v) { return v.id == relation[0]; })[0];
            var secondVertex = vertices.filter(function (v) { return v.id == relation[1]; })[0];
            var edge = new Edge(firstVertex, secondVertex);
            edges.push(edge);
        });
        graph = new DiGraph(vertices, edges);
        drawGraph();
    });
});
function drawGraph() {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.getElementsByTagNameNS(ns, 'svg')[0];
    var svgPadding = 40;
    var svgWidth = svg.scrollWidth - (svgPadding * 2);
    var svgHeight = svg.scrollHeight - (svgPadding * 2);
    var radius = svgHeight / 20;
    var mouseY;
    var mouseX;
    document.onmousemove = function (event) {
        mouseX = event.clientX;
        mouseY = event.clientY;
    };
    setSVGGroups();
    drawVertices(graph.vertices);
    drawEdges(graph.edges);
    function setSVGGroups() {
        graph.vertices.forEach(function (vertex) {
            var svgGroup = document.createElementNS(ns, 'g');
            svgGroup.id = "g-" + vertex.id;
            svg.appendChild(svgGroup);
        });
    }
    function drawVertices(vertices) {
        var vCountSorted = getVertexFrequencyCount().sort(function (a, b) {
            return b[1] - a[1];
        });
        vCountSorted.forEach(function (vCount) {
            var index = vCount[0];
            var vertex = graph.vertices.filter(function (v) { return v.id == vCount[0]; })[0];
            var person = people.filter(function (p) { return p.id == vertex.id; })[0];
            var svgGroup = document.getElementById("g-" + person.id);
            var x = Math.random() * svgWidth;
            var y = Math.random() * svgHeight;
            var circleElement = document.createElementNS(ns, 'circle');
            circleElement.setAttribute('cx', x.toString());
            circleElement.setAttribute('cy', y.toString());
            circleElement.setAttribute('r', radius.toString());
            svgGroup.appendChild(circleElement);
            setDrag();
            var textElement = document.createElementNS(ns, 'text');
            textElement.innerHTML = person.name;
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('x', x.toString());
            textElement.setAttribute('y', (y + radius + 20).toString());
            svgGroup.appendChild(textElement);
            function setDrag() {
                var onDrag;
                circleElement.onmousedown = function (mousedownevent) {
                    isDragging = true;
                    if (!draggingVertexId) {
                        draggingVertexId = vertex.id;
                    }
                };
                circleElement.onmousemove = function () {
                    if (!isDragging || draggingVertexId != vertex.id) {
                        return;
                    }
                    document.onmousemove = function (event) {
                        if (isDragging) {
                            svg.removeChild(svgGroup);
                            svg.appendChild(svgGroup);
                            var x_1 = event.clientX - (1.5 * radius);
                            var y_1 = event.clientY - (1.5 * radius);
                            circleElement.setAttribute('cx', x_1.toString());
                            circleElement.setAttribute('cy', y_1.toString());
                            var edges = graph.edges.filter(function (line) { return line.vertex1.id === person.id || line.vertex2.id === person.id; });
                            drawEdges(edges);
                            textElement.setAttribute('x', x_1.toString());
                            textElement.setAttribute('y', (y_1 + radius + 20).toString());
                        }
                    };
                };
                circleElement.onmouseup = function () {
                    isDragging = false;
                    draggingVertexId = null;
                };
            }
        });
    }
    function drawEdges(edges) {
        edges.forEach(function (edge) {
            var existingEdge = document.querySelector("#l-" + edge.vertex1.id + "-" + edge.vertex2.id + ", #l-" + edge.vertex2.id + "-" + edge.vertex1.id);
            if (existingEdge)
                existingEdge.parentNode.removeChild(existingEdge);
            var line = document.createElementNS(ns, 'line');
            var group1 = document.getElementById("g-" + edge.vertex1.id);
            var group2 = document.getElementById("g-" + edge.vertex2.id);
            var circle1 = group1.getElementsByTagName('circle')[0];
            var circle2 = group2.getElementsByTagName('circle')[0];
            var id1 = group1.getAttribute('id').split('-')[1];
            var id2 = group2.getAttribute('id').split('-')[1];
            line.id = "l-" + id1 + "-" + id2;
            line.setAttribute('x1', circle1.getAttribute('cx'));
            line.setAttribute('y1', circle1.getAttribute('cy'));
            line.setAttribute('x2', circle2.getAttribute('cx'));
            line.setAttribute('y2', circle2.getAttribute('cy'));
            svg.insertBefore(line, svg.childNodes[0]);
        });
    }
    function getVertexFrequencyCount() {
        var vCounts = Array();
        graph.edges.forEach(function (edge) {
            if (!vCounts[edge.vertex1.id])
                vCounts[edge.vertex1.id] = 0;
            if (!vCounts[edge.vertex2.id])
                vCounts[edge.vertex2.id] = 0;
            vCounts[edge.vertex1.id]++;
            vCounts[edge.vertex2.id]++;
        });
        return vCounts.map(function (count, i) { return [i, count]; });
    }
}
