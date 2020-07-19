var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var poverty = "poverty";
var healthcare = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(bureauData, poverty) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(bureauData, d => d[poverty]) * 0.9,
      d3.max(bureauData, d => d[poverty]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(bureauData, healthcare) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(bureauData, d => d[healthcare]) * 0.7,
        d3.max(bureauData, d => d[healthcare]) * 1.3
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}
  

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, poverty, newYScale, healthcare) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[poverty]))
    .attr("cy", d => newYScale(d[healthcare]));
    

  return circlesGroup;
}

function renderCirclesTextGroup(circlesTextGroup, newXScale, poverty, newYScale, healthcare) {
    circlesTextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[poverty]))
      .attr("y", d => newYScale(d[healthcare]))
    
    return circlesTextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(poverty, healthcare, circlesGroup) {

  if (poverty === "poverty") {
    var xlabel_prefix = "";
    var xlabel = "Poverty";
    var xlabel_suffix = "%";
  }
  else if (poverty === "age") {
    var xlabel_prefix = "";
    var xlabel = " age";
    var xlabel_suffix = "";
  } 
  

  if (healthcare === "healthcare") {
    var ylabel = " healthcare";
    var ylabel_suffix = "%";
  }
  else if (healthcare === "smokes") {
    var ylabel = "Smoking";
    var ylabel_suffix = "%";
  } 
 

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${xlabel_prefix}${d[poverty]}${xlabel_suffix}<br>${ylabel}: ${d[healthcare]}${ylabel_suffix}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function(data) {
      toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(bureauData) {
  //if (err) throw err;

  // parse data
  bureauData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
  });
  

  // xLinearScale function above csv import
  var xLinearScale = xScale(bureauData, poverty);

  // Create y scale function
  var yLinearScale = yScale(bureauData, healthcare);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(bureauData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[poverty]))
    .attr("cy", d => yLinearScale(d[healthcare]))
    .attr("r", "20")
    .classed("stateCircle", true);

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(poverty, healthcare, circlesGroup);

  // adding state abbreviation labels
  var circlesTextGroup = chartGroup.append("text").classed("stateText",true)
    .selectAll("tspan")
    .data(bureauData)
    .enter()
    .append("tspan")
    .attr("x", d => xLinearScale(d[poverty]))
    .attr("y", d => yLinearScale(d[healthcare]))
    .text(d => d.abbr);

  // Create group for  3 x-axis labels, and 3 y-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top})`);
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, 0)`);


  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("aText", true)
    .classed("active", true)
    .text(" Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("aText", true)
    .classed("inactive", true)
    .text("Age");



  // append y axis
  var healthLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("aText", true)
    .classed("active", true)
    .text("Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 20)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokers (%)");

  
  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== poverty) {

        // replaces chosenXaxis with value
        poverty = value;

        // console.log(poverty)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(bureauData, poverty);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, poverty, yLinearScale, healthcare);
        circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, poverty, yLinearScale, healthcare);

        // updates tooltips with new info
        circlesGroup = updateToolTip(poverty, healthcare, circlesGroup);

        // changes classes to change bold text
        if (poverty === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        
        }
        else if (poverty === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
     
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
        
        }
      }
    });

  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== healthcare) {

        // replaces chosenXaxis with value
        healthcare = value;

        //console.log(healthcare)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(bureauData, healthcare);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, poverty, yLinearScale, healthcare);
        circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, poverty, yLinearScale, healthcare);

        // updates tooltips with new info
        circlesGroup = updateToolTip(poverty, healthcare, circlesGroup);

        // changes classes to change bold text
        if (healthcare === "healthcare") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          
        }
        else if (healthcare === "smokes") {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
         
        }
        else {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
         
        }
      }
    });
});
