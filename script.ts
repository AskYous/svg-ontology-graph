/// <reference path="./declarations/person.d.ts"/>

let people: Array<Person>;
let relations: Array<Array<number>>;
let graph: DiGraph;

let isDragging = false;
let draggingVertexId = null;

const peopleUri = 'sample-data/small-data/people.json';
const relationsUri = 'sample-data/small-data/relations.json';

const rectPadding = 15;

// Load Data
$.getJSON(peopleUri, (peopleResults: Person[]) => {
    $.getJSON(relationsUri, (relationsResults: Array<Array<number>>) => {
        const vertices = Array<Vertex>(peopleResults.length);
        const edges = Array<Edge>(relationsResults.length);

        // Save values
        people = peopleResults;
        relations = relationsResults;

        // Convert people to vertices and add them to vertices list
        people.forEach(person => {
            vertices.push(new Vertex(person.id));
        });

        // Convert relations to edges and add them to edges list
        relations.forEach(relation => {
            const firstVertex: Vertex = vertices.filter(v => v.id == relation[0])[0];
            const secondVertex: Vertex = vertices.filter(v => v.id == relation[1])[0];
            const edge = new Edge(firstVertex, secondVertex);

            edges.push(edge);
        });

        graph = new DiGraph(vertices, edges);
        drawGraph();
    });
});

