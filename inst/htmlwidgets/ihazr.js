HTMLWidgets.widget({

  name: 'ihazr',

  type: 'output',

  initialize: function(el, width, height) {

    return d3.select(el)
            .append("svg")
              .attr("class", "scatter")
              .attr("width", width)
              .attr("height", height);

  },

  renderValue: function(el, x, instance) {
    var data = HTMLWidgets.dataframeToD3(x);
    var pad = 30;

//    var svgbut = d3.select("body")
//        .append("svg")
//            .attr("class", "button")
//            .attr("width", w)
//            .attr("height", h/5)

    var svg = d3.select(el).select("svg");
    var w = svg.attr("width");
    var h = svg.attr("height");
//            .attr("class", "scatter")
//            .attr("width", w)
//            .attr("height", h);
//    var svg = d3.select("body")
//        .append("svg")
//            .attr("class", "scatter")
//            .attr("width", w)
//            .attr("height", h)
//    var svghud = d3.select("body")
//        .append("svg")
//            .attr("class", "hud")
//            .attr("width", w)
//            .attr("height", h/10)        
//    var svghaz = d3.select("body")
//        .append("svg")
//            .attr("width", w)
//            .attr("height",h)
    var svghaz = d3.select(el).append("svg")
                     .attr("width", w)
                     .attr("height", h);
//    var data;
    var datasub = [];
    var mouse = [900,200];
    var mouseold = [900,200];
    var cc = "marker";
    var freeze = 0;
    var refresh = 0;

    function kernelhazardEstimator(kernel, x) {
      return function(sample) {
        return x.map(function(x) {
          return [x, d3.sum(sample, function(v) { return v[3]*v[1]*kernel(x - v[0]); })];
        });
      };
    }

    function epanechnikovKernel(scale) {
      return function(u) {
        return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
      };
    }

//    d3.csv("/data/pbcdata.csv", function(d){
//        d3.csv("/data/swog.csv", function(d){
//        data = d;

        var trange = [d3.min(data, function(d){return +d.time}), d3.max(data, function(d){ return +d.time;})];
        var covrange = [d3.min(data, function(d){return +d[cc];}), d3.max(data, function(d){return +d[cc];})];
        var xScale = d3.scale.linear()
            .domain(trange)
            .range([pad*1.5, w-pad*1.5]);
        var yScale = d3.scale.linear()
            .domain(covrange)
            .range([h-pad*1.5, pad*1.5]);
        var yScalehaz = d3.scale.linear()
            .domain([0, 0.75])
            .range([h-pad*1.5, pad*1.5]);
        var yScaleNA = d3.scale.linear()
            .domain([0, 3])
            .range([h-pad*1.5, pad*1.5]);
        var mxtocov = d3.scale.linear()
            .domain([pad*1.5, w-pad*1.5])
            .range([0, covrange[1]-covrange[0]]);
        var covtoh = d3.scale.linear()
            .domain([0, covrange[1]-covrange[0]])
            .range([0, h-pad*3]);
        var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10);
        var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);
        var yAxishaz = d3.svg.axis().scale(yScalehaz).orient("right").ticks(10);
        var yAxisNA = d3.svg.axis().scale(yScaleNA).orient("left").ticks(10);
        var meval = yScale.invert(mouse[1]);
        var bm = mxtocov(mouse[0])/2;

        svg.on("mousemove", function(){
            if(freeze==1){return 0;}
            mouse = d3.mouse(this);
        });

/*        svgbut.selectAll(".rect.buttons")
                .data(d3.keys(data[1]).slice(2, d3.keys(data[1]).length))
                .enter()
            .append("rect")
                .attr("class", ".buttons")
                .attr("x", function(d,i){
                    return i*w/(d3.keys(data[1]).length-2)+5;
                })
                .attr("y", 5)
                .attr("rx", 3)
                .attr("ry", 3)
                .attr("height", h/5-10)
                .attr("width", w/(d3.keys(data[1]).length-2) - 10)
                .style("fill-opacity", 1)
                .style("fill", "rgb(200,50,50)")
        svgbut.selectAll(".text.buttons")
                .data(d3.keys(data[1]).slice(2, d3.keys(data[1]).length))
                .enter()
            .append("text")
                .attr("x", function(d,i){
                    return (i+0.5)*w/(d3.keys(data[1]).length-2);
                })
                .attr("y", h/10+2)
                .attr("text-anchor", "middle")
                .style("fill", "rgb(250,250,250)")
//                    .style("fill", "rgb(128,0,0)")
                .style("font-weight", "bold")
                .style("font-family", "Courier")
                .style("font-size", "20px")
                .text(function(d){return d;}); */
        svg.selectAll("circle")
                .data(data)
                .enter()
            .append("circle")
                .attr("cx", function(d){return xScale(+d["time"]);})
                .attr("cy", function(d){return yScale(+d[cc]);})
                .attr("r", 4)
                .attr("fill", function(d){
                    return d.status==1 ? "rgb(0,0,180)" : "transparent";
                })
                .style("stroke-width", function(d){
                    return d.status==1 ? "0px" : "2px";
                })
                .style("stroke", "rgb(70,70,70)");
        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0,"+(h-pad)+")")
                .style("stroke-width", "2px")
                .call(xAxis);
        svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate("+(pad)+",0)")
                .style("stroke-width", "2px")
                .call(yAxis);
        svg.append("rect")
                .attr("class", "grayrect")
                .attr("x", pad)
                .attr("y", mouse[1]-covtoh(bm))
                .attr("height", covtoh(mxtocov(mouse[0])))
                .attr("width", w)
                .attr("fill", "gray")
                .attr("fill-opacity", 0.4);

        var hazr = d3.svg.line()
            .x(function(d){return xScale(d[0]);})
            .y(function(d){return yScalehaz(d[1]);});
        var nahaz = d3.svg.area()
            .x(function(d){return xScale(d[0]);})
            .y0(h-pad*1.5)
            .y1(function(d){return yScaleNA(d[2]);})
            .interpolate("step-after");
        data.forEach(function(d){
            if(+d[cc]>(meval-bm) & d[cc]<(meval+bm)){
                datasub.push([+d.time, 0, 0, +d.status]);
            }
        });
        console.log(meval, bm);
        datasub.forEach(function(d, i){
            datasub[i][1] = 1/(datasub.length-i);
            if(i>0){
                datasub[i][2] = datasub[i][1]*datasub[i][3] + datasub[i-1][2]
            } else{
                datasub[i][2] = datasub[i][1]*datasub[i][3]
            }
        });

        datasub.push([trange[1], 0, datasub[datasub.length-1][3], 0]);
        datasub.unshift([trange[0], 0, 0, 0]);
//        console.log(datasub);

        var khe = kernelhazardEstimator(epanechnikovKernel(1), xScale.ticks(100));
        var khedata = khe(datasub);

        // BEGIN VERY MESSY LEGEND CODE
/*        svghud.append("rect")
                .attr("x", pad)
                .attr("y", pad/4)
                .attr("width", w/2.35)
                .attr("height", h/10)
                .style("fill", "gray")
                .style("fill-opacity", "0.4")
        svghud.append("text")
                .attr("x", pad*1.3)
                .attr("y", 30)
                .style("fill", "rgb(50,50,50")
                .style("font-family", "PT Sans")
                .style("font-size", "18px")
                .text("time window: 2 years");
        svghud.append("text")
                .attr("class", "hudtxt")
                .attr("x", w/3.9)
                .attr("y", 30)
                .style("fill", "rgb(50,50,50")
                .style("font-family", "PT Sans")
                .style("font-size", "18px")
                .text("marker window: " +  d3.round(mxtocov(mouse[0]), 2));
        svghud.selectAll("legenddots")
                .data([15,35])
                .enter()
            .append("circle")
                .attr("cx", w/2)
                .attr("cy", function(d){return d;})
                .attr("r", 4)
                .attr("fill", function(d, i){
                    return i==0 ? "rgb(0,0,180)" : "transparent";
                })
                .style("stroke-width", function(d, i){
                    return i==0 ? "0px" : "2px";
                })
                .style("stroke", "rgb(70,70,70)");
        svghud.append("path")
                .style("stroke", "rgb(255,90,0)")
                .style("stroke-width", "4px")
                .attr("d", "M"+w/1.5+","+15+"L"+w/1.45+","+15);
        svghud.append("path")
                .style("stroke", "rgb(50,50,50)")
                .style("stroke-width", "8px")
                .attr("d", "M"+w/1.5+","+35+"L"+w/1.45+","+35);
        svghud.selectAll("legendtxt1")
                .data([19,40])
                .enter()
            .append("text")
                .attr("x", w/2+10)
                .attr("y", function(d){return d;})
                .style("fill", "rgb(50,50,50)")
                .style("font-family", "PT Sans")
                .style("font-size", "18px")
                .text(function(d,i){
                    return i==0 ? "death" : "censored";
                });
        // END VERY MESSY LEGEND CODE
        svghud.selectAll("legendtxt2")
                .data([19,40])
                .enter()
            .append("text")
                .attr("x", w/1.45+5)
                .attr("y", function(d){return d;})
                .style("fill", "rgb(50,50,50)")
                .style("font-family", "PT Sans")
                .style("font-size", "18px")
                .text(function(d,i){
                    return i==0 ? "hazard rate" : "cumulative hazard";
                });*/ 
        svghaz.append("path")
                .datum(datasub)
                .attr("class", "nahazline")
                .style("fill","rgb(50,50,50)")
                .style("shape-rendering", "crispEdges")
                .attr("d", nahaz);
        svghaz.append("path")
                .datum(khedata)
                .attr("class", "hazline")
                .style("stroke", "rgba(255,90,0,1)")
