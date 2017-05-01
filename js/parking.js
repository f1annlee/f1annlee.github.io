var chart;
// set margin, height, and width
var margin = {top: 20, right: 20, bottom: 100, left: 100}, 
height = 550 - margin.top - margin.bottom;
width = 1100 - margin.left - margin.right;
// set x and y axes bounds and positions
var x = d3.scale.ordinal().rangeRoundBands([0,width], .05);
var y = d3.scale.linear().range([height, 0]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
var yAxis = d3.svg.axis()
    .outerTickSize(0)
    .scale(y)
    .orient("left")

// Gets called when the page is loaded.
function init(){
    // get initial data to display
    var yoption = getYSelectedOption()
    console.log(yoption);
    
    chart = d3.select('#vis')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
    
    d3.csv('data/parkingData.csv', function(error, rawdata) {
	rawdata.forEach(function(d) {
	    //d.sales = +d.sales
	    //d.profit = +d.profit
	    d.Amount = +d.Amount
	    d.PaidDuration = (+d.PaidDuration / 3600)
	});
	
	// aggregate the data to get the summation stats
	var data = d3.nest()
	.key(function(d) { return d['MeterCode'];})
	.rollup(function(d) {
	    return d3.sum(d, function(g) {return g[yoption]; });
	}).entries(rawdata);
	console.log(data)
	
	// set the x and y domains
	x.domain(data.map(function(d) { return d.key; }));
	y.domain([0, d3.max(data, function(d) {return d.values; })]);
	
	// append axes and labels
	chart.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis)
	    .selectAll("text")
	    .style("text-anchor", "end")
	    .attr("dx", "-.8em")
	    .attr("dy", "-.55em")
	    .attr("transform", "rotate(-90)" );

	chart.append("text")
	    .attr("class", "title")
	    .attr("text-anchor", "left")
	    .attr("x", width/2-200)
	    .attr("y", margin.top-30)
	    .style("font-size", 14)
	    .text("Parking Lot Weekly Usage Summary (01/02-01/07/2015)");
	
	chart.append("text")
	    .attr("class", "x label")
	    .attr("text-anchor", "end")
	    .attr("x", width/2)
	    .attr("y", height + margin.bottom-3)
	    .text('Meter Code');
	
	
	chart.append("g")
            .attr("class", "y axis")
            .call(yAxis)
	    .append("text")
	    .text(function() {
	    if (yoption=='Amount')
		return "Amount ($)";
	    else
		return "Duration (h)"});
	
	// append the bars
	chart.selectAll("bar")
	    .data(data)
	    .enter().append("rect")
	    .style("fill", function() {
		if (yoption=='Amount')
		    return "green";
		else
		    return "blue"})
	    .attr("x", function(d) { return x(d.key);})
	    .attr("width", x.rangeBand())
	    .attr("y", function(d) { return y(d.values);})
	    .attr("height", function(d) { return height - y(d.values); });
    });
}

//Called when the update button is clicked
function updateClicked(){
    d3.csv('data/parkingData.csv',update)
}

//Callback for when data is loaded
function update(rawdata){
    // get the updated option to display the corresponding data
    var yoption = getYSelectedOption()

    //PUT YOUR UPDATE CODE BELOW
    rawdata.forEach(function(d) {
	//d.sales = +d.sales
	//d.profit = +d.profit
	d.Amount = +d.Amount
	d.PaidDuration = (+d.PaidDuration /3600)
    })
    
    // aggregate data to get summation stats
    var data = d3.nest()
	.key(function(d) { return d['MeterCode'];})
	.rollup(function(d) {
	    return d3.sum(d, function(g) {return g[yoption]; });
	}).entries(rawdata);

    // set domains and x and y axes
    x.domain(data.map(function(d) { return d.key; }));
    y.domain([0, d3.max(data, function(d) {return d.values; })]);
    
    // remove existing x and y labels and append new ones
    chart.select("g.y.axis").remove();
    chart.select("g.x.axis").remove();
    chart.select("text.x.label").remove();
    chart.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + height + ")")
	.call(xAxis)
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", "-.55em")
	.attr("transform", "rotate(-90)" );
    
    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
	.append("text")
	.text(function() {
	    if (yoption=='Amount')
		return "Amount ($)";
	    else
		return "Duration (h)"});

    chart.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "end")
	.attr("x", width/2)
	.attr("y", height + margin.bottom-3)
	.text('Meter Code');
    
    // transition the bars to display new data
    var bar = chart.selectAll("rect")
        .data(data)
	.transition()
	.duration(700)
    	.style("fill", function() {
	    if (yoption=='Amount')
		return "green";
	    else
		return "blue"})
	.attr("x", function(d) { return x(d.key);})
	.attr("width", x.rangeBand())
	.attr("y", function(d) { return y(d.values);})
	.attr("height", function(d) { return height - y(d.values); });

}

// Returns the selected option in the X-axis dropdown. Use d[getXSelectedOption()] to retrieve value instead of d.getXSelectedOption()
function getXSelectedOption(){
  var node = d3.select('#xdropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}

// Returns the selected option in the X-axis dropdown. 
function getYSelectedOption(){
  var node = d3.select('#ydropdown').node();
  var i = node.selectedIndex;
  return node[i].value;
}
