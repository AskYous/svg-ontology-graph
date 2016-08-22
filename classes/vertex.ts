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

    public get id(): number {
        return this._id;
    }

}
