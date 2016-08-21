let svg = document.getElementsByTagName('svg')[0];

$.getJSON('sample-data/people.json', people => {

  people.forEach(person => {

    // Circle
    let circle = <SVGCircleElement> document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', (Math.random() * svg.scrollWidth).toString());
    circle.setAttribute('cy', (Math.random() * svg.scrollHeight).toString());
    circle.setAttribute('r', "10");
    svg.appendChild(circle);

    // Text
    let text = <SVGTextElement> document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.innerHTML = person;
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('x', circle.cx.animVal.value.toString());
    text.setAttribute('y', (circle.cy.animVal.value + circle.r.animVal.value + 20).toString());
    svg.appendChild(text);

  });


});
