let data = ['red', 'blue'];

d3.selectAll('.item')
    .data(data)
    .style('background', d => {
      return d;
    });
