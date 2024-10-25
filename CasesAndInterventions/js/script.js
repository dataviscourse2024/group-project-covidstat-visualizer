const margin = { top: 20, right: 30, bottom: 50, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svg = d3.select("#cases-chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

Promise.all([
    d3.csv("/CasesAndInterventions/data/merged_cases_df.csv"),
    d3.csv("/CasesAndInterventions/data/response_graphs_data_2022-08-25.csv")
]).then(function([casesData, responseData]) {
    // Parse date formats and filter data
    const parseTime = d3.timeParse("%Y-%m-%d");
    casesData.forEach(d => {
        d.year_week = parseTime(d.year_week);
        d.weekly_count = +d.weekly_count;
    });
    responseData.forEach(d => {
        d.date_start = parseTime(d.date_start);
        d.date_end = parseTime(d.date_end);
    });

    // Populate the dropdown with unique countries
    const countries = [...new Set(casesData.map(d => d.country))];
    const dropdown = d3.select("#countrySelect");
    dropdown.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

    updateChart(countries[0]);

    dropdown.on("change", function() {
        updateChart(this.value);
    });

    function updateChart(selectedCountry) {
        const filteredCases = casesData.filter(d => d.country === selectedCountry);
        const filteredResponses = responseData.filter(d => d.Country === selectedCountry);

        // Define scales
        const xScale = d3.scaleTime()
                         .domain(d3.extent(filteredCases, d => d.year_week))
                         .range([0, width]);
        const yScale = d3.scaleLinear()
                         .domain([0, d3.max(filteredCases, d => d.weekly_count) * 1.1])
                         .range([height, 0]);

        // Clear previous elements
        svg.selectAll("*").remove();

        // Define axes with formatting
        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yAxis = d3.axisLeft(yScale).tickFormat(d => {
            if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
            if (d >= 1e3) return (d / 1e3).toFixed(1) + "K";
            return d;
        });

        // Draw grid lines
        svg.append("g")
           .attr("class", "grid")
           .call(d3.axisLeft(yScale).ticks(10).tickSize(-width).tickFormat(""));

        // Draw x-axis
        svg.append("g")
           .attr("transform", `translate(0,${height})`)
           .call(xAxis)
           .append("text")
           .attr("class", "axis-label")
           .attr("x", width / 2)
           .attr("y", 40)
           .attr("fill", "black")
           .text("Date (Month and Year)");

        // Draw y-axis
        svg.append("g")
           .call(yAxis)
           .append("text")
           .attr("class", "axis-label")
           .attr("x", -height / 2)
           .attr("y", -50)
           .attr("transform", "rotate(-90)")
           .attr("fill", "black")
           .text("Weekly Cases Count");

        // Define line generator
        const line = d3.line()
                       .x(d => xScale(d.year_week))
                       .y(d => yScale(d.weekly_count));

        // Draw the line
        svg.append("path")
           .datum(filteredCases)
           .attr("class", "line-path")
           .attr("stroke", "rgba(31, 119, 180, 0.8)")
           .attr("d", line);

        // Draw response markers on the line
        filteredResponses.forEach(response => {
            const match = filteredCases.find(d => d.year_week.getTime() === response.date_start.getTime());
            if (match) {
                svg.append("circle")
                   .attr("cx", xScale(match.year_week))
                   .attr("cy", yScale(match.weekly_count))
                   .attr("r", 6)
                   .attr("class", "response-marker")
                   .on("mouseover", function(event) {
                       tooltip.style("display", "block")
                              .html(`<strong>Measure:</strong> ${response.Response_measure}<br>
                                     <strong>Start Date:</strong> ${response.date_start.toLocaleDateString()}<br>
                                     <strong>End Date:</strong> ${response.date_end ? response.date_end.toLocaleDateString() : 'N/A'}`)
                              .style("left", (event.pageX + 10) + "px")
                              .style("top", (event.pageY - 28) + "px");
                   })
                   .on("mouseout", function() {
                       tooltip.style("display", "none");
                   });
            }
        });
    }
});
