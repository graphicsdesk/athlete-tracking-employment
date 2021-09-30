import 'babel-polyfill';
import graph from '../../data/athletes.json';
import * as d4 from 'd3';
import scrollama from 'scrollama';
import Stickyfill from 'stickyfill';

// Copy-pasta'd from ../../data/Tracking employment - just counts.csv
const counts =
  `industry,BASE,MBB,MXC/TF,MFENC,FB,MOLF,LROW,HROW,MOC,MSQU,MSWIM,MENNIS,WREST,ARCH,WBB,WFENC,FH,WOLF,LAX,WROW,WOCCER,SOFTBALL,WSQUA,WSWIM,WENNIS,WTF/XC,VB
Finance,14,4,11,2,27,3,14,11,10,9,9,9,11,4,5,3,6,1,9,5,4,3,3,8,4,6,5
Graduate School,2,0,4,4,6,0,3,3,1,1,1,1,2,2,3,1,3,0,4,5,3,2,0,4,0,7,0
Technology,0,1,2,0,4,1,0,3,2,1,6,0,2,0,0,0,0,1,0,0,3,0,0,0,1,3,3
Athletics,2,4,1,1,5,1,2,0,4,1,0,0,3,1,1,2,1,1,0,1,2,0,2,0,0,0,0
Building,1,0,1,0,7,0,0,2,1,0,0,0,6,0,0,0,0,0,0,0,1,0,0,0,0,0,0
Research,0,0,2,2,0,1,0,1,1,0,0,0,0,0,0,3,3,0,1,0,1,0,1,3,0,2,0
Media,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,3,0,2,1,1,1,0,0,2,0,2,0
Company,0,0,5,2,3,0,0,1,0,0,1,0,2,1,1,2,1,0,0,5,1,2,0,0,0,0,0
Nonprofit,0,0,0,0,2,0,1,1,0,0,0,0,0,1,0,1,1,0,0,1,0,0,0,1,0,2,0
Medical,0,0,0,0,3,0,1,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,0
Military,0,0,1,1,1,0,0,0,0,1,0,0,1,0,0,0,0,0,0,2,0,0,0,0,0,0,0
Engineering,0,0,0,0,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
Law,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,2,0
Government,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,4,0
blank,2,1,2,1,5,1,0,2,1,0,0,0,0,0,0,0,0,0,2,0,0,0,1,0,0,1,0`
    .split('\n')
    .slice(1)
    .map(s => s.split(','));

graph.links = graph.links.map(({ source, target, value }) => ({
  source,
  target,
  value: +counts.filter(c => c[0] === graph.nodes[target].name)[0][source + 1],
  percent: value,
}));

//===========================================================================//
//append the svg object to the body of the page
//just sets up your canvas
const div = d4.select('.my_dataviz');
var svg = div.append('svg').append('g');

//add links to diagram
var link = svg
  .append('g')
  .selectAll('.link')
  .data(graph.links)
  .enter()
  .append('path')
  .attr('class', 'link');

//add in the nodes
var node = svg
  .append('g')
  .selectAll('.node')
  .data(graph.nodes)
  .enter()
  .append('g')
  .attr('class', 'node');

//make the node rectangles
node.append('rect');

//add in the title for the nodes - this is just CSS styling
node
  .append('text')
  .attr('class', 'mels-text')
  .attr('dy', '.35em')
  .attr('transform', null)
  .text(function (d) {
    return d.name;
  });

