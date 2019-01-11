//const points = [[0, 0], [0, 1], [1, 0], [1, 1]];
//const delaunay = d3.Delaunay.from(points);
//const voronoi = delaunay.voronoi([0, 0, 960, 500]);


var map = new L.Map("map").setView([23.1,-100.1],5)
    .addLayer(new L.TileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
{attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
 maxZoom:18}
		));

var svg = d3.select(map.getPanes().overlayPane).append("svg").attr("class","map-svg"),
    g = svg.append("g").attr("class", "leaflet-zoom-hide");

d3.json("mxstates-topo-simplify.json").then( (states) => {
  //

var geoData = topojson.feature(states,states.objects.mxstates);

	//

var displayW = document.getElementById("vis-container").clientWidth;
var displayH = document.getElementById("vis-container").clientHeight;

console.log(displayW);
console.log(displayH);

  var transform = d3.geoTransform({point: projectPoint}),
      path = d3.geoPath().projection(transform);


	var driv = d3.select("#vis-container").append("div").attr("class","tooltip").style("opacity", 0);
	var tooltip = d3.select("body").append("div").attr("class","tooltip");
  //Position of the tooltip relative to the cursor
var tooltipOffset = {x: 5, y: -25};
//Move the tooltip to track the mouse
function moveTooltip() {
tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
      .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
}
//Create a tooltip, hidden at the start
function hideTooltip() {
  tooltip.transition().duration(200)
	.style("display","none");
}

function showTooltip(d) {
  moveTooltip();
  tooltip.style("color","black")
	  .transition()
		.duration(500)
		.text(d.properties.NOM_ENT)
		.style("display","flex");
}

  var feature = g.selectAll("path")
      .data(geoData.features)
      .enter().append("path")
      .on("click",showTooltip)
      .on("mousemove",moveTooltip)
      .on("mouseout",hideTooltip);

			
			

  map.on("viewreset", reset);
  reset();

  // Reposition the SVG to cover the features.
  function reset() {
		var bounds = path.bounds(geoData);
    var topLeft = bounds[0],
        bottomRight = bounds[1];

    svg.attr("width", bottomRight[0] - topLeft[0])
        .attr("height", bottomRight[1] - topLeft[1])
        .style("left", topLeft[0] + "px")
        .style("top", topLeft[1] + "px");

    g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

    feature.attr("d", path)
		    .style("fill-opacity", 0.7);

}



  // Use Leaflet to implement a D3 geometric transformation.
  function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
  }
});

