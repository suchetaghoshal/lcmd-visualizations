$(function() {
	$(':checkbox').change(function(){
		$this = $(this);
		var parameter = $this.attr('id');
		if(this.checked){
			
			filterdata($this.val());
			//langCount(data);

			filtershow($this.attr('id'),$this.closest('label').text());
			filterLabel();
			$(':checkbox').each(function(){
				if($(this).attr('id') != parameter)
					$(this).val($(this).val() + ' ' + parameter);
			})
		}
		else{

			var q = $this.val().replace($this.attr('id'),'');
			if(q[0] == ' '){
				q = $this.val().replace($this.attr('id') + ' ','');
			}

			filterdata(q);
			//langCount(data);
			
			$(':checkbox').each(function(){
				if($(this).attr('id') != parameter)
					$(this).val($(this).val().replace(' '+parameter,''));
			})

			$('#filtershow').find('#' + parameter).parent().remove();
			filterLabel();
		}
	});

	//For remove the filter binding click event
	$('#filtershow').on('click','.closeFilter',function(){
		$this = $(this);
		var parameter = $this.attr('id');
		//uncheck the checkbox
		$(':checkbox').each(function(){
			if($(this).attr('id') == parameter){
				$(this).prop('checked', false);	
				var q = $(this).val().replace(parameter,'');
				if(q[0] == ' '){
					q = $(this).val().replace(parameter + ' ','');
				}
				filterdata(q);
				//langCount(data);
			}
			else
				$(this).val($(this).val().replace(' '+parameter,''));		
		})

		$this.parent().fadeIn().remove();
		filterLabel();
	})
})

//AJAX call for data fetching
function filterdata(value){
	$.ajax({
		url : 'http://tools.wmflabs.org/lcm-dashboard/lcmd/api/php/dataapi.php',
		dataType : 'JSONP',
		data : 'query=' + value,
		type : 'GET',
		async : 'false',
		success : function(data){
			langCount(data);
		},
		error : function(data){
			$('#langcount').html('<h3 class="text-info">' + (data.length)+ ' Languages </h3>');
			//display_lang(data);
		}
	})
}

//Filter show as a tab
function filtershow(id,text){
	var filter = '<div class="alert fade in span3">' +
			'<button type="button" class="close closeFilter" data-dismiss="alert" id = "'+ id+'" >&times;</button> ' +
			'<strong>'+ text +'</strong>' +
			'</div>';
	$('#filtershow').append(filter);
}

//Filter label hide - show
function filterLabel(){
	if($('#filtershow > div').length)
		$('#filterLabel').show();
	else
		$('#filterLabel').hide();
}

