class DiGraph {
  constructor(private _vertices: Vertex[], private _edges: Edge[]){ }

  public get vertices(){
    return this._vertices;
  }

  public get edges(){
    return this._edges;
  }
}
