/// <reference path="./declarations/person.d.ts"/>

let svg: SVGGElement = document.getElementsByTagName('svg')[0] as any;

let people: Array<Person>;
let relations: Array<Array<number>>;

// Get People
$.getJSON('sample-data/people.json', peopleResults => {
    $.getJSON('sample-data/relations.json', relationsResults => {
        people = peopleResults;
        relations = relationsResults;
        begin(); // Go!
    });
});

function begin() {
  let vertices = new Array<Vertex>();

  // Display in SVG
  people.forEach((person, i) => {
      let vertex = new Vertex(person.id, person.name, svg);
      vertices.push(vertex);
      vertex.display(svg);
  });

  relations.forEach(relation => {
      let studentId = <number>relation[0];
      let teacherId = <number>relation[1];

      let studentVertex = vertices.filter(v => v.id == studentId)[0];
      let teacherVertex = vertices.filter(v => v.id == teacherId)[0];

      studentVertex.lineTo(teacherVertex);
  });
}
