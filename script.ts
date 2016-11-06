/// <reference path="./declarations/person.d.ts"/>
class SVGOntologyGraph {
    constructor(private people: Array<Person>, private relations: Array<Array<number>>, private svgElement: HTMLElement) {

      createControlBox();
      drawSVGGraph();

      function createControlBox(){
        const controlBox = document.createElement('div'); // the control box
        controlBox.id = 'control-box';

        const input = document.createElement('input');
        input.id = 'search';
        input.placeholder = 'Search...';
        controlBox.appendChild(input);

        const peopleCheckboxes = new Array<HTMLDivElement>();

        people.forEach(person => {
          const divContainer = document.createElement('div'); // div container
          divContainer.classList.add('person-checkbox');
          divContainer.id = `person-checkbox-${person.id}`;

          const checkbox = document.createElement('input'); // checkbox
          checkbox.type = 'checkbox'
          checkbox.id = `checkbox-${person.id}`;
          divContainer.appendChild(checkbox);

          const label = document.createElement('label'); // label
          label.innerHTML = person.name;
          label.htmlFor = checkbox.id;
          divContainer.appendChild(label);

          controlBox.appendChild(divContainer);
        });

        document.getElementsByTagName('body')[0].appendChild(controlBox);
      }

      function drawSVGGraph(){


        let graph: DiGraph;
        let isDragging = false;
        let draggingVertexId = null;

        const peopleUri = 'sample-data/large-data/people.json';
        const relationsUri = 'sample-data/large-data/relations.json';

        const rectPadding = 15;

        // Load Data
        const vertices = Array<Vertex>(people.length);
        const edges = Array<Edge>(relations.length);

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

        function drawGraph() {
            const ns = 'http://www.w3.org/2000/svg';

            // Some math
            const svgPadding = 40;
            const svgWidth = svgElement.scrollWidth - (svgPadding * 2);
            const svgHeight = svgElement.scrollHeight - (svgPadding * 2);
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
                    svgElement.appendChild(svgGroup);
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
                            let lineGroup = getSvgLineGroup(edge);
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
                            let lineGroup = getSvgLineGroup(edge);
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
                                    svgElement.removeChild(svgGroup);
                                    svgElement.appendChild(svgGroup);

                                    // Get mouse location
                                    let x = (event.clientX + window.scrollX) - (rectElement.getBoundingClientRect().width / 2);
                                    let y = (event.clientY + window.scrollY) - (rectElement.getBoundingClientRect().height / 2);

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
                    let existingEdgeGroup = getSvgLineGroup(edge);
                    if (existingEdgeGroup) {
                        if (existingEdgeGroup.classList.contains('active')) makeActive = true;
                        existingEdgeGroup.parentNode.removeChild(existingEdgeGroup);
                    }

                    // The edge group
                    let group = <HTMLElement>document.createElementNS(ns, 'g');
                    let line = <HTMLElement>document.createElementNS(ns, 'line');
                    let arrow = <HTMLElement>document.createElementNS(ns, 'path');

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
                    let startPointX = Number(circle1.getAttribute('x')) + (Number(circle1.getAttribute('width')) / 2);
                    let startPointY = Number(circle1.getAttribute('y')) + (Number(circle1.getAttribute('height')) / 2);

                    // Ending position
                    let endingPointX = Number(circle2.getAttribute('x')) + (Number(circle2.getAttribute('width')) / 2);
                    let endingPointY = Number(circle2.getAttribute('y')) + (Number(circle2.getAttribute('height')) / 2);

                    line.setAttribute('x1', String(startPointX));
                    line.setAttribute('y1', String(startPointY));

                    line.setAttribute('x2', String(endingPointX));
                    line.setAttribute('y2', String(endingPointY));

                    // arrow properties
                    let midpointX = Math.abs(startPointX + endingPointX) / 2;
                    let midpointY = Math.abs(startPointY + endingPointY) / 2;
                    arrow.setAttribute('d', `M${midpointX},${midpointY - 10} L${midpointX + 25},${midpointY + 0}, L${midpointX},${midpointY + 10}, L${midpointX},${midpointY - 10}`);

                    // Mak active if necessary.
                    if (makeActive) group.classList.add('active');

                    // Add on top
                    let lastLineIndex = svgElement.getElementsByTagName('line').length - 1;
                    group.appendChild(line);
                    group.appendChild(arrow);
                    svgElement.insertBefore(group, svgElement.childNodes[lastLineIndex]);
                    arrow.style.transform = `rotate(${getEdgeAngle(edge)}deg)`;
                });
            }

            function getSvgLineGroup(edge: Edge): HTMLElement {
                return <HTMLElement>document.querySelector(`#g-e-${edge.vertex1.id}-${edge.vertex2.id}, #g-e-${edge.vertex2.id}-${edge.vertex1.id}`);
            }

            function getEdgeAngle(edge: Edge) {
                let line = getSvgLineGroup(edge).getElementsByTagName('line')[0];

                let x1 = Number(line.getAttribute('x1'));
                let y1 = Number(line.getAttribute('y1'));
                let x2 = Number(line.getAttribute('x2'));
                let y2 = Number(line.getAttribute('y2'));

                let slope = {
                    'numerator': y2 - y1,
                    'denominator': x2 - x1,
                    'value': (y2 - y1) / (x2 - x1),
                    'quadrant': null
                };

                if (slope.numerator >= 0) { // bottom (graph is not like high school graphs)
                    if (slope.denominator >= 0) { slope.quadrant = 1; } // right
                    else { slope.quadrant = 2; } // left
                } else { // bottom
                    if (slope.denominator >= 0) { slope.quadrant = 4; } // right
                    else { slope.quadrant = 3; };
                }

                let angle = (Math.atan(slope.value) * (180 / Math.PI));
                switch (slope.quadrant) {
                    case 1: angle = angle; break;
                    case 2: angle = 180 + angle; break; // works!
                    case 3: angle = angle - 180; break;
                    case 4: angle = angle;
                }

                // console.log(line, angle);

                return angle;
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
      }

    };
}
