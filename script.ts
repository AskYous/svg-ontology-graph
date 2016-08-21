let svg = document.getElementsByTagName('svg')[0];
let ns = 'http://www.w3.org/2000/svg';

$.getJSON('sample-data/people.json', people => {

  // Display in SVG
  people.forEach((person, i) => {

    // Group
    let g = <SVGGElement> document.createElementNS(ns, 'g');
    g.id = person.id;

    // Circle
    let circle = <SVGCircleElement> document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', ((Math.random() * (svg.scrollWidth - 60)) + 30).toString());
    circle.setAttribute('cy', ((Math.random() * (svg.scrollHeight - 60)) + 30).toString());
    circle.setAttribute('r', "30");
    g.appendChild(circle);

    // Text
    let text = <SVGTextElement> document.createElementNS(ns, 'text');
    text.innerHTML = person.name;
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('x', circle.cx.animVal.value.toString());
    text.setAttribute('y', (circle.cy.animVal.value + circle.r.animVal.value + 20).toString());
    g.appendChild(text);

    svg.appendChild(g);

  });

  $.getJSON('sample-data/relations.json', relations => {
    relations.forEach(relation => {
        let studentId = <number> relation[0];
        let teacherId = <number> relation[1];

        let studentGroup: SVGGElement =  document.getElementById(studentId.toString()) as any;
        let teacherGroup: SVGGElement =  document.getElementById(teacherId.toString()) as any;

        let studentCircle: SVGCircleElement = studentGroup.getElementsByTagNameNS(ns, 'circle')[0] as any;
        let teacherCircle: SVGCircleElement = teacherGroup.getElementsByTagNameNS(ns, 'circle')[0] as any;

        let line = <SVGLineElement> document.createElementNS(ns, 'line');

        // Starting position
        line.setAttribute('x1', studentCircle.cx.animVal.value.toString());
        line.setAttribute('y1', studentCircle.cy.animVal.value.toString());

        // Ending position
        line.setAttribute('x2', teacherCircle.cx.animVal.value.toString());
        line.setAttribute('y2', teacherCircle.cy.animVal.value.toString());

        // Other properties

        svg.insertBefore(line, svg.childNodes[0]);
    });
  });

});
