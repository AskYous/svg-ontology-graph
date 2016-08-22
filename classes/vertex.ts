class Vertex {
    private _id: number;
    private text: string;
    private isDragging: boolean;
    private radius: number;
    private svgGroup: SVGGElement;
    private ns: string;
    private svg: SVGGElement;
    private displayed: boolean;
    private parents: Vertex[];

    private circleElement: SVGCircleElement;
    private textElement: SVGTextElement;

    constructor(id: number) {

        // Normal assigning
        this._id = id;
        // this.svg = svg;

        // Set initial values
        this.radius = 30;
        this.isDragging = false;
        this.ns = 'http://www.w3.org/2000/svg';
        this.svgGroup = <SVGGElement>document.createElementNS(this.ns, 'g');
        this.displayed = false;

    }

    public bringToTop(): void {
      this.svg.removeChild(this.svgGroup);
      this.svg.appendChild(this.svgGroup);
    }

    public lineTo(otherVertex: Vertex) {

        if(!this.displayed || !otherVertex.displayed) throw 'Vertex must displayed before attempting to draw a line.';

        let line = <SVGLineElement>document.createElementNS(this.ns, 'line');

        // Starting position
        line.setAttribute('x1', this.circleElement.cx.animVal.value.toString());
        line.setAttribute('y1', this.circleElement.cy.animVal.value.toString());

        // Ending position
        line.setAttribute('x2', otherVertex.circleElement.cx.animVal.value.toString());
        line.setAttribute('y2', otherVertex.circleElement.cy.animVal.value.toString());

        this.svg.insertBefore(line, svg.childNodes[0]);
    }

    public get id(): number {
        return this._id;
    }

}
