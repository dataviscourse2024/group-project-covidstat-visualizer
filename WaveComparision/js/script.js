const margin = {top: 60, right: 30, bottom: 120, left: 80};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const sidePanel = d3.select("body")
  .append("div")
  .attr("class", "side-panel")
  .style("display", "none")
  .style("position", "absolute")
  .style("width", "250px")
  .style("background-color", "#f4f4f9")
  .style("border", "1px solid #ccc")
  .style("padding", "10px")
  .style("box-shadow", "0px 0px 10px rgba(0, 0, 0, 0.1)");

const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, 100]);

d3.csv("data/modified_pandemic_data.csv").then(function(data) {
  
  function getInterventionDetails(stringency) {
    if (stringency > 50) {
      return "Strict lockdowns, school closures, and travel restrictions.";
    } else if (stringency >= 30) {
      return "Partial lockdowns, mask mandates, and restrictions on public gatherings.";
    } else {
      return "Minimal restrictions, mostly voluntary guidelines.";
    }
  }

  const countries = [...new Set(data.map(d => d.country))];
  const countrySelector = d3.select("#country-selector");

  countrySelector.selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  function updateChart(selectedCountries) {
    const filteredData = data.filter(d => selectedCountries.includes(d.country));

    const formattedData = filteredData.map(d => [
      {
        wave: "First Wave",
        cases: +d.first_wave_cases,
        reduction: +d.absolute_reduction,
        percentage: +d.percentage_reduction,
        stringency: +d.first_wave_stringency,
        duration: +d.first_wave_duration,
        country: d.country,
        intervention: getInterventionDetails(+d.first_wave_stringency)
      },
      {
        wave: "Second Wave",
        cases: +d.second_wave_cases,
        reduction: null,
        percentage: null,
        stringency: +d.second_wave_stringency,
        duration: +d.second_wave_duration,
        country: d.country,
        intervention: getInterventionDetails(+d.second_wave_stringency)
      }
    ]).flat();

    const xScale = d3.scaleBand()
      .domain(formattedData.map(d => `${d.country} - ${d.wave}`))
      .range([0, width])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(formattedData, d => d.cases)])
      .range([height, 0]);
    
    svg.selectAll("*").remove();  

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-weight", "bold");

    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 40)
      .attr("text-anchor", "middle")
      .text("Pandemic Waves by Country");

    svg.append("g")
      .call(d3.axisLeft(yScale).ticks(10))
      .selectAll("text")
      .style("font-size", "12px");

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${-margin.left / 1.5},${height / 2})rotate(-90)`)
      .text("Total Cases Reduced");

    const bars = svg.selectAll(".bar")
      .data(formattedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(`${d.country} - ${d.wave}`))
      .attr("y", height) 
      .attr("width", xScale.bandwidth())
      .attr("height", 0) 
      .attr("fill", d => colorScale(d.stringency))
      .on("mouseover", (event, d) => {
        sidePanel.style("display", "block")
          .style("left", (event.pageX + 20) + "px")
          .style("top", (event.pageY - 50) + "px")
          .html(`
            <h3>${d.country} - ${d.wave}</h3>
            <p><strong>Total Cases:</strong> ${d.cases}</p>
            <p><strong>Cases Reduced:</strong> ${d.reduction || 'N/A'}</p>
            <p><strong>Reduction Percentage:</strong> ${d.percentage || 'N/A'}%</p>
            <p><strong>Stringency Level:</strong> ${d.stringency}</p>
            <p><strong>Intervention Duration:</strong> ${d.duration} days</p>
            <p><strong>Interventions:</strong> ${d.intervention}</p>
          `);
      })
      .on("mouseout", () => {
        sidePanel.style("display", "none");
      })
      .on("click", (event, d) => {
        d3.select("#intervention-details").html(`Wave: ${d.wave}<br>Cases: ${d.cases}<br>Reduction: ${d.reduction || 'N/A'}<br>Stringency: ${d.stringency}`);
        d3.select("#intervention-modal").style("display", "block");
      });

    bars.transition()
      .duration(750)
      .attr("y", d => yScale(d.cases))
      .attr("height", d => height - yScale(d.cases));

    svg.selectAll(".text")
      .data(formattedData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => xScale(`${d.country} - ${d.wave}`) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.cases) - 10)
      .attr("text-anchor", "middle")
      .text(d => d.percentage ? `${d.percentage}%` : "");

    const legendData = [
      { label: "Low Stringency", value: 30 },
      { label: "Medium Stringency", value: 60 },
      { label: "High Stringency", value: 100 }
    ];
    
    const legend = svg.selectAll(".legend")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => colorScale(d.value));

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(d => d.label);
  }

  d3.select(".close").on("click", () => {
    d3.select("#intervention-modal").style("display", "none");
  });

  updateChart([countries[0]]);

  countrySelector.on("change", function() {
    const selectedCountries = Array.from(d3.select(this).property("selectedOptions"), option => option.value);
    updateChart(selectedCountries);
  });
});
