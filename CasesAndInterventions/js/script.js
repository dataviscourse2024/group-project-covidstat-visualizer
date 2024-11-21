// Define margins, width, and height for the SVG canvas
const margin = { top: 50, right: 30, bottom: 80, left: 70 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Create the SVG element and append it to the chart container
const svg = d3.select("#cases-chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip for displaying intervention details on hover
const tooltip = d3.select("#tooltip")
                  .style("opacity", 0)
                  .style("display", "none");

// Color scale for intervention types
const interventionColors = d3.scaleOrdinal(d3.schemeCategory10);

// Create a color legend for interventions in a separate container with scrolling
const legendContainer = d3.select("#cases-chart")
    .append("div")
    .attr("class", "legend-container")
    .style("max-height", "200px") // Limit height for scrolling
    .style("overflow-y", "auto")  // Enable vertical scrolling
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("margin-top", "10px")
    .style("gap", "10px");

// Load and process data
Promise.all([
    d3.csv("data/cases_summary.csv"),
    d3.csv("data/responses_summary.csv")
]).then(function([casesData, responsesData]) {
    // Convert date formats and parse numbers
    const parseTime = d3.timeParse("%Y-%m-%d");
    casesData.forEach(d => {
        d.year_week = parseTime(d.year_week);
        d.weekly_count = +d.weekly_count;
    });
    responsesData.forEach(d => {
        d.date_start = parseTime(d.date_start);
        d.date_end = parseTime(d.date_end);
    });

    // Populate the country dropdown
    const countries = [...new Set(casesData.map(d => d.country))];
    const dropdown = d3.select("#countrySelect");
    dropdown.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

    // Set color domain based on unique intervention types
    const interventionTypes = [...new Set(responsesData.map(d => d.Response_measure))];
    interventionColors.domain(interventionTypes);

    // Initial chart for the first country in the list
    updateChart(countries[0]);

    // Event listener for dropdown selection
    dropdown.on("change", function() {
        updateChart(this.value);
    });

    // Event listener for intervention filter checkboxes
    d3.selectAll(".intervention-filter").on("change", function() {
        updateChart(dropdown.node().value);
    });

    // Function to update the chart and legend based on selected country and interventions
    function updateChart(selectedCountry) {
        // Filter data for the selected country
        const filteredCases = casesData.filter(d => d.country === selectedCountry);
        const selectedInterventions = Array.from(document.querySelectorAll('.intervention-filter:checked')).map(d => d.value);
        const filteredResponses = responsesData.filter(d => d.Country === selectedCountry && selectedInterventions.includes(d.Response_measure));

        // Update the legend with only selected interventions
        updateLegend(selectedInterventions);

        // Define scales
        const xScale = d3.scaleTime()
                         .domain(d3.extent(filteredCases, d => d.year_week))
                         .range([0, width]);
        const yScale = d3.scaleLinear()
                         .domain([0, d3.max(filteredCases, d => d.weekly_count) * 1.1])
                         .range([height, 0]);

        // Clear previous chart elements
        svg.selectAll(".axis, .line-path, .response-marker, .grid").remove();

        // Add X and Y axes
        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yAxis = d3.axisLeft(yScale).tickFormat(d => d >= 1e6 ? (d / 1e6).toFixed(1) + "M" : d >= 1e3 ? (d / 1e3).toFixed(1) + "K" : d);

        // Append grid lines
        svg.append("g")
           .attr("class", "grid")
           .call(d3.axisLeft(yScale).ticks(10).tickSize(-width).tickFormat(""));

        // Append X-axis
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

        // Append Y-axis
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

        // Line generator for cases
        const line = d3.line()
                       .x(d => xScale(d.year_week))
                       .y(d => yScale(d.weekly_count));

        // Append the line path for cases with animation
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
           .duration(2000)  // Duration of the animation
           .ease(d3.easeLinear)
           .attr("stroke-dashoffset", 0);

        // Append intervention markers with fade-in animation and tooltip
        // Tooltip event listeners without D3 transition()
        filteredResponses.forEach(response => {
            const match = filteredCases.find(d => d.year_week.getTime() === response.date_start.getTime());
            if (match) {
                const marker = svg.append("circle")
                    .attr("cx", xScale(match.year_week))
                    .attr("cy", yScale(match.weekly_count))
                    .attr("r", 6)
                    .attr("class", "response-marker")
                    .style("fill", interventionColors(response.Response_measure))
                    .style("opacity", 0);  // Start with 0 opacity for fade-in effect

                // Apply fade-in animation
                marker.transition()
                    .duration(1000)  // Duration of the fade-in animation
                    .style("opacity", 1);

                // Tooltip event listeners
                marker.on("mouseover", function(event) {
                        tooltip.style("opacity", 1)  // Set tooltip to visible
                            .style("display", "block")  // Ensure tooltip is displayed
                            .html(`<strong>Measure:</strong> ${response.Response_measure}<br>
                                    <strong>Start Date:</strong> ${response.date_start.toLocaleDateString()}<br>
                                    <strong>End Date:</strong> ${response.date_end ? response.date_end.toLocaleDateString() : 'N/A'}`)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on("mouseout", function() {
                        tooltip.style("opacity", 0)  // Hide tooltip by setting opacity to 0
                            .style("display", "none");  // Ensure tooltip is hidden after fade-out
                    });
            }
        });
    }

    // Function to update the legend with only selected interventions
    function updateLegend(selectedInterventions) {
        legendContainer.selectAll("*").remove(); // Clear previous legend

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

                   
