const margin = { top: 50, right: 30, bottom: 80, left: 70 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const svg = d3.select("#cases-chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip")
                  .style("opacity", 0)
                  .style("display", "none");

const interventionColors = d3.scaleOrdinal(d3.schemeCategory10);

const legendContainer = d3.select("#cases-chart")
    .append("div")
    .attr("class", "legend-container")
    .style("max-height", "200px") 
    .style("overflow-y", "auto")  
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("margin-top", "10px")
    .style("gap", "10px");

Promise.all([
    d3.csv("data/cases_summary.csv"),
    d3.csv("data/responses_summary.csv")
]).then(function([casesData, responsesData]) {
    const parseTime = d3.timeParse("%Y-%m-%d");
    casesData.forEach(d => {
        d.year_week = parseTime(d.year_week);
        d.weekly_count = +d.weekly_count;
    });
    responsesData.forEach(d => {
        d.date_start = parseTime(d.date_start);
        d.date_end = parseTime(d.date_end);
    });

    const countries = [...new Set(casesData.map(d => d.country))];
    const dropdown = d3.select("#countrySelect");
    dropdown.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

    const interventionTypes = [...new Set(responsesData.map(d => d.Response_measure))];
    interventionColors.domain(interventionTypes);

    updateChart(countries[0]);

    dropdown.on("change", function() {
        updateChart(this.value);
    });

    d3.selectAll(".intervention-filter").on("change", function() {
        updateChart(dropdown.node().value);
    });

    function updateChart(selectedCountry) {
        const filteredCases = casesData.filter(d => d.country === selectedCountry);
        const selectedInterventions = Array.from(document.querySelectorAll('.intervention-filter:checked')).map(d => d.value);
        const filteredResponses = responsesData.filter(d => d.Country === selectedCountry && selectedInterventions.includes(d.Response_measure));

        updateLegend(selectedInterventions);

        const xScale = d3.scaleTime()
                         .domain(d3.extent(filteredCases, d => d.year_week))
                         .range([0, width]);
        const yScale = d3.scaleLinear()
                         .domain([0, d3.max(filteredCases, d => d.weekly_count) * 1.1])
                         .range([height, 0]);

        svg.selectAll(".axis, .line-path, .response-marker, .grid").remove();

        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yAxis = d3.axisLeft(yScale).tickFormat(d => d >= 1e6 ? (d / 1e6).toFixed(1) + "M" : d >= 1e3 ? (d / 1e3).toFixed(1) + "K" : d);

        svg.append("g")
           .attr("class", "grid")
           .call(d3.axisLeft(yScale).ticks(10).tickSize(-width).tickFormat(""));

        svg.append("g")
           .attr("transform", `translate(0,${height})`)
           .attr("class", "axis")
           .call(xAxis)
           .append("text")
           .attr("class", "axis-label")
           .attr("x", width / 2)
           .attr("y", 40)
           .attr("fill", "black")
           .text("Date (Month and Year)");

        svg.append("g")
           .attr("class", "axis")
           .call(yAxis)
           .append("text")
           .attr("class", "axis-label")
           .attr("x", -height / 2)
           .attr("y", -50)
           .attr("transform", "rotate(-90)")
           .attr("fill", "black")
           .text("Weekly Cases Count");

        const line = d3.line()
                       .x(d => xScale(d.year_week))
                       .y(d => yScale(d.weekly_count));

        svg.append("path")
           .datum(filteredCases)
           .attr("class", "line-path")
           .attr("stroke", "rgba(31, 119, 180, 0.8)")
           .attr("fill", "none")
           .attr("stroke-width", 2.5)
           .attr("d", line)
           .attr("stroke-dasharray", function() {
               const totalLength = this.getTotalLength();
               return `${totalLength} ${totalLength}`;
           })
           .attr("stroke-dashoffset", function() {
               return this.getTotalLength();
           })
           .transition()
           .duration(2000) 
           .ease(d3.easeLinear)
           .attr("stroke-dashoffset", 0);

        filteredResponses.forEach(response => {
            const match = filteredCases.find(d => d.year_week.getTime() === response.date_start.getTime());
            if (match) {
                const marker = svg.append("circle")
                    .attr("cx", xScale(match.year_week))
                    .attr("cy", yScale(match.weekly_count))
                    .attr("r", 6)
                    .attr("class", "response-marker")
                    .style("fill", interventionColors(response.Response_measure))
                    .style("opacity", 0);  

                marker.transition()
                    .duration(1000)  
                    .style("opacity", 1);

                marker.on("mouseover", function(event) {
                        tooltip.style("opacity", 1)  
                            .style("display", "block")  
                            .html(`<strong>Measure:</strong> ${response.Response_measure}<br>
                                    <strong>Start Date:</strong> ${response.date_start.toLocaleDateString()}<br>
                                    <strong>End Date:</strong> ${response.date_end ? response.date_end.toLocaleDateString() : 'N/A'}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.style("opacity", 0)  
                            .style("display", "none");  
                    });
            }
        });
    }

    // Function to update the legend with only selected interventions
    function updateLegend(selectedInterventions) {
        legendContainer.selectAll("*").remove(); 

        legendContainer.selectAll(".legend-item")
            .data(selectedInterventions)
            .enter()
            .append("div")
            .attr("class", "legend-item")
            .style("display", "flex")
            .style("align-items", "center")
            .style("margin-right", "10px")
            .each(function(d) {
                d3.select(this).append("div")
                    .attr("class", "legend-color-box")
                    .style("width", "15px")
                    .style("height", "15px")
                    .style("background-color", interventionColors(d))
                    .style("margin-right", "5px");

                    d3.select(this).append("span")
                    .attr("class", "legend-text")
                    .text(d);
            });
    }
});

                   
