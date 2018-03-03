module.exports = {
    vertices: [
        { id: 0, data: { name: "Alice" } },
        { id: 1, data: { name: "Bob" } },
        { id: 2, data: { name: "Trudy" } },
        { id: 3, data: { name: "Eve" } },
    ],
    edges: [
        [0, 2],
        [1, 3],
        [3, 0],
    ]
}