//                    .style("stroke", "rgba(218,165,32,1)")
                .style("stroke-width", "4px")
                .style("fill-opacity","0")
                .attr("d", hazr);
        svghaz.append("g")
                .attr("class", "x axis haz")
                .attr("transform", "translate(0,"+(h-pad)+")")
                .style("stroke-width", "2px")
                .call(xAxis);
        svghaz.append("g")
                .attr("class", "y axis haz")
                .attr("transform", "translate("+(w-pad)+",0)")
                .style("stroke-width", "2px")
                .call(yAxishaz);
        svghaz.append("g")
                .attr("class", "y axis NA")
                .attr("transform", "translate("+(pad)+",0)")
                .style("stroke-width", "2px")
                .call(yAxisNA);

        function mgr(){
            if(((mouseold[0]==mouse[0] && mouseold[1]==mouse[1]) || freeze==1) && refresh==0){
                //IF (mouse hasn't moved OR scatterplot is clicked) AND (no button has been pressed) THEN exit function w/o calculating anything
                return 0;
            }
            meval = yScale.invert(mouse[1]);
            bm = mxtocov(mouse[0])/2;
            datasub = [];
            data.forEach(function(d){
                if(+d[cc]>(meval-bm) & +d[cc]<meval+bm){
                    datasub.push([+d.time, 0, 0, +d.status]);
                }
            });
            datasub.forEach(function(d, i){
                datasub[i][1] = 1/(datasub.length-i);
                if(i>0){
                    datasub[i][2] = datasub[i][1]*datasub[i][3] + datasub[i-1][2];
                } else{
                    datasub[i][2] = datasub[i][1]*datasub[i][3];
                }
            });
            datasub.push([trange[1], 0, datasub[datasub.length-1][3], 0]);
            datasub.unshift([trange[0], 0, 0, 0]);

            khedata = khe(datasub);

            svghaz.select("path.hazline")
                    .datum(khedata)
                    .transition().duration(100)
                    .attr("d", hazr);
            svghaz.select("path.nahazline")
                    .datum(datasub)
                    .attr("d", nahaz);
            svg.select(".grayrect")
                    .attr("y", mouse[1]-covtoh(bm))
                    .attr("height", covtoh(mxtocov(mouse[0])));
//            svghud.select("text.hudtxt")
//                    .text("marker window: " +  d3.round(mxtocov(mouse[0]), 2));
            mouseold = mouse;
            refresh = 0;
        }
        setInterval(mgr, 10);

/*        svgbut.on("click", function(){
            freeze = 0;
            refresh = 1;
            var mt = d3.mouse(this)[0];
            cc = d3.keys(data[1]).slice(2, d3.keys(data[1]).length)[Math.floor(mt/(w/(d3.keys(data[1]).length-2)))]
            covrange = [d3.min(data, function(d){return +d[cc];}), d3.max(data, function(d){return +d[cc];})];

            yScale
                .domain(covrange)
                .range([h-pad*1.5, pad*1.5]);
            mxtocov
                .domain([pad*1.5, w-pad*1.5])
                .range([0, covrange[1]-covrange[0]])
            covtoh
                .domain([0, covrange[1]-covrange[0]])
                .range([0, h-pad*3])
            yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(10);

            svg.selectAll("circle")
                    .transition().duration(1000)
                    .attr("cy", function(d){return yScale(+d[cc]);});

            svg.select(".y.axis")
                    .transition().duration(1000)
                    .call(yAxis);
        }); */
        svg.on("click", function(){
            if(freeze==0){
                freeze=1;
                return 0;
            }
            freeze=0;
        });
//    })


  },

  resize: function(el, width, height, instance) {

  }

});
