$ (function() {
	getData();
})
function getData(){
	$.getJSON("mapall.json", function (data){
		console.log(data);
		var datatolang = [0,0,0,0];
		var dates = ["Feb 2013", "Jan 2013", "Nov 2012", "Oct 2012"];
		//datatolang['harsh'] = 'sucheta'; 
		//datatolang[0] = 'suchu';
		var flag = 0;
			$.each(data, function (i,value){
				//console.log(i);
				//console.log(value.date);
				var fullDate = value.date; 
				var splitDate = fullDate.split(" ");
				var date = splitDate[1] + " " + splitDate[4] ;

				//datatolang[date] = 1;
				//console.log(datatolang);
				//console.log( splitDate[1] + " " + splitDate[4] ); 
				//console.log(datatolang.length);
				for (var i = 0 ; i < dates.length ; i++){
					if(date == dates[i]) {
						datatolang[i] = datatolang[i] + 1;
						break;
					}
 				}

				
            });

			var finalDate = [];
			for (var i = 0 ; i < dates.length ; i++){
					finalDate[dates[i]] = datatolang[i];
					 				}
            console.log(finalDate);
	})
}
