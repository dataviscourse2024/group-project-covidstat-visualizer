const margin = { top: 20, right: 30, bottom: 50, left: 70 },
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svgDeaths = d3.select("#deaths-chart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

const svgCases = d3.select("#cases-chart")
                   .append("svg")
                   .attr("width", width + margin.left + margin.right)
                   .attr("height", height + margin.top + margin.bottom)
                   .append("g")
                   .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

Promise.all([
    d3.csv("/CasesAndDeaths/data/deaths_df_before_2021_03_01.csv"),
    d3.csv("/CasesAndDeaths/data/deaths_df_2021_03_01_onwards.csv"),
    d3.csv("/CasesAndDeaths/data/cases_df_before_2021_03_01.csv"),
    d3.csv("/CasesAndDeaths/data/cases_df_2021_03_01_onwards.csv")
]).then(function([dataDeathsBefore, dataDeathsAfter, dataCasesBefore, dataCasesAfter]) {
    dataDeathsBefore.forEach(d => { d.week = +d.week; d.weekly_count = +d.weekly_count; });
    dataDeathsAfter.forEach(d => { d.week = +d.week; d.weekly_count = +d.weekly_count; });
    dataCasesBefore.forEach(d => { d.week = +d.week; d.weekly_count = +d.weekly_count; });
    dataCasesAfter.forEach(d => { d.week = +d.week; d.weekly_count = +d.weekly_count; });

    const countries = [...new Set(dataDeathsBefore.map(d => d.country))];

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
        const deathsBefore = dataDeathsBefore.filter(d => d.country === country);
        const deathsAfter = dataDeathsAfter.filter(d => d.country === country);
        const casesBefore = dataCasesBefore.filter(d => d.country === country);
        const casesAfter = dataCasesAfter.filter(d => d.country === country);

        svgDeaths.selectAll("*").remove();
        svgCases.selectAll("*").remove();

        const xScale = d3.scaleLinear()
                         .domain([0, d3.max([...deathsBefore, ...deathsAfter, ...casesBefore, ...casesAfter], d => d.week)])
                         .range([0, width]);

        const yDeathsScale = d3.scaleLinear()
                               .domain([0, d3.max([...deathsBefore, ...deathsAfter], d => d.weekly_count) * 1.1])
                               .range([height, 0]);

        const yCasesScale = d3.scaleLinear()
                              .domain([0, d3.max([...casesBefore, ...casesAfter], d => d.weekly_count) * 1.1])
                              .range([height, 0]);

        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yDeathsAxis = d3.axisLeft(yDeathsScale).tickFormat(d => {
            if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
            if (d >= 1e3) return (d / 1e3).toFixed(1) + "K";
            return d;
        });
        
        const yCasesAxis = d3.axisLeft(yCasesScale).tickFormat(d => {
            if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
            if (d >= 1e3) return (d / 1e3).toFixed(1) + "K";
            return d;
        });

        svgDeaths.append("g")
                 .attr("transform", `translate(0,${height})`)
                 .call(xAxis)
                 .append("text")
                 .attr("class", "axis-label")
                 .attr("x", width / 2)
                 .attr("y", 40)
                 .attr("fill", "black")
                 .text("Week");

        svgDeaths.append("g")
                 .call(yDeathsAxis)
                 .append("text")
                 .attr("class", "axis-label")
                 .attr("transform", "rotate(-90)")
                 .attr("x", -height / 2)
                 .attr("y", -50)
                 .attr("dy", "1em")
                 .attr("fill", "black")
                 .style("text-anchor", "middle")
                 .text("Weekly Death Count");

        svgCases.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(xAxis)
                .append("text")
                .attr("class", "axis-label")
                .attr("x", width / 2)
                .attr("y", 40)
                .attr("fill", "black")
                .text("Week");

        svgCases.append("g")
                .call(yCasesAxis)
                .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -50)
                .attr("dy", "1em")
                .attr("fill", "black")
                .style("text-anchor", "middle")
                .text("Weekly Case Count");

        const lineDeathsBefore = d3.line()
                                   .x(d => xScale(d.week))
                                   .y(d => yDeathsScale(d.weekly_count))
                                   .curve(d3.curveMonotoneX);

        const lineDeathsAfter = d3.line()
                                  .x(d => xScale(d.week))
                                  .y(d => yDeathsScale(d.weekly_count))
                                  .curve(d3.curveMonotoneX);

        const lineCasesBefore = d3.line()
                                  .x(d => xScale(d.week))
                                  .y(d => yCasesScale(d.weekly_count))
                                  .curve(d3.curveMonotoneX);

        const lineCasesAfter = d3.line()
                                 .x(d => xScale(d.week))
                                 .y(d => yCasesScale(d.weekly_count))
                                 .curve(d3.curveMonotoneX);

        svgDeaths.append("g").attr("class", "grid").call(d3.axisLeft(yDeathsScale).ticks(10).tickSize(-width).tickFormat(""));
        svgCases.append("g").attr("class", "grid").call(d3.axisLeft(yCasesScale).ticks(10).tickSize(-width).tickFormat(""));

                svgDeaths.append("path")
                 .datum(deathsBefore)
                 .attr("class", "line")
                 .attr("stroke", "rgba(31, 119, 180, 0.8)")
                 .attr("d", lineDeathsBefore);

        svgDeaths.append("path")
                 .datum(deathsAfter)
                 .attr("class", "line")
                 .attr("stroke", "rgba(255, 127, 14, 0.8)")
                 .attr("d", lineDeathsAfter);

        svgCases.append("path")
                .datum(casesBefore)
                .attr("class", "line")
                .attr("stroke", "rgba(44, 160, 44, 0.8)")
                .attr("d", lineCasesBefore);

        svgCases.append("path")
                .datum(casesAfter)
                .attr("class", "line")
                .attr("stroke", "rgba(214, 39, 40, 0.8)")
                .attr("d", lineCasesAfter);

        // Legend for deaths chart
        const legendDeaths = svgDeaths.append("g")
                                      .attr("class", "legend")
                                      .attr("transform", `translate(${width - 150}, 20)`);

        legendDeaths.append("text")
                    .attr("x", 20)
                    .attr("y", 10)
                    .attr("fill", "rgba(31, 119, 180, 0.8)")
                    .text("Deaths Before 2021-03-01");

        legendDeaths.append("text")
                    .attr("x", 20)
                    .attr("y", 30)
                    .attr("fill", "rgba(255, 127, 14, 0.8)")
                    .text("Deaths 2021-03-01 onwards");

        // Legend for cases chart
        const legendCases = svgCases.append("g")
                                    .attr("class", "legend")
                                    .attr("transform", `translate(${width - 150}, 20)`);

        legendCases.append("text")
                   .attr("x", 20)
                   .attr("y", 10)
                   .attr("fill", "rgba(44, 160, 44, 0.8)")
                   .text("Cases Before 2021-03-01");

        legendCases.append("text")
                   .attr("x", 20)
                   .attr("y", 30)
                   .attr("fill", "rgba(214, 39, 40, 0.8)")
                   .text("Cases 2021-03-01 onwards");
    }
}).catch(error => console.error(error));

