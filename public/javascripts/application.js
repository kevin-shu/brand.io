var jsonCallback = function(data){
	// var i=0,max=data.length;
	// var site = "";
	// $("#result-container").html("");
	// for (site in data) {
	// 	// $("#result-table tbody").append("<tr><td><a href='"+data[i].link+"'>"+data[i].title+"</a></td><td>"+data[i].snippet+"</td></tr>");	
	// 	var table = $("<table class='table'></table>"),
	// 		words = data[site];
	// 	for(key in words) {
	// 		if (words[key]>3) {
	// 			table.append("<tr><td>"+key+"</td><td>"+words[key]+"</td></tr>");
	// 		}
	// 	}
	// 	$("#result-container").
	// 		append("<h3>"+site+"</h3>").
	// 		append(table);
	// 	// $("#result-table tbody").append("<tr><td>"+key+"</a></td><td>"+data[key]+"</td></tr>");							
	// }
	drawD3(data);
};

$("#trigger").click(function(){
	$.getJSON(
		"http://localhost:3030/parse?jsonCallback=?",
		{ q: $("#keyword").val() }
	);
});