//Showing number of language, display_lang function call, label show
function langCount(data){
	/*$('#langlist > div').remove();
		if(data != null){
			display_lang(data);
			$('#langcount').html('<h3 class="text-info">' + (data.length)+ ' Languages </h3>');
		}
		else{
			$('#langcount').html('<h3 class="text-info">' + '0' + ' Languages </h3>');
			var filter = '<div class="alert alert-error">' +
				'<strong>Oooops ! No Language found</strong>' +
				'</div>';
			$('#langlist').remove('tr').html(filter); //Insert div of no language found*/
	$("#lcmd-chart").remove();
	$('#lcmd').append('<div id="lcmd-chart"></div>');
	var a = 0;
	var b = 0;
	data.length == null ? a = 0 : a = data.length;
	a = (a/133)*100;
	b = 100 - a;
	var w = 450;
	var h = 300;
	var r = 100;
	var ir = 45;
	var textOffset = 14;
	var tweenDuration = 250;

//OBJECTS TO BE POPULATED WITH DATA LATER
	var lines, valueLabels, nameLabels;
	var pieData = [];    
	var oldPieData = [];
	var filteredPieData = [];

//D3 helper function to populate pie slice parameters from array data
	var donut = d3.layout.pie().value(function(d){
		return d.octetTotalCount;
	});

//D3 helper function to create colors from an ordinal scale
	var color = d3.scale.category20();

//D3 helper function to draw arcs, populates parameter "d" in path object
	var arc = d3.svg.arc()
		.startAngle(function(d){ return d.startAngle; })
		.endAngle(function(d){ return d.endAngle; })
		.innerRadius(ir)
		.outerRadius(r);

///////////////////////////////////////////////////////////
// GENERATE FAKE DATA /////////////////////////////////////
///////////////////////////////////////////////////////////

	var arrayRange = 100000; //range of potential values for each item
	var arraySize;
	var streakerDataAdded;

	function fillArray() {
		return {
			//port: "port",
			octetTotalCount: Math.ceil(Math.random()*(arrayRange))
		};
	}

///////////////////////////////////////////////////////////
// CREATE VIS & GROUPS ////////////////////////////////////
///////////////////////////////////////////////////////////

	var vis = d3.select("#lcmd-chart").append("svg:svg")
		.attr("width", w)
		.attr("height", h);

//GROUP FOR ARCS/PATHS
	var arc_group = vis.append("svg:g")
		.attr("class", "arc")
		.attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

//GROUP FOR LABELS
	var label_group = vis.append("svg:g")
		.attr("class", "label_group")
		.attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

//GROUP FOR CENTER TEXT  
	var center_group = vis.append("svg:g")
		.attr("class", "center_group")
		.attr("transform", "translate(" + (w/2) + "," + (h/2) + ")");

//PLACEHOLDER GRAY CIRCLE
	var paths = arc_group.append("svg:circle")
		.attr("fill", "#EFEFEF")
		.attr("r", r);

///////////////////////////////////////////////////////////
// CENTER TEXT ////////////////////////////////////////////
///////////////////////////////////////////////////////////

//WHITE CIRCLE BEHIND LABELS
	var whiteCircle = center_group.append("svg:circle")
		.attr("fill", "white")
		.attr("r", ir);

// "TOTAL" LABEL
	var totalLabel = center_group.append("svg:text")
		.attr("class", "label")
		.attr("dy", -15)
  		.attr("text-anchor", "middle") // text-align: right
  		.text("jquery.ime");

//TOTAL TRAFFIC VALUE
	var totalValue = center_group.append("svg:text")
		.attr("class", "total")
    	.attr("dy", 7)
  		.attr("text-anchor", "middle") // text-align: right
  		.text("Waiting...");

//UNITS LABEL
	var totalUnits = center_group.append("svg:text")
		.attr("class", "units")
		.attr("dy", 21)
  		.attr("text-anchor", "middle") // text-align: right
  


///////////////////////////////////////////////////////////
// STREAKER CONNECTION ////////////////////////////////////
///////////////////////////////////////////////////////////

	var updateInterval = window.setInterval(update, 1500);

// to run each time data is generated
	function update() {

		arraySize = 2;//Math.ceil(Math.random()*10);
		//streakerDataAdded = d3.range(arraySize).map(fillArray);
		//console.log(d3.range(arraySize).map(fillArray));
		streakerDataAdded = [{'octetTotalCount': a},{'octetTotalCount': b}];
		oldPieData = filteredPieData;
		pieData = donut(streakerDataAdded);

		var totalOctets = 0;
		filteredPieData = pieData.filter(filterData);
		function filterData(element, index, array) {
			element.name = streakerDataAdded[index].port;
			element.value = streakerDataAdded[index].octetTotalCount;
			totalOctets += element.value;
			return (element.value > 0);
	}

	if(filteredPieData.length > 0 && oldPieData.length > 0){
		//REMOVE PLACEHOLDER CIRCLE
    	arc_group.selectAll("circle").remove();
		totalValue.text(function(){
    		var kb = totalOctets/1024;
    		return kb.toFixed(1);
      	//return bchart.label.abbreviated(totalOctets*8);
  	});

    //DRAW ARC PATHS
    paths = arc_group.selectAll("path").data(filteredPieData);
    paths.enter().append("svg:path")
    	.attr("stroke", "white")
    	.attr("stroke-width", 0.5)
    	.attr("fill", function(d, i) { return color(i); })
    	.transition()
    		.duration(tweenDuration)
    		.attrTween("d", pieTween);
    paths
    	.transition()
    		.duration(tweenDuration)
    		.attrTween("d", pieTween);
    paths.exit()
    	.transition()
    		.duration(tweenDuration)
    		.attrTween("d", removePieTween)
    	.remove();

    //DRAW TICK MARK LINES FOR LABELS
    lines = label_group.selectAll("line").data(filteredPieData);
    lines.enter().append("svg:line")
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("y1", -r-3)
    .attr("y2", -r-8)
    .attr("stroke", "gray")
    .attr("transform", function(d) {
    	return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
    });
    lines.transition()
    	.duration(tweenDuration)
    	.attr("transform", function(d) {
    		return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
    });
    lines.exit().remove();

    //DRAW LABELS WITH PERCENTAGE VALUES
    valueLabels = label_group.selectAll("text.value").data(filteredPieData)
    .attr("dy", function(d){
    	if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
    		return 5;
    	} else {
    		return -7;
    	}
    })
    .attr("text-anchor", function(d){
    	if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
    		return "beginning";
    	} else {
    		return "end";
    	}
    })
    .text(function(d){
    	var percentage = (d.value/totalOctets)*100;
    	return percentage.toFixed(1) + "%";
    });

    valueLabels.enter().append("svg:text")
    .attr("class", "value")
    .attr("transform", function(d) {
    	return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
    })
    .attr("dy", function(d){
    	if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
    		return 5;
    	} else {
    		return -7;
    	}
    })
    .attr("text-anchor", function(d){
    	if ( (d.startAngle+d.endAngle)/2 < Math.PI ){
    		return "beginning";
    	} else {
    		return "end";
    	}
    }).text(function(d){
    	var percentage = (d.value/totalOctets)*100;
    	return percentage.toFixed(1) + "%";
    });

    valueLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

    valueLabels.exit().remove();


    //DRAW LABELS WITH ENTITY NAMES
    nameLabels = label_group.selectAll("text.units").data(filteredPieData)
    .attr("dy", function(d){
    	if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
    		return 17;
    	} else {
    		return 5;
    	}
    })
    .attr("text-anchor", function(d){
    	if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
    		return "beginning";
    	} else {
    		return "end";
    	}
    }).text(function(d){
    	return d.name;
    });

    nameLabels.enter().append("svg:text")
    .attr("class", "units")
    .attr("transform", function(d) {
    	return "translate(" + Math.cos(((d.startAngle+d.endAngle - Math.PI)/2)) * (r+textOffset) + "," + Math.sin((d.startAngle+d.endAngle - Math.PI)/2) * (r+textOffset) + ")";
    })
    .attr("dy", function(d){
    	if ((d.startAngle+d.endAngle)/2 > Math.PI/2 && (d.startAngle+d.endAngle)/2 < Math.PI*1.5 ) {
    		return 17;
    	} else {
    		return 5;
    	}
    })
    .attr("text-anchor", function(d){
    	if ((d.startAngle+d.endAngle)/2 < Math.PI ) {
    		return "beginning";
    	} else {
    		return "end";
    	}
    }).text(function(d){
    	return d.name;
    });

    nameLabels.transition().duration(tweenDuration).attrTween("transform", textTween);

    nameLabels.exit().remove();
}  
}

