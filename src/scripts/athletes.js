import graph from '../../data/athletes.json';

//dimensions & margins of the graph
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 960 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

//append the svg object to the body of the page
//just sets up your canvas
var svg = d3.select("#my_dataviz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//color scale
var color = d3.scaleOrdinal(d3.schemeCategory40);

//sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(15)
    .nodePadding(10)
    .size([width, height]);

//make a new sankey generator with default
sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32); //what happens if I change layout???

//add links to diagram
var link = svg.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link())

    .style("stroke-width", function (d) { return Math.max(1, d.dy); })
    .sort(function (a, b) { return b.dy - a.dy; });

//add in the nodes
var node = svg.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.drag()
        .subject(function (d) { return d; })
        .on("start", function () { this.parentNode.appendChild(this); })
        .on("drag", dragmove));

//make the node rectangles
node
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", function (d) { return d.dy })
    .attr("width", sankey.nodeWidth())
    .style("fill", "#1E90FF");
//     .style("fill", function (d) { return d.color = color(d.name.replace(/.*/, "")); });
//.style("stroke", function (d) { return d3.rgb(d.color).darker(2); });

//add in the title for the nodes - this is just CSS styling
node
    .append("text")
    .attr("x", -6)
    .attr("y", function (d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("font-family", "sans-serif")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) { return d.name; })
    .filter(function (d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");



//dragmove - for moving the nodes
function dragmove(d) {
    d3.select(this)
        .attr("transform",
            "translate("
            + d.x + ","
            + (d.y = Math.max(
                0, Math.min(height - d.dy, d3.event.y)
            )) + ")");
    sankey.relayout();
    link.attr("d", sankey.link());

}
