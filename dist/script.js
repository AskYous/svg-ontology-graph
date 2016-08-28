var people;
var relations;
var graph;
var isDragging = false;
var draggingVertexId = null;
var peopleUri = 'sample-data/small-data/people.json';
var relationsUri = 'sample-data/small-data/relations.json';
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
        graph.vertices.forEach(function (vertex) {
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
            function activateVertex() {
                svgGroup.classList.add('active');
                getAdjacentEdges().forEach(function (edge) {
                    var line = document.getElementById("l-" + edge.vertex1.id + "-" + edge.vertex2.id);
                    if (!line)
                        line = document.getElementById("l-" + edge.vertex2.id + "-" + edge.vertex1.id);
                    line.classList.add('active');
                    var g1 = document.getElementById("g-" + edge.vertex1.id);
                    var g2 = document.getElementById("g-" + edge.vertex2.id);
                    g1.classList.add('active');
                    g2.classList.add('active');
                    bringElementToTop(line);
                    bringElementToTop(g1);
                    bringElementToTop(g2);
                });
            }
            function deactivateVertex() {
                svgGroup.classList.remove('active');
                getAdjacentEdges().forEach(function (edge) {
                    var line = document.getElementById("l-" + edge.vertex1.id + "-" + edge.vertex2.id);
                    if (!line)
                        line = document.getElementById("l-" + edge.vertex2.id + "-" + edge.vertex1.id);
                    line.classList.remove('active');
                    var g1 = document.getElementById("g-" + edge.vertex1.id);
                    var g2 = document.getElementById("g-" + edge.vertex2.id);
                    g1.classList.remove('active');
                    g2.classList.remove('active');
                });
            }
            function getAdjacentEdges() {
                return graph.edges.filter(function (e) { return e.vertex1.id == vertex.id || e.vertex2.id == vertex.id; });
            }
            function setDrag() {
                var onDrag;
                var onmousedown = function () {
                    isDragging = true;
                    if (!draggingVertexId) {
                        draggingVertexId = vertex.id;
                    }
                    activateVertex();
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
                            var edges = getAdjacentEdges();
                            drawEdges(edges);
                            textElement.setAttribute('x', String(x_1 + rectPadding / 2));
                            textElement.setAttribute('y', String(y_1 + rectPadding / 2));
                        }
                    };
                };
                var onmouseup = function (a, b) {
                    isDragging = false;
                    draggingVertexId = null;
                    deactivateVertex();
                };
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
            var makeActive = false;
            var existingEdge = document.querySelector("#l-" + edge.vertex1.id + "-" + edge.vertex2.id + ", #l-" + edge.vertex2.id + "-" + edge.vertex1.id);
            if (existingEdge) {
                if (existingEdge.classList.contains('active'))
                    makeActive = true;
                existingEdge.parentNode.removeChild(existingEdge);
            }
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
            if (makeActive)
                line.classList.add('active');
            var lastLineIndex = svg.getElementsByTagName('line').length - 1;
            svg.insertBefore(line, svg.childNodes[lastLineIndex]);
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
    function bringElementToTop(element) {
        var parent = element.parentElement;
        parent.removeChild(element);
        parent.appendChild(element);
    }
}
