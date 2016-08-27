var people;
var relations;
var graph;
var isDragging = false;
var draggingVertexId = null;
var peopleUri = 'sample-data/large-data/people.json';
var relationsUri = 'sample-data/large-data/relations.json';
var rectPadding = 15;
$.getJSON(peopleUri, function (peopleResults) {
    $.getJSON(relationsUri, function (relationsResults) {
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
            var textElement = document.createElementNS(ns, 'text');
            textElement.innerHTML = person.name;
            textElement.setAttribute('x', String(x));
            textElement.setAttribute('y', String(y));
            textElement.setAttribute('dominant-baseline', 'text-before-edge');
            svgGroup.appendChild(textElement);
            var rectElement = document.createElementNS(ns, 'rect');
            rectElement.setAttribute('x', String(x - (rectPadding / 2)));
            rectElement.setAttribute('y', String(y - (rectPadding / 2)));
            rectElement.setAttribute('width', String(textElement.getBoundingClientRect().width + rectPadding));
            rectElement.setAttribute('height', String(textElement.getBoundingClientRect().height + rectPadding));
            svgGroup.insertBefore(rectElement, textElement);
            setDrag();
            function setDrag() {
                var onDrag;
                var onmousedown = function () {
                    isDragging = true;
                    if (!draggingVertexId) {
                        draggingVertexId = vertex.id;
                    }
                };
                var onmousemove = function () {
                    if (!isDragging || draggingVertexId != vertex.id) {
                        return;
                    }
                    document.onmousemove = function (event) {
                        if (isDragging) {
                            svg.removeChild(svgGroup);
                            svg.appendChild(svgGroup);
                            var x_1 = event.clientX - (rectElement.getBoundingClientRect().width / 2);
                            var y_1 = event.clientY - (rectElement.getBoundingClientRect().height / 2);
                            rectElement.setAttribute('x', String(x_1));
                            rectElement.setAttribute('y', String(y_1));
                            var edges = graph.edges.filter(function (line) { return line.vertex1.id === person.id || line.vertex2.id === person.id; });
                            drawEdges(edges);
                            textElement.setAttribute('x', String(x_1 + rectPadding / 2));
                            textElement.setAttribute('y', String(y_1 + rectPadding / 2));
                        }
                    };
                };
                function onmouseup(a, b) {
                    isDragging = false;
                    draggingVertexId = null;
                }
                rectElement.onmousedown = onmousedown;
                textElement.onmousedown = onmousedown;
                rectElement.onmousemove = onmousemove;
                textElement.onmousemove = onmousemove;
                rectElement.onmouseup = onmouseup;
                textElement.onmouseup = onmouseup;
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
            var circle1 = group1.getElementsByTagName('rect')[0];
            var circle2 = group2.getElementsByTagName('rect')[0];
            var id1 = group1.getAttribute('id').split('-')[1];
            var id2 = group2.getAttribute('id').split('-')[1];
            line.id = "l-" + id1 + "-" + id2;
            line.setAttribute('x1', String(Number(circle1.getAttribute('x')) + (Number(circle1.getAttribute('width')) / 2)));
            line.setAttribute('y1', String(Number(circle1.getAttribute('y')) + (Number(circle1.getAttribute('height')) / 2)));
            line.setAttribute('x2', String(Number(circle2.getAttribute('x')) + (Number(circle2.getAttribute('width')) / 2)));
            line.setAttribute('y2', String(Number(circle2.getAttribute('y')) + (Number(circle2.getAttribute('height')) / 2)));
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
