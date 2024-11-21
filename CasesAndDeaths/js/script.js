const margin = { top: 50, right: 80, bottom: 50, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svgCases = d3.select("#cases-chart")
                   .append("svg")
                   .attr("width", width + margin.left + margin.right)
                   .attr("height", height + margin.top + margin.bottom)
                   .append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

const svgDeaths = d3.select("#deaths-chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip")
                  .style("position", "absolute")
                  .style("padding", "8px")
                  .style("background", "black")
                  .style("border-radius", "4px")
                  .style("display", "none");

const legend = d3.select("#cases-chart")
                 .append("svg")
                 .attr("width", width + margin.left + margin.right)
                 .attr("height", 50)
                 .append("g")
                 .attr("transform", `translate(${margin.left},10)`);

function parseYearWeek(year_week) {
    const [year, week] = year_week.split("-").map(Number);
    return new Date(year, 0, (week - 1) * 7);
}

d3.csv("data/casesdeaths_vaccines.csv").then(function(data) {
    data.forEach(d => {
        d.weekly_cases = +d.weekly_cases;
        d.weekly_deaths = +d.weekly_deaths;
        d.FirstDose = +d.FirstDose;
        d.SecondDose = +d.SecondDose;
        d.date = parseYearWeek(d.year_week);
    });

    const countries = [...new Set(data.map(d => d.country))];
    const dropdown = d3.select("#country-select");
    dropdown.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .text(d => d)
            .attr("value", d => d);

    updateCharts(countries[0]);

    dropdown.on("change", function() {
        updateCharts(this.value);
    });

    function updateCharts(country) {
        const countryData = data.filter(d => d.country === country);

        const xScale = d3.scaleTime()
                         .domain(d3.extent(countryData, d => d.date))
                         .range([0, width]);

        const yCasesScale = d3.scaleLinear()
                              .domain([0, d3.max(countryData, d => d.weekly_cases) * 1.2])
                              .range([height, 0]);

        const yDeathsScale = d3.scaleLinear()
                               .domain([0, d3.max(countryData, d => d.weekly_deaths) * 1.2])
                               .range([height, 0]);

        const yVaccineScale = d3.scaleLinear()
                                .domain([0, 100])
                                .range([height, 0]);

        const xAxis = d3.axisBottom(xScale).ticks(d3.timeMonth.every(3)).tickFormat(d3.timeFormat("%Y-W%U"));
        const yAxisCases = d3.axisLeft(yCasesScale).ticks(5).tickFormat(d => d >= 1e6 ? (d / 1e6).toFixed(1) + "M" : d);
        const yAxisDeaths = d3.axisLeft(yDeathsScale).ticks(5).tickFormat(d => d >= 1e6 ? (d / 1e6).toFixed(1) + "M" : d);
        const yAxisVaccine = d3.axisRight(yVaccineScale).ticks(5).tickFormat(d => d + "%");

        svgCases.selectAll("*").remove();
        svgDeaths.selectAll("*").remove();

        svgCases.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

        svgCases.append("g")
                .call(yAxisCases)
                .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -50)
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .text("Weekly COVID-19 Cases");
        
        svgCases.append("g")
                .attr("transform", `translate(${width}, 0)`)
                .call(yAxisVaccine)
                .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", 50)
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .text("Vaccination Rate (%)");


        svgDeaths.append("g")
                 .attr("transform", `translate(0,${height})`)
                 .call(xAxis)
                 .selectAll("text")
                 .attr("transform", "rotate(-45)")
                 .style("text-anchor", "end");

        svgDeaths.append("g")
                 .call(yAxisDeaths)
                 .append("text")
                 .attr("class", "axis-label")
                 .attr("transform", "rotate(-90)")
                 .attr("x", -height / 2)
                 .attr("y", -50)
                 .attr("fill", "black")
                 .style("text-anchor", "middle")
                 .text("Weekly COVID-19 Deaths");

        const lineCases = d3.line()
                            .x(d => xScale(d.date))
                            .y(d => yCasesScale(d.weekly_cases));

        const lineDeaths = d3.line()
                             .x(d => xScale(d.date))
                             .y(d => yDeathsScale(d.weekly_deaths));

        const lineVaccine = d3.line()
                              .x(d => xScale(d.date))
                              .y(d => yVaccineScale(d.FirstDose));

        const areaVaccine = d3.area()
                              .x(d => xScale(d.date))
                              .y0(height)
                              .y1(d => yVaccineScale(d.FirstDose));

        svgCases.append("path")
                .datum(countryData)
                .attr("class", "line")
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("d", lineCases)
                .attr("stroke-dasharray", function() { return this.getTotalLength(); })
                .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
                .transition()
                .duration(2000)
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0);

        svgDeaths.append("path")
                 .datum(countryData)
                 .attr("class", "line")
                 .attr("stroke", "red")
                 .style("stroke-dasharray", "5,5")
                 .attr("stroke-width", 2)
                 .attr("d", lineDeaths)
                 .attr("stroke-dasharray", function() { return this.getTotalLength(); })
                 .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
                 .transition()
                 .duration(2000)
                 .ease(d3.easeLinear)
                 .attr("stroke-dashoffset", 0);

        svgCases.append("path")
                .datum(countryData)
                .attr("fill", "rgba(150, 100, 255, 0.3)")
                .attr("d", areaVaccine)
                .style("opacity", 0)
                .transition()
                .duration(2000)
                .style("opacity", 1);

        svgCases.append("path")
                .datum(countryData)
                .attr("class", "line")
                .attr("stroke", "purple")
                .attr("stroke-width", 2)
                .attr("d", lineVaccine)
                .attr("fill", "none");

        legend.append("circle").attr("cx", 10).attr("cy", 10).attr("r", 6).style("fill", "blue");
        legend.append("text").attr("x", 20).attr("y", 15).text("Cases").style("font-size", "12px");

        legend.append("circle").attr("cx", 10).attr("cy", 30).attr("r", 6).style("fill", "red");
        legend.append("text").attr("x", 20).attr("y", 35).text("Deaths").style("font-size", "12px");

        legend.append("circle").attr("cx", 10).attr("cy", 50).attr("r", 6).style("fill", "purple");
        legend.append("text").attr("x", 20).attr("y", 55).text("Vaccination Rate").style("font-size", "12px");

        function showTooltip(event, d) {
            tooltip.style("display", "block")
                   .style("left", `${event.pageX + 10}px`)
                   .style("top", `${event.pageY + 10}px`)
                   .html(`
                       <strong>Date:</strong> ${d3.timeFormat("%Y-%W")(d.date)}<br>
                       <strong>Cases:</strong> ${d.weekly_cases}<br>
                       <strong>Deaths:</strong> ${d.weekly_deaths}<br>
                       <strong>Vaccination Rate:</strong> ${d.FirstDose}%
                   `);
        }

        function hideTooltip() {
            tooltip.style("display", "none");
        }

        svgCases.selectAll(".case-dot")
            .data(countryData)
            .enter()
            .append("circle")
            .attr("class", "case-dot")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yCasesScale(d.weekly_cases))
            .attr("r", 0)
            .attr("fill", "blue")
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip)
            .transition()
            .duration(500)
            .attr("r", 4);

        svgDeaths.selectAll(".death-dot")
            .data(countryData)
            .enter()
            .append("circle")
            .attr("class", "death-dot")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yDeathsScale(d.weekly_deaths))
            .attr("r", 0)
            .attr("fill", "red")
            .on("mouseover", showTooltip)
            .on("mouseout", hideTooltip)
            .transition()
            .duration(500)
            .attr("r", 4);

        svgCases.append("text")
                .attr("x", xScale(new Date(2021, 3, 1)))
                .attr("y", yCasesScale(d3.max(countryData, d => d.weekly_cases)) - 20)
                .attr("class", "annotation")
                .text("Vaccination Campaign Begins")
                .style("font-size", "10px")
                .style("fill", "gray")
                .style("text-anchor", "start")
                .style("opacity", 0)
                .transition()
                .duration(1000)
                .style("opacity", 1);

        svgCases.append("text")
                .attr("x", xScale(new Date(2021, 8, 1)))
                .attr("y", yCasesScale(d3.max(countryData, d => d.weekly_cases) - 500))
                .attr("class", "annotation")
                .text("Second Wave")
                .style("font-size", "10px")
                .style("fill", "gray")
                .style("text-anchor", "start")
                .style("opacity", 0)
                .transition()
                .duration(1000)
                .style("opacity", 1);

        const peakCase = d3.max(countryData, d => d.weekly_cases);
        const peakCaseData = countryData.find(d => d.weekly_cases === peakCase);

        svgCases.append("circle")
                .attr("cx", xScale(peakCaseData.date))
                .attr("cy", yCasesScale(peakCaseData.weekly_cases))
                .attr("r", 6)
                .attr("fill", "blue")
                .attr("stroke", "black")
                .attr("stroke-width", 1);

        svgCases.append("text")
                .attr("x", xScale(peakCaseData.date) + 10)
                .attr("y", yCasesScale(peakCaseData.weekly_cases) - 10)
                .text(`Peak Cases: ${peakCase}`)
                .style("font-size", "10px")
                .style("fill", "blue");

        const peakDeath = d3.max(countryData, d => d.weekly_deaths);
        const peakDeathData = countryData.find(d => d.weekly_deaths === peakDeath);

        svgDeaths.append("circle")
                .attr("cx", xScale(peakDeathData.date))
                .attr("cy", yDeathsScale(peakDeathData.weekly_deaths))
                .attr("r", 6)
                .attr("fill", "red")
                .attr("stroke", "black")
                .attr("stroke-width", 1);

        svgDeaths.append("text")
                .attr("x", xScale(peakDeathData.date) + 10)
                .attr("y", yDeathsScale(peakDeathData.weekly_deaths) - 10)
                .text(`Peak Deaths: ${peakDeath}`)
                .style("font-size", "10px")
                .style("fill", "red");

        svgCases.append("text")
                .attr("x", width / 2)
                .attr("y", -30)
                .attr("class", "title")
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("font-weight", "bold")
                .text(`COVID-19 Weekly Trends: Cases, Deaths, and Vaccination Rates in ${country}`);

        svgCases.append("text")
                .attr("x", width / 2)
                .attr("y", -10)
                .attr("class", "subtitle")
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "gray")
                .text("Tracking significant events and vaccination effects over time");

        const vaccineStartDate = new Date(2021, 0, 1);

        svgCases.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", xScale(vaccineStartDate))
                .attr("height", height)
                .attr("fill", "lightgray")
                .attr("opacity", 0)
                .transition()
                .duration(1000)
                .attr("opacity", 0.2);

        svgCases.append("text")
                .attr("x", xScale(vaccineStartDate) / 2)
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "10px")
                .style("fill", "gray")
                .text("Pre-Vaccination Period");
    }
}).catch(error => console.error("Error loading data:", error));
