/// <reference path="./declarations/person.d.ts"/>

let people: Array<Person>;
let relations: Array<Array<number>>;
let graph: DiGraph;

// Get Data
$.getJSON('sample-data/people.json', (peopleResults: Person[]) => {
    $.getJSON('sample-data/relations.json', (relationsResults: Array<Array<number>>) => {
        let vertices = Array<Vertex>(peopleResults.length);
        let edges = Array<Edge>(relationsResults.length);

        // Save values
        people = peopleResults;
        relations = relationsResults;

        // Convert people to vertices and add them to vertices list
        people.forEach(person => {
          vertices.push(new Vertex(person.id));
        });

        // Convert relations to edges and add them to edges list
        relations.forEach(relation => {
          let firstVertex: Vertex = vertices.filter(v => v.id == relation[0])[0];
          let secondVertex: Vertex = vertices.filter(v => v.id == relation[1])[0];
          let edge = new Edge(firstVertex, secondVertex);

          edges.push(edge);
        });

        graph = new DiGraph(vertices, edges);
        drawGraph();
    });
});

function drawGraph() {
  let ns = 'http://www.w3.org/2000/svg';
  let svg: SVGGElement = document.getElementsByTagNameNS(ns, 'svg')[0] as any;

  // Some math
  let svgPadding = 40;
  let svgWidth = svg.scrollWidth - (svgPadding * 2);
  let svgHeight = svg.scrollHeight - (svgPadding * 2);
  let radius = svgHeight / 20;

  setVertices();
  setEdges();

  function setVertices() {
    graph.vertices.forEach(vertex => {

    let person = people.filter(p => p.id == vertex.id)[0];

    // Positions
    let x = Math.random() * svgWidth;
    let y = Math.random() * svgHeight;

    // Group
    let svgGroup = document.createElementNS(ns, 'g');
    svgGroup.id = `g-${vertex.id}`;

    // Circle
    let circleElement: SVGCircleElement = document.createElementNS(ns, 'circle') as any;
    circleElement.setAttribute('cx', x.toString());
    circleElement.setAttribute('cy', y.toString());
    circleElement.setAttribute('r', radius.toString());
    svgGroup.appendChild(circleElement);

    // Text
    let textElement: SVGTextElement = document.createElementNS(ns, 'text') as any;
    textElement.innerHTML = person.name;
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('x', x.toString());
    textElement.setAttribute('y', (y + + radius + 20).toString());
    svgGroup.appendChild(textElement);

    // Drag and drop
    {
      let mouseY: number;
      let mouseX: number;
      let onDrag: number;

      let isDragging = false;

      document.onmousemove = event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
      }

      circleElement.onmousedown = mousedownevent => {
        isDragging = true;
      }

      circleElement.onmousemove = () => {
        document.onmousemove = event => {
          if(isDragging){
            // Bring to top
            svg.removeChild(svgGroup);
            svg.appendChild(svgGroup);

            let x = event.clientX - (2 * radius);
            let y = event.clientY - (2 * radius);

            circleElement.setAttribute('cx', x.toString());
            circleElement.setAttribute('cy', y.toString());
          }
        }
      }

      circleElement.onmouseup = () => {
        isDragging = false;
      }

      circleElement.onmouseout = () => {
        // isDragging = false;
      }
    }

    // Display it
    svg.appendChild(svgGroup);

  });
  }

  function setEdges(){
    graph.edges.forEach(edge => {

      // The line segment
      let line = document.createElementNS(ns, 'line');

      // Vertex SVG Elements
      let group1 = document.getElementById(`g-${edge.vertex1.id}`) as any;
      let group2 = document.getElementById(`g-${edge.vertex2.id}`) as any;
      let circle1 = group1.getElementsByTagName('circle')[0];
      let circle2 = group2.getElementsByTagName('circle')[0];

      console.assert(circle1 != null);

      // Starting position
      line.setAttribute('x1', circle1.getAttribute('cx'));
      line.setAttribute('y1', circle1.getAttribute('cy'));

      // Ending position
      line.setAttribute('x2', circle2.getAttribute('cx'));
      line.setAttribute('y2', circle2.getAttribute('cy'));

      svg.insertBefore(line, svg.childNodes[0]);
    });
  }

}