function drawGraph() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg: SVGGElement = document.getElementsByTagNameNS(ns, 'svg')[0] as any;

    // Some math
    const svgPadding = 40;
    const svgWidth = svg.scrollWidth - (svgPadding * 2);
    const svgHeight = svg.scrollHeight - (svgPadding * 2);
    const radius = svgHeight / 20;

    let mouseY: number;
    let mouseX: number;

    // Capture user's mouse location always.
    document.onmousemove = event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
    }

    setSVGGroups();
    drawVertices(graph.vertices);
    drawEdges(graph.edges);

    function setSVGGroups() {
        graph.vertices.forEach(vertex => {
            const svgGroup = document.createElementNS(ns, 'g');
            svgGroup.id = `g-v-${vertex.id}`;
            svg.appendChild(svgGroup);
        });
    }

    function drawVertices(vertices: Vertex[]) {

        // Get vertices ordered by their line end frequency count.
        // Highest vertex is at i = 0 of the array;
        const vCountSorted = getVertexFrequencyCount().sort((a, b) => {
            return b[1] - a[1];
        });

        graph.vertices.forEach(vertex => {

            // Initialize variables
            const person = people.filter(p => p.id == vertex.id)[0];
            const svgGroup = document.getElementById(`g-v-${person.id}`);

            // Positions
            const x = Math.random() * svgWidth;
            const y = Math.random() * svgHeight;

            const textElement = <HTMLElement>document.createElementNS(ns, 'text');
            textElement.innerHTML = person.name;
            textElement.setAttribute('x', String(x));
            textElement.setAttribute('y', String(y));
            textElement.setAttribute('dominant-baseline', 'text-before-edge');
            svgGroup.appendChild(textElement);

            // Circle
            const rectElement = <HTMLElement>document.createElementNS(ns, 'rect');
            rectElement.setAttribute('x', String(x - (rectPadding / 2)));
            rectElement.setAttribute('y', String(y - (rectPadding / 2)));
            rectElement.setAttribute('width', String(textElement.getBoundingClientRect().width + rectPadding));
            rectElement.setAttribute('height', String(textElement.getBoundingClientRect().height + rectPadding));

            svgGroup.insertBefore(rectElement, textElement);

            setDrag();

            function activateVertex() {
                svgGroup.classList.add('active');

                // Activate edges
                getAdjacentEdges().forEach(edge => {
                    let lineGroup = document.getElementById(`g-e-${edge.vertex1.id}-${edge.vertex2.id}`);
                    if (!lineGroup) lineGroup = document.getElementById(`g-e-${edge.vertex2.id}-${edge.vertex1.id}`);
                    lineGroup.classList.add('active');

                    let line = lineGroup.getElementsByTagName('line')[0];

                    let vertexGroup1 = document.getElementById(`g-v-${edge.vertex1.id}`);
                    let vertexGroup2 = document.getElementById(`g-v-${edge.vertex2.id}`);

                    vertexGroup1.classList.add('active');
                    vertexGroup2.classList.add('active');

                    bringElementToTop(lineGroup);
                    bringElementToTop(vertexGroup1);
                    bringElementToTop(vertexGroup2);
                });
            }

            function deactivateVertex() {
                svgGroup.classList.remove('active');

                // Dectivate edges
                getAdjacentEdges().forEach(edge => {
                    let lineGroup = document.getElementById(`g-e-${edge.vertex1.id}-${edge.vertex2.id}`);
                    if (!lineGroup) lineGroup = document.getElementById(`g-e-${edge.vertex2.id}-${edge.vertex1.id}`);
                    lineGroup.classList.remove('active');

                    let vertexGroup1 = document.getElementById(`g-v-${edge.vertex1.id}`);
                    let vertexGroup2 = document.getElementById(`g-v-${edge.vertex2.id}`);

                    vertexGroup1.classList.remove('active');
                    vertexGroup2.classList.remove('active');
                });
            }

            function getAdjacentEdges() {
                return graph.edges.filter(e => e.vertex1.id == vertex.id || e.vertex2.id == vertex.id);
            }

            // Drag and drop
            function setDrag() {
                let onDrag: number;

                const onmousedown = () => {
                    isDragging = true;
                    if (!draggingVertexId) {
                        draggingVertexId = vertex.id;
                    }
                    activateVertex();
                }
                const onmousemove = () => {
                    if (!isDragging || draggingVertexId != vertex.id) {
                        return;
                    }
                    document.onmousemove = event => {
                        if (isDragging) {
                            // Bring to top
                            svg.removeChild(svgGroup);
                            svg.appendChild(svgGroup);

                            // Get mouse location
                            let x = event.clientX - (rectElement.getBoundingClientRect().width / 2);
                            let y = event.clientY - (rectElement.getBoundingClientRect().height / 2);

                            // Move circle to mouse location
                            rectElement.setAttribute('x', String(x));
                            rectElement.setAttribute('y', String(y));

                            // Redraw edges
                            let edges = getAdjacentEdges();
                            drawEdges(edges);

                            // Redraw Text
                            textElement.setAttribute('x', String(x + rectPadding / 2));
                            textElement.setAttribute('y', String(y + rectPadding / 2));
                        }
                    }
                }
                const onmouseup = (a, b) => {
                    isDragging = false;
                    draggingVertexId = null;
                    deactivateVertex();
                }

                // Note that dragging has begun
                rectElement.onmousedown = onmousedown;
                textElement.onmousedown = onmousedown;

                // Dragging
                rectElement.onmousemove = onmousemove;
                textElement.onmousemove = onmousemove;

                // Note that dragging has finished.
                rectElement.onmouseup = onmouseup as any;
                textElement.onmouseup = onmouseup as any;

            }
        });
    }

    function drawEdges(edges: Edge[]) {
        edges.forEach(edge => {

            let makeActive = false;

            // Delete if exists
            let existingEdgeGroup = document.querySelector(`#g-e-${edge.vertex1.id}-${edge.vertex2.id}, #g-e-${edge.vertex2.id}-${edge.vertex1.id}`);
            if (existingEdgeGroup) {
                if (existingEdgeGroup.classList.contains('active')) makeActive = true;
                existingEdgeGroup.parentNode.removeChild(existingEdgeGroup);
            }

            // The edge group
            let group = <HTMLElement>document.createElementNS(ns, 'g');
            let line = <HTMLElement>document.createElementNS(ns, 'line');

            // Vertex SVG Elements
            let vertexGroup1 = <HTMLElement>document.getElementById(`g-v-${edge.vertex1.id}`);
            let vertexGroup2 = <HTMLElement>document.getElementById(`g-v-${edge.vertex2.id}`);

            let circle1 = vertexGroup1.getElementsByTagName('rect')[0];
            let circle2 = vertexGroup2.getElementsByTagName('rect')[0];

            // Set id
            let id1 = vertexGroup1.getAttribute('id').split('-')[2];
            let id2 = vertexGroup2.getAttribute('id').split('-')[2];
            group.id = `g-e-${id1}-${id2}`;

            // Starting position
            line.setAttribute('x1', String(Number(circle1.getAttribute('x')) + (Number(circle1.getAttribute('width')) / 2)));
            line.setAttribute('y1', String(Number(circle1.getAttribute('y')) + (Number(circle1.getAttribute('height')) / 2)));

            // Ending position
            line.setAttribute('x2', String(Number(circle2.getAttribute('x')) + (Number(circle2.getAttribute('width')) / 2)));
            line.setAttribute('y2', String(Number(circle2.getAttribute('y')) + (Number(circle2.getAttribute('height')) / 2)));

            // Mak active if necessary.
            if (makeActive) group.classList.add('active');

            // Add on top
            let lastLineIndex = svg.getElementsByTagName('line').length - 1;
            group.appendChild(line);
            svg.insertBefore(group, svg.childNodes[lastLineIndex]);
        });
    }

    /**
     * Returns an array of Vertex ID's mapped to the the amount of times a line starts or ends to them.
     */
    function getVertexFrequencyCount() {
        let vCounts = Array<number>();

        graph.edges.forEach(edge => {
            // Initialize to zero
            if (!vCounts[edge.vertex1.id]) vCounts[edge.vertex1.id] = 0;
            if (!vCounts[edge.vertex2.id]) vCounts[edge.vertex2.id] = 0;

            // Increase vertex count
            vCounts[edge.vertex1.id]++;
            vCounts[edge.vertex2.id]++;
        });

        return vCounts.map((count, i) => [i, count]);
    }

    function bringElementToTop(element: HTMLElement) {
        let parent = element.parentElement;
        parent.removeChild(element);
        parent.appendChild(element);
    }

}
