$(function(){

risingTide = 0


var margin = {
    top:    0,
    bottom: 0,
    right:  50,
    left:   150
}

var width  = $(window).width()
var height = $(window).height() - 25
    
var i = 0
var duration = 1500

var tree = d3.layout.tree()
    .size([height, width])

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x] })

var svg = d3.select('body').append('svg')
    .attr('width', 50000)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var node1 = $('#one').text()
var node2 = $('#two').text()
var node3 = $('#three').text()

root = {
    'name': $('#init').text(),
    'children': []
}

if (node1.length > 0){root.children.push({'name': node1,   'children': []})}
if (node2.length > 0){root.children.push({'name': node2,   'children': []})}
if (node3.length > 0){root.children.push({'name': node3,   'children': []})}


root.x0 = height / 2
root.y0 = 0

function collapse(d) {
    if (d) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    }
}

root.children.forEach(collapse)
update(root)

d3.select(self.frameElement).style('height', '800px')


function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse()
  var links = tree.links(nodes)

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180 })

  // Update the nodes…
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) { return d.id || (d.id = ++i) })

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {return 'translate(' + source.y0 + ',' + source.x0 + ')' })
      .on('click', click)

    nodeEnter.append('circle')
        .attr('r', 1e-6)
        .attr('class', 'closed')
        .style('fill', function(d) { return d._children ? 'cyan' : '#fff' })

    nodeEnter.append('text')
        .attr('x', function(d) { return d.children || d._children ? -10 : 10 })
        .attr('dy', '.35em')
        .attr('text-anchor', function(d){return d.children || d._children ? 'end' : 'start' })
        .text(function(d) { return d.name })
        .style('fill-opacity', 1e-6)

  // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')' })

    nodeUpdate.select('circle')
        .attr('r', 6)
        .attr('class', function(d) { 
            if (d.depth < risingTide) {
                return ''
            }
            if (d._children) {
                return 'closed'
            }
        })
        .style('fill', function(d) { return d._children ? 'cyan' : '#fff' })

    nodeUpdate.select('text')
        .style('fill-opacity', 1)

  // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', function(d) { return 'translate(' + source.y + ',' + source.x + ')' })
        .remove()

    nodeExit.select('circle')
        .attr('r', 1e-6)

    nodeExit.select('text')
        .style('fill-opacity', 1e-6)

  // Update the links…
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.target.id })

  // Enter any new links at the parent's previous position.
    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function(d) {
            var o = {x: source.x0, y: source.y0}
            return diagonal({source: o, target: o})
        })

  // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr('d', diagonal)

  // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x
        d.y0 = d.y
    })
}


function click(d) {
    risingTide += 0.2
    if (!d.children) {
        $.ajax({
            url: '/all',
            method: 'post',
            data: {
                article: d.name
            },
            success: function(data){
                d.children = d._children
                if (data['error'] == false) {
                    var limit = 0.5 + Math.random()
                    for (var i = 0; i < data.list.length && i < limit; i++) {
                        d.children.push({
                            name: data.list[i], 
                            _children: []
                        })
                    }
                }
                d._children = null
                update(d)
            }
        })
    }
}

jQuery.fn.d3Click = function () {
  this.each(function (i, e) {
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

    e.dispatchEvent(evt);
  });
};


$('html,body').animate({scrollLeft: 0});


var count = 0
setInterval(function(){
    if (count < 150){
        var circleList = $("circle.closed")
        var number = Math.floor(Math.random() * circleList.length)
        while (number == 0){
            number = Math.floor(Math.random() * circleList.length)
        }
        var circle = $(circleList[number])
        circle.d3Click()
        $('html,body').animate({scrollLeft: circle.offset().left - (width / 2)});
        count++
    }
}, 2200)



})