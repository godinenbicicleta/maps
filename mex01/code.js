//const points = [[0, 0], [0, 1], [1, 0], [1, 1]];
//const delaunay = d3.Delaunay.from(points);
//const voronoi = delaunay.voronoi([0, 0, 960, 500]);



var map = new L.Map("map").setView([23.1,-100.1],5)
  .addLayer(new L.TileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      {attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom:18}
		));
L.svg({clickable:true}).addTo(map);


var svg = d3.select("#map").select("svg").attr("pointer-events", "auto")
  g = svg.append("g"),
  g2 = svg.append("g");

var transform = d3.geoTransform({point: projectPoint}),
  path = d3.geoPath().projection(transform);


d3.csv("edos_ptos.csv").then(voros);
d3.json("mxstates-topo-simplify.json").then(main);

function main(states){
  var data = topojson.feature(states,states.objects.mxstates);
  console.log(data);
  drawFeatures(data);
  }


function projectPoint(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
}

function drawFeatures(data){
  
  var displayW = document.getElementById("vis-container").clientWidth,
    displayH = document.getElementById("vis-container").clientHeight;

	var driv = d3.select("#vis-container")
    .append("div")
    .attr("class","tooltip")
    .style("opacity", 0);

	var tooltip = d3.select("body")
    .append("div")
    .attr("class","tooltip");
  
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

  var featureElement = g.selectAll("path")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class","states")
    .on("click",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip);

    map.on("moveend", update);

    update();

    function update(){
      //update polygons
      featureElement.attr("d", path).style("fill-opacity", 0.7);

      }
}


function voros(data){
  geoData = toGeoJson(data);

  var featureElement = g2.selectAll("path")
    .data(geoData.features)
    .enter()
    .append("path")
    .attr("class","voronoi")

    map.on("moveend", update);

    update();
    
    d3.select("#bikes").on("change", update);

    function update(){
      //update polygons
      featureElement.attr("d", path).style("fill-opacity", 0.7).style("stroke","none");
      
      //if box checked, change polygons style
      if(d3.select("#bikes").property("checked")){
        featureElement.style("stroke","black" );

        }
    }


}

function toGeoJson(data){
  let geoms = [];
  let points = [];
  for(let p of data){
    points.push([p.x,p.y]);
    }
  delaunay = d3.Delaunay.from(points);
  //-118.365114353651 14.5320983701145,-86.7104052798835 32.7186535707393
  voronoi = delaunay.voronoi([-120,12,-80,35]);
  polis = []
  for ( let i of voronoi.cellPolygons()){
    polis.push(i);
    }

  for(let [i,d] of data.entries()){
    geoms.push(
    {type:'Feature', properties:{CVE_ENT:d.cve_ent},
    geometry:{type:"Polygon", coordinates:[polis[i]]}
    }
    );
    }
  
  return {type:"FeatureCollection", features:geoms};
  }
