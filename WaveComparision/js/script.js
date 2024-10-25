// Set dimensions for the SVG container
const margin = {top: 40, right: 30, bottom: 100, left: 60};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG element
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the data
d3.csv("data/pandemic_data.csv").then(function(data) {

  console.log(data);
  // Prepare the data
  const caseData = data.filter(d => d.indicator === "cases");
  // Aggregate data by country and pandemic wave
  const nestedData = d3.rollups(caseData, v => d3.sum(v, d => +d.weekly_count), d => d.country, d => d.pandemic_wave);
  
  // Format the data for easy chart creation
  const formattedData = nestedData.map(([country, waves]) => {
    const firstWave = waves.find(d => d[0] === "First Wave") ? waves.find(d => d[0] === "First Wave")[1] : 0;
    const secondWave = waves.find(d => d[0] === "Second Wave") ? waves.find(d => d[0] === "Second Wave")[1] : 0;
    return { country, firstWave, secondWave };
  });
  console.log(formattedData);

  // Create scales for X and Y axis
  const xScale = d3.scaleBand()
    .domain(formattedData.map(d => d.country))
    .range([0, width])
    .padding(0.2);
  
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(formattedData, d => Math.max(d.firstWave, d.secondWave))])
    .range([height, 0]);

  // Add X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Add Y axis
  svg.append("g")
    .call(d3.axisLeft(yScale));

  // Add bars for First Wave
  svg.selectAll(".bar.first-wave")
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("class", "bar first-wave")
    .attr("x", d => xScale(d.country))
    .attr("y", d => yScale(d.firstWave))
    .attr("width", xScale.bandwidth() / 2)
    .attr("height", d => height - yScale(d.firstWave))
    .attr("fill", "#69b3a2");

  // Add bars for Second Wave
  svg.selectAll(".bar.second-wave")
    .data(formattedData)
    .enter()
    .append("rect")
    .attr("class", "bar second-wave")
    .attr("x", d => xScale(d.country) + xScale.bandwidth() / 2)
    .attr("y", d => yScale(d.secondWave))
    .attr("width", xScale.bandwidth() / 2)
    .attr("height", d => height - yScale(d.secondWave))
    .attr("fill", "#404080");

  // Add legend
  svg.append("text")
    .attr("x", width - 150)
    .attr("y", 20)
    .attr("class", "legend")
    .style("fill", "#69b3a2")
    .text("First Wave");

  svg.append("text")
    .attr("x", width - 150)
    .attr("y", 40)
    .attr("class", "legend")
    .style("fill", "#404080")
    .text("Second Wave");
  
});
