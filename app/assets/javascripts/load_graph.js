function getCommits(repository_name){
  var startDate = $( "#startdate" ).val();
  var endDate = $( "#enddate" ).val();
  var url = "/repositories/" + repository_name + "/get_commits";
  $.ajax({
    url: url,
    type:'GET',
    dataType: 'json',
    data:{
      startDate: startDate,
      endDate: endDate
    },
    success: function(data){
      console.log(data);
      // var dateArray = [];

      // data.forEach(function(item){
      //   dateArray.push(item["commit"]["author"]["date"]);
      // });
      getCommitData(data, repository_name, loadGraph)
      // loadGraph(dateArray, repository_name);
    },
    error: function(jqXHR, status, error){
      console.log("in error");
    },
    complete:function(data){
      // console.log("complete", data);
    }
  });
}

function clearCanvas(){
  $("#chart").empty(); // clear out chart children
  d3.selectAll("svg").remove(); // clear out chart
}

function getCommitData(data, repository_name, callback){
  clearCanvas();
  var dateArray = [];

  for (var i = 0, len = data.length; i < len; i++) {
    console.log("data array", data.length);
    console.log("data array element", data[0]);
    dateArray.push(data[i]["commit"]["author"]["date"]);
  }
  // data.forEach(function(item){
  //   dateArray.push(item["commit"]["author"]["date"]);
  // });
  callback(dateArray, repository_name);
}
function loadGraph(commitHistory, repositoryName){
  // callback function to show languages
  function showCommitHistory(data, status,repo){
    //   data = data.split(",").map(function(e) {
    //   var date = new Date(e)
    //   var date = date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear()
    //   return date;
    // });
    data = data.map(function(e) {
      var date = new Date(e)
      var date = date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear()
      return date;
    });
    var occurrences = { };
    for (var i = 0, j = data.length; i < j; i++) {
      occurrences[data[i]] = (occurrences[data[i]] || 0) + 1;
    }
    console.log("occurrences", occurrences);
    data = occurrences;
    // setup empty dataset array variable for d3
    var dataset = [];

    // loop through data object and append items to li
    for (var key in data) {
      if (data.hasOwnProperty(key)) { // ensure it is key from data, not prototype being used

        // code to display language counts as list - not used at moment
        // $("#langDetails").append("<li>" + key + ": " + data[key] + "</li>");

        // push items into dataset array
        var item = new Object();
        item.key = key;
        item.value = data[key];
        dataset.push(item);
      };
    };
    console.log(dataset); // for checking

    // update the d3 chart

    // update the x scale
    xScale.domain(dataset.map(function (d) {return d.key; }))
      .rangeRoundBands([margin.left, w], 0.05);

    // update the y scale
    yScale.domain([0, d3.max(dataset, function(d) {return d.value; })])
      .range([h,margin.top]);

    // update the x axis
    xAxis.scale(xScale).orient("bottom");

    // update the y axis
    yAxis.scale(yScale).orient("left");

    //Create bars and labels
    bars = svg.selectAll("rect").data(dataset);
    barLabels = svg.selectAll("text").data(dataset);

    // add new bars
    bars.enter()
      .append("rect")
      .attr("x", function(d, i) {
        return xScale(d.key);
      })
      .attr("y", function(d) {
        return yScale(d.value);
      })
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) {
        return h - yScale(d.value);
      })
      .attr("fill", "steelblue");

    // remove bars as necessary
    bars.exit()
      .transition()
      .duration(500)
      .attr("x", w)
      .remove();

    // update the bars
    bars.transition()
      .duration(750)
      .attr("x", function(d,i) {
        return xScale(d.key);
      })
      .attr("y", function(d) {
        return yScale(d.value);
      })
      .attr("width", xScale.rangeBand())
      .attr("height", function(d) {
        return h - yScale(d.value);
      });

    // update the x axis
    svg.select(".xaxis")
      .transition()
      .duration(750)
      .call(xAxis);

    // update the y axis
    svg.select(".yaxis")
      .transition()
      .duration(750)
      .call(yAxis);

    // update the title
    svg.select(".chartTitle")
      .text(repo);

    // add tooltip
    bars.on("mouseover",function(d){

      // add blank tooltip
      svg.append("text")
        .attr("id","tooltip");

      // get the x and y coords
      var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.rangeBand()/2;
      var yPosition = parseFloat(d3.select(this).attr("y")) + 18;

      // add the tooltip
      svg.select("#tooltip")
        .attr("x",xPosition)
        .attr("y",function(){
          // if value is less than 10% of max, show tooltip above bar
          var mx = d3.max(dataset, function(d) {return d.value; });
          if (d.value < 0.1 * mx) {
            return yPosition - 22;
          } else {
            return yPosition;
          };
        })
        .attr("text-anchor","middle")
        .attr("fill",function(){
          // if value is less than 10% of max, make tooltip black
          var mx = d3.max(dataset, function(d) {return d.value; });
          if (d.value < 0.1 * mx) {
            return "black";
          } else {
            return "white";
          };
        })
        .attr("font-family","sans-serif")
        .attr("font-size","12px")
        .text(d.value);

    })
    .on("mouseout",function(){
      d3.select("#tooltip").remove();
    });

  }; // end of the showLangs function


  // setup for the d3 chart
  // basic SVG setup
  var dataset = [];
  var margin = {top: 70, right: 20, bottom: 60, left: 100};
  var w = 1000 - margin.left - margin.right;
  var h = 500 - margin.top - margin.bottom;

  //Create SVG element
  var svg = d3.select("div#chart")
    .append("svg")
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom);

  // define the x scale
  var xScale = d3.scale.ordinal()
    .domain(dataset.map(function (d) {return d.key; }))
    .rangeRoundBands([margin.left, w], 0.05);

  // define the x axis
  var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

  // define the y scale
  var yScale = d3.scale.linear()
    .domain([0, d3.max(dataset, function(d) {return d.value; })])
    .range([h,margin.top]);

  // define the y axis
  var yAxis = d3.svg.axis().scale(yScale).orient("left");

  // draw the x axis
  svg.append("g")
    .attr("class", "xaxis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis);

  // draw the y axis
  svg.append("g")
    .attr("class", "yaxis")
    .attr("transform","translate(" + margin.left + ",0)")
    .call(yAxis);

  // add the x axis label
  svg.append("text")
    .attr("class", "x axis label")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + (w / 2) + "," + (h + (margin.bottom / 2) + 10) + ")")
    .text("Date");

  // add the y axis label
  svg.append("text")
    .attr("class", "y axis label")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(15," + (h / 2) + ")rotate(-90)")
    .text("Number of commits");


  // add a title to the chart
  svg.append("text")
    .attr("class", "chartTitle")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + (w / 2) + ",20)")
    .text("GitHub Repo");
    if(commitHistory !== ""){
      showCommitHistory(commitHistory, "success", repositoryName);
    }
}
