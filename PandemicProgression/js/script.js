// Set chart dimensions
const width = 1000, height = 600, margin = { top: 60, right: 100, bottom: 80, left: 60 };
const svg = d3.select('.chart').append('svg')
    .attr('width', width)
    .attr('height', height);

// Scales
const xScale = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.2);
const yScaleCases = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const yScaleStringency = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// Line generator for stringency
const lineGenerator = d3.line()
    .x(d => xScale(d.date) + xScale.bandwidth() / 2) // Align with bar centers
    .y(d => yScaleStringency(d.stringency));

const tooltip = d3.select('.tooltip');

// Add a legend
function addLegend() {
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - margin.right + 20}, ${margin.top})`);

    const items = [
        { color: '#36abd6', text: 'Cases' },
        { color: '#df4242', text: 'Deaths' },
        { color: 'orange', text: 'Stringency Index' }
    ];

    items.forEach((item, i) => {
        const group = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`);

        group.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', item.color);

        group.append('text')
            .attr('x', 20)
            .attr('y', 12)
            .style('font-size', '12px')
            .text(item.text);
    });
}

// Normalize cases and deaths
function normalizeData(data) {
    const maxCases = d3.max(data, d => d.cases);
    const maxDeaths = d3.max(data, d => d.deaths);

    data.forEach(d => {
        d.casesNormalized = (d.cases / maxCases) * 100;
        d.deathsNormalized = (d.deaths / maxDeaths) * 100;
    });
}



// Load and process data
d3.csv('data/pandemic_progression.csv').then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
        d.stringency = +d.stringency;
    });

    normalizeData(data); // Normalize cases and deaths

    const countries = Array.from(new Set(data.map(d => d.country)));
    countries.forEach(country => {
        d3.select('#countrySelect').append('option').text(country).attr('value', country);
    });

    function updateChart(selectedCountry) {
        const countryData = data.filter(d => d.country === selectedCountry);

        xScale.domain(countryData.map(d => d.date));
        yScaleCases.domain([0, 100]); // Normalized scale for cases and deaths
        yScaleStringency.domain([20, 100]); // Stringency always between 20–100

        svg.selectAll('*').remove();

        // Add or update the normalized cases bars with animation
        svg.selectAll('.bar.cases')
        .data(countryData)
        .join(
            enter => enter.append('rect')
                .attr('class', 'bar cases')
                .attr('x', d => xScale(d.date))
                .attr('y', height - margin.bottom) // Start from the bottom
                .attr('width', xScale.bandwidth() * 0.4) // Narrower bars
                .attr('height', 0) // Start with zero height
                .attr('fill', 'blue')
                .on('mousemove', function(event, d) {
                    tooltip.style('display', 'block').html(`Month: ${d3.timeFormat('%Y-%m')(d.date)}<br>Cases: ${Math.round(d.cases)}<br>Stringency: ${Math.round(d.stringency)}`);
                    tooltip.style('left', (event.pageX + 5) + 'px').style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', () => tooltip.style('display', 'none'))
                .call(enter =>
                    enter.transition()
                        .duration(1000) // Animation duration
                        .attr('y', d => yScaleCases(d.casesNormalized)) // Animate to correct height
                        .attr('height', d => height - margin.bottom - yScaleCases(d.casesNormalized))
                ),
            update => update.call(update =>
                update.transition()
                    .duration(1000) // Animation duration for updates
                    .attr('x', d => xScale(d.date))
                    .attr('y', d => yScaleCases(d.casesNormalized))
                    .attr('height', d => height - margin.bottom - yScaleCases(d.casesNormalized))
            ),
            exit => exit.call(exit =>
                exit.transition()
                    .duration(500)
                    .attr('height', 0)
                    .attr('y', height - margin.bottom)
                    .remove()
            )
        );

        // Add or update the normalized deaths bars with animation
        svg.selectAll('.bar.deaths')
        .data(countryData)
        .join(
            enter => enter.append('rect')
                .attr('class', 'bar deaths')
                .attr('x', d => xScale(d.date) + xScale.bandwidth() * 0.4) // Offset for side-by-side
                .attr('y', height - margin.bottom) // Start from the bottom
                .attr('width', xScale.bandwidth() * 0.4)
                .attr('height', 0) // Start with zero height
                .attr('fill', 'darkred')
                .on('mousemove', function(event, d) {
                    tooltip.style('display', 'block').html(`Month: ${d3.timeFormat('%Y-%m')(d.date)}<br>Deaths: ${Math.round(d.deaths)}<br>Stringency: ${Math.round(d.stringency)}`);
                    tooltip.style('left', (event.pageX + 5) + 'px').style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', () => tooltip.style('display', 'none'))
                .call(enter =>
                    enter.transition()
                        .duration(1000) // Animation duration
                        .attr('y', d => yScaleCases(d.deathsNormalized)) // Animate to correct height
                        .attr('height', d => height - margin.bottom - yScaleCases(d.deathsNormalized))
                ),
            update => update.call(update =>
                update.transition()
                    .duration(1000) // Animation duration for updates
                    .attr('x', d => xScale(d.date) + xScale.bandwidth() * 0.4)
                    .attr('y', d => yScaleCases(d.deathsNormalized))
                    .attr('height', d => height - margin.bottom - yScaleCases(d.deathsNormalized))
            ),
            exit => exit.call(exit =>
                exit.transition()
                    .duration(500)
                    .attr('height', 0)
                    .attr('y', height - margin.bottom)
                    .remove()
            )
        );

        // Add animation to the stringency line
        svg.selectAll('.line')
        .data([countryData]) // Single line for stringency
        .join(
            enter => enter.append('path')
                .attr('class', 'line')
                .attr('d', lineGenerator)
                .attr('stroke', 'orange')
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('stroke-dasharray', function() { return this.getTotalLength(); }) // Get total line length
                .attr('stroke-dashoffset', function() { return this.getTotalLength(); }) // Start offset at full length
                .call(enter =>
                    enter.transition()
                        .duration(1500) // Animation duration
                        .attr('stroke-dashoffset', 0) // Animate to draw the line
                ),
            update => update.call(update =>
                update.transition()
                    .duration(1000) // Animation duration for updates
                    .attr('d', lineGenerator)
            ),
            exit => exit.remove()
        );


        // X-axis
        svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %Y')))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end');

        // Y-axis for normalized cases and deaths
        svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(yScaleCases));

        // Y-axis for stringency index
        svg.append('g').attr('transform', `translate(${width - margin.right},0)`)
            .call(d3.axisRight(yScaleStringency).ticks(5).tickSize(-width + margin.right + margin.left));

        // Axis labels
        svg.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height - 10)
            .attr('text-anchor', 'middle').text('Month');
        svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)')
            .attr('x', -height / 2).attr('y', 15).attr('text-anchor', 'middle')
            .text('Normalized Cases and Deaths (%)');
        svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(90)')
            .attr('x', height / 2).attr('y', -width + margin.right - 20).attr('text-anchor', 'middle')
            .text('Stringency Index');

        // Add the legend
        addLegend();
    }

    // Initialize with the first country
    updateChart(countries[0]);
    d3.select('#countrySelect').on('change', function() {
        updateChart(this.value);
    });
});