///////////////////////////////////////////////////////////
// FUNCTIONS //////////////////////////////////////////////
///////////////////////////////////////////////////////////

// Interpolate the arcs in data space.
function pieTween(d, i) {
	var s0;
	var e0;
	if(oldPieData[i]){
		s0 = oldPieData[i].startAngle;
		e0 = oldPieData[i].endAngle;
	} else if (!(oldPieData[i]) && oldPieData[i-1]) {
		s0 = oldPieData[i-1].endAngle;
		e0 = oldPieData[i-1].endAngle;
	} else if(!(oldPieData[i-1]) && oldPieData.length > 0){
		s0 = oldPieData[oldPieData.length-1].endAngle;
		e0 = oldPieData[oldPieData.length-1].endAngle;
	} else {
		s0 = 0;
		e0 = 0;
	}
	var i = d3.interpolate({startAngle: s0, endAngle: e0}, {startAngle: d.startAngle, endAngle: d.endAngle});
	return function(t) {
		var b = i(t);
		return arc(b);
	};
}

function removePieTween(d, i) {
	s0 = 2 * Math.PI;
	e0 = 2 * Math.PI;
	var i = d3.interpolate({startAngle: d.startAngle, endAngle: d.endAngle}, {startAngle: s0, endAngle: e0});
	return function(t) {
		var b = i(t);
		return arc(b);
	};
}

function textTween(d, i) {
	var a;
	if(oldPieData[i]){
		a = (oldPieData[i].startAngle + oldPieData[i].endAngle - Math.PI)/2;
	} else if (!(oldPieData[i]) && oldPieData[i-1]) {
		a = (oldPieData[i-1].startAngle + oldPieData[i-1].endAngle - Math.PI)/2;
	} else if(!(oldPieData[i-1]) && oldPieData.length > 0) {
		a = (oldPieData[oldPieData.length-1].startAngle + oldPieData[oldPieData.length-1].endAngle - Math.PI)/2;
	} else {
		a = 0;
	}
	var b = (d.startAngle + d.endAngle - Math.PI)/2;

	var fn = d3.interpolateNumber(a, b);
	return function(t) {
		var val = fn(t);
		return "translate(" + Math.cos(val) * (r+textOffset) + "," + Math.sin(val) * (r+textOffset) + ")";
	};
}
}
