var people;
var relations;
var graph;
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
    setSVGGroups();
    setCircles();
    setTexts();
    setEdges();
    function setSVGGroups() {
        graph.vertices.forEach(function (vertex) {
            var svgGroup = document.createElementNS(ns, 'g');
            svgGroup.id = "g-" + vertex.id;
            svg.appendChild(svgGroup);
        });
    }
    function setCircles() {
        graph.vertices.forEach(function (vertex) {
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
            function setDrag() {
                var mouseY;
                var mouseX;
                var onDrag;
                var isDragging = false;
                document.onmousemove = function (event) {
                    mouseX = event.clientX;
                    mouseY = event.clientY;
                };
                circleElement.onmousedown = function (mousedownevent) {
                    isDragging = true;
                };
                circleElement.onmousemove = function () {
                    document.onmousemove = function (event) {
                        if (isDragging) {
                            svg.removeChild(svgGroup);
                            svg.appendChild(svgGroup);
                            var x_1 = event.clientX - (1.5 * radius);
                            var y_1 = event.clientY - (1.5 * radius);
                            circleElement.setAttribute('cx', x_1.toString());
                            circleElement.setAttribute('cy', y_1.toString());
                            clearSVGElements('line');
                            clearSVGElements('text');
                            setEdges();
                            setTexts();
                        }
                    };
                };
                circleElement.onmouseup = function () {
                    isDragging = false;
                };
            }
        });
    }
    function setTexts() {
        graph.vertices.forEach(function (vertex) {
            var person = people.filter(function (person) { return person.id == vertex.id; })[0];
            var svgGroup = document.getElementById("g-" + vertex.id);
            var circle = svgGroup.getElementsByTagName('circle')[0];
            var x = circle.getAttribute('cx');
            var y = circle.getAttribute('cy');
            var textElement = document.createElementNS(ns, 'text');
            textElement.innerHTML = person.name;
            textElement.setAttribute('text-anchor', 'middle');
            textElement.setAttribute('x', x.toString());
            textElement.setAttribute('y', (parseInt(y) + radius + 20).toString());
            svgGroup.appendChild(textElement);
        });
    }
    function setEdges() {
        graph.edges.forEach(function (edge) {
            var line = document.createElementNS(ns, 'line');
            var group1 = document.getElementById("g-" + edge.vertex1.id);
            var group2 = document.getElementById("g-" + edge.vertex2.id);
            var circle1 = group1.getElementsByTagName('circle')[0];
            var circle2 = group2.getElementsByTagName('circle')[0];
            console.assert(circle1 != null);
            line.setAttribute('x1', circle1.getAttribute('cx'));
            line.setAttribute('y1', circle1.getAttribute('cy'));
            line.setAttribute('x2', circle2.getAttribute('cx'));
            line.setAttribute('y2', circle2.getAttribute('cy'));
            svg.insertBefore(line, svg.childNodes[0]);
        });
    }
    function clearSVGElements(tagName) {
        var elements = Array.prototype.slice.call(svg.getElementsByTagName(tagName));
        elements.forEach(function (element) { return element.parentNode.removeChild(element); });
    }
}