function handleResizeSankeyCharlotte() {
  //dimensions & margins of the graph
  const margin = { top: 70, right: 100, bottom: 50, left: 200 };

  const isMobile = Math.min(960, document.body.clientWidth) < 460;
  if (isMobile) {
    margin.left = margin.right = 20;
    margin.top = 110;
    margin.bottom = 10;
  }

  const width =
    Math.min(960, document.body.clientWidth) - margin.left - margin.right;
  const height = Math.min(800, window.innerHeight) - margin.top - margin.bottom;
  console.log(width, height);

  div.style('height', height + margin.top + margin.bottom + 'px');
  div
    .select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);
  svg.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var sankey = d3.sankey().nodeWidth(15).nodePadding(10).size([width, height]);
  console.log(sankey);
  sankey.nodes(graph.nodes).links(graph.links).layout(32);
  link
    .attr('d', sankey.link())
    .style('stroke-width', function (d) {
      return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
      return b.dy - a.dy;
    });

  node.attr('transform', function (d) {
    return 'translate(' + d.x + ',' + d.y + ')';
  });

  //make the node rectangles
  node
    .select('rect')
    .attr('x', d => d.x0)
    .attr('y', d => d.y0)
    .attr('height', function (d) {
      return d.dy;
    })
    .attr('width', sankey.nodeWidth());
  //     .style("fill", function (d) { return d.color = color(d.name.replace(/.*/, "")); });
  //.style("stroke", function (d) { return d4.rgb(d.color).darker(2); });

  //add in the title for the nodes - this is just CSS styling
  const rightX = isMobile ? -6 : 20; // x-position for labels on the right
  const leftX = 6 + (isMobile ? 1 : -1) * sankey.nodeWidth(); // x-position for labels on the right
  node
    .select('text')
    .attr('x', rightX)
    .attr('y', function (d) {
      return d.dy / 2;
    })
    .attr('text-anchor', isMobile ? 'end' : 'start')
    .filter(function (d) {
      return d.x < width / 2;
    })
    .attr('x', leftX)
    .attr('y', function (d) {
      return d.dy / 2 + 1;
    })
    .attr('text-anchor', isMobile ? 'start' : 'end');

  node
    .selectAll('text')
    .filter(d => d.node == 2 || d.node == 25 || d.node == 28)
    .html(d => {
      let list = d.name.split(' ');
      let span1 = [];
      let span2 = [];
      for (let i = 0; i < list.length; i++) {
        if (i < list.length / 2) {
          span1.push(list[i]);
        } else {
          span2.push(list[i]);
        }
      }
      span1 = span1.join(' ');
      span2 = span2.join(' ');
      return `<tspan dy="-0.2em">${span1}</tspan><tspan x="${
        d.x < width / 2 ? leftX : rightX
      }" dy="1em">${span2}</tspan>`;
    });
}

handleResizeSankeyCharlotte();
window.addEventListener('resize', handleResizeSankeyCharlotte);

var main = d4.select('main');
var scroll = main.select('#scroll');
var diagram = scroll.select('.my_dataviz');
var article = scroll.select('article');
var step = article.selectAll('.step');

//initialize scrollama
var scroller = scrollama();

//resize that window
function handleResize() {
  //update height of steps
  var stepHeight = Math.floor(window.innerHeight * 0.75);
  step.style('height', stepHeight + 'px');

  var diagramHeight = window.innerHeight / 2;
  var diagramMarginTop = (window.innerHeight - diagramHeight) / 6;

  diagram
    .style('height', diagramHeight + 'px')
    .style('top', diagramMarginTop + 'px');

  //update new element dimensions
  scroller.resize();
}

//event handler
function handleStepEnter(response) {
  svg.select('g').selectAll('.change').attr('class', 'link');

  //adds color to the current step / text container
  step.classed('is-active', function (d, i) {
    return i === response.index;
  });

  //highlights all finance
  if (response.index == 0) {
    svg
      .select('g')
      .selectAll('.link')
      .attr('class', d => {
        if (d.target.node == 27) return 'change';
        return 'link';
      });
  }

  //highlight the 7 teams
  if (response.index == 1) {
    svg
      .select('g')
      .selectAll('.link')
      .attr('class', d => {
        if (
          (d.source.node == 0 ||
            d.source.node == 6 ||
            d.source.node == 9 ||
            d.source.node == 11 ||
            d.source.node == 24 ||
            d.source.node == 17 ||
            d.source.node == 26) &&
          d.target.node == 27
        )
          return 'change';
        return 'link';
      });
  }

  //highlights the men's tennis team
  if (response.index == 2) {
    svg
      .select('g')
      .selectAll('.link')
      .attr('class', d => {
        if (d.source.node == 11 && (d.target.node == 27 || d.target.node == 28))
          return 'change';
        return 'link';
      });
  }

  //highlights the athletics target
  if (response.index == 3) {
    svg
      .select('g')
      .selectAll('.link')
      .attr('class', d => {
        if (d.target.node == 30) return 'change';
        return 'link';
      });
  }
}

function handleStepExit(response) {}

function stepupStickyfill() {
  d4.selectAll('.sticky').each(function () {
    Stickyfill.add(this);
  });
}

function init() {
  stepupStickyfill();

  handleResize();

  scroller
    .setup({
      step: '#scroll article .step',
      offset: document.body.clientWidth < 459 ? 0.8 : 0.5,
      debug: false,
    })
    .onStepEnter(handleStepEnter)
    .onStepExit(handleStepExit);

  window.addEventListener('resize', handleResize);
}

//light em up
init();
