d3.select("#bikes").on("change", update);

function update(){
    if(d3.select("#bikes").property("checked")){
      console.log("ischecked");
      }
    else{
      console.log("unchecked");
      }
}


