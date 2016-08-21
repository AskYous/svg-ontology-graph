class Vertex {
    private _id: number;
    private text: string;
    private isDragging: boolean;
    private radius: number;
    private svgGroup: SVGGElement;
    private ns: string;
    private svg: SVGGElement;
    private displayed: boolean;

    private circleElement: SVGCircleElement;
    private textElement: SVGTextElement;

    constructor(id: number, text: string, svg: SVGGElement) {
        this._id = id;
        this.text = text;
        this.svg = svg;

        this.radius = 30;
        this.isDragging = false;
        this.ns = 'http://www.w3.org/2000/svg';
        this.svgGroup = <SVGGElement>document.createElementNS(this.ns, 'g');
        this.displayed = false;

    }

    /**
     * Adds the vertex to the SVG Graph
     */
    public display(svg: SVGGElement) {

        // Some math
        let svgPadding = 40;
        let svgWidth = svg.scrollWidth - (svgPadding * 2);
        let svgHeight = svg.scrollHeight - (svgPadding * 2);
        this.radius = svgHeight / 20;

        let x = Math.random() * svgWidth;
        let y = Math.random() * svgHeight;

        // Circle
        this.circleElement = SVGCircleElement = document.createElementNS(this.ns, 'circle') as any;
        this.circleElement.setAttribute('cx', x.toString());
        this.circleElement.setAttribute('cy', y.toString());
        this.circleElement.setAttribute('r', this.radius.toString());
        this.svgGroup.appendChild(this.circleElement);

        // Text
        this.textElement = document.createElementNS(this.ns, 'text') as any;
        this.textElement.innerHTML = this.text;
        this.textElement.setAttribute('text-anchor', 'middle');
        this.textElement.setAttribute('x', this.circleElement.cx.animVal.value.toString());
        this.textElement.setAttribute('y', (this.circleElement.cy.animVal.value + this.circleElement.r.animVal.value + 20).toString());
        this.svgGroup.appendChild(this.textElement);

        // Drag and drop
        {
          let mouseY: number;
          let mouseX: number;
          let onDrag: number;

          document.onmousemove = event => {
            mouseX = event.clientX;
            mouseY = event.clientY;
          }

          this.circleElement.onmousedown = mousedownevent => {
            this.isDragging = true;
          }

          this.circleElement.onmousemove = event => {
            if(this.isDragging){
              let x = event.clientX - (2 * this.radius);
              let y = event.clientY - (2 * this.radius);
              this.circleElement.setAttribute('cx', x.toString());
              this.circleElement.setAttribute('cy', y.toString());
            }
          }

          this.circleElement.onmouseup = () => {
            this.isDragging = false;
          }

          this.circleElement.onmouseout = () => {
            // this.isDragging = false;
          }
        }

        // Display it
        this.svg.appendChild(this.svgGroup);

        this.displayed = true;

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
