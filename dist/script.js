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
            svgGroup.id = "g-v-" + vertex.id;
            svg.appendChild(svgGroup);
        });
    }
    function drawVertices(vertices) {
        var vCountSorted = getVertexFrequencyCount().sort(function (a, b) {
            return b[1] - a[1];
        });
        graph.vertices.forEach(function (vertex) {
            var person = people.filter(function (p) { return p.id == vertex.id; })[0];
            var svgGroup = document.getElementById("g-v-" + person.id);
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
                    var lineGroup = getSvgLineGroup(edge);
                    lineGroup.classList.add('active');
                    var line = lineGroup.getElementsByTagName('line')[0];
                    var vertexGroup1 = document.getElementById("g-v-" + edge.vertex1.id);
                    var vertexGroup2 = document.getElementById("g-v-" + edge.vertex2.id);
                    vertexGroup1.classList.add('active');
                    vertexGroup2.classList.add('active');
                    bringElementToTop(lineGroup);
                    bringElementToTop(vertexGroup1);
                    bringElementToTop(vertexGroup2);
                });
            }
            function deactivateVertex() {
                svgGroup.classList.remove('active');
                getAdjacentEdges().forEach(function (edge) {
                    var lineGroup = getSvgLineGroup(edge);
                    lineGroup.classList.remove('active');
                    var vertexGroup1 = document.getElementById("g-v-" + edge.vertex1.id);
                    var vertexGroup2 = document.getElementById("g-v-" + edge.vertex2.id);
                    vertexGroup1.classList.remove('active');
                    vertexGroup2.classList.remove('active');
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
                            var x_1 = (event.clientX + window.scrollX) - (rectElement.getBoundingClientRect().width / 2);
                            var y_1 = (event.clientY + window.scrollY) - (rectElement.getBoundingClientRect().height / 2);
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
            var existingEdgeGroup = getSvgLineGroup(edge);
            if (existingEdgeGroup) {
                if (existingEdgeGroup.classList.contains('active'))
                    makeActive = true;
                existingEdgeGroup.parentNode.removeChild(existingEdgeGroup);
            }
            var group = document.createElementNS(ns, 'g');
            var line = document.createElementNS(ns, 'line');
            var arrow = document.createElementNS(ns, 'path');
            var vertexGroup1 = document.getElementById("g-v-" + edge.vertex1.id);
            var vertexGroup2 = document.getElementById("g-v-" + edge.vertex2.id);
            var circle1 = vertexGroup1.getElementsByTagName('rect')[0];
            var circle2 = vertexGroup2.getElementsByTagName('rect')[0];
            var id1 = vertexGroup1.getAttribute('id').split('-')[2];
            var id2 = vertexGroup2.getAttribute('id').split('-')[2];
            group.id = "g-e-" + id1 + "-" + id2;
            var startPointX = Number(circle1.getAttribute('x')) + (Number(circle1.getAttribute('width')) / 2);
            var startPointY = Number(circle1.getAttribute('y')) + (Number(circle1.getAttribute('height')) / 2);
            var endingPointX = Number(circle2.getAttribute('x')) + (Number(circle2.getAttribute('width')) / 2);
            var endingPointY = Number(circle2.getAttribute('y')) + (Number(circle2.getAttribute('height')) / 2);
            line.setAttribute('x1', String(startPointX));
            line.setAttribute('y1', String(startPointY));
            line.setAttribute('x2', String(endingPointX));
            line.setAttribute('y2', String(endingPointY));
            var midpointX = Math.abs(startPointX + endingPointX) / 2;
            var midpointY = Math.abs(startPointY + endingPointY) / 2;
            arrow.setAttribute('d', "M" + midpointX + "," + (midpointY - 10) + " L" + (midpointX + 25) + "," + (midpointY + 0) + ", L" + midpointX + "," + (midpointY + 10) + ", L" + midpointX + "," + (midpointY - 10));
            if (makeActive)
                group.classList.add('active');
            var lastLineIndex = svg.getElementsByTagName('line').length - 1;
            group.appendChild(line);
            group.appendChild(arrow);
            svg.insertBefore(group, svg.childNodes[lastLineIndex]);
            arrow.style.transform = "rotate(" + getEdgeAngle(edge) + "deg)";
        });
    }
    function getSvgLineGroup(edge) {
        return document.querySelector("#g-e-" + edge.vertex1.id + "-" + edge.vertex2.id + ", #g-e-" + edge.vertex2.id + "-" + edge.vertex1.id);
    }
    function getEdgeAngle(edge) {
        var line = getSvgLineGroup(edge).getElementsByTagName('line')[0];
        var x1 = Number(line.getAttribute('x1'));
        var y1 = Number(line.getAttribute('y1'));
        var x2 = Number(line.getAttribute('x2'));
        var y2 = Number(line.getAttribute('y2'));
        var slope = {
            'numerator': y2 - y1,
            'denominator': x2 - x1,
            'value': (y2 - y1) / (x2 - x1),
            'quadrant': null
        };
        if (slope.numerator >= 0) {
            if (slope.denominator >= 0) {
                slope.quadrant = 1;
            }
            else {
                slope.quadrant = 2;
            }
        }
        else {
            if (slope.denominator >= 0) {
                slope.quadrant = 4;
            }
            else {
                slope.quadrant = 3;
            }
            ;
        }
        var angle = (Math.atan(slope.value) * (180 / Math.PI));
        switch (slope.quadrant) {
            case 1:
                angle = angle;
                break;
            case 2:
                angle = 180 + angle;
                break;
            case 3:
                angle = angle - 180;
                break;
            case 4: angle = angle;
        }
        console.log(line, angle);
        return angle;
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
