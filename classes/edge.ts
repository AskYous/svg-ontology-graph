class Edge {
  constructor(private _vertex1: Vertex, private _vertex2: Vertex){ }

  public get vertex1() { return this._vertex1; }
  public get vertex2() { return this._vertex2; }
}
