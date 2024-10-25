// Set chart dimensions
const width = 900, height = 500, margin = { top: 40, right: 80, bottom: 60, left: 60 };
const svg = d3.select('.chart').append('svg')
    .attr('width', width)
    .attr('height', height);

// Scales and axes
const xScale = d3.scaleTime().range([margin.left, width - margin.right]);
const yScaleCases = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const yScaleStringency = d3.scaleLinear().range([height - margin.bottom, margin.top]);

// Line and bar generators
const lineGenerator = d3.line().x(d => xScale(d.date)).y(d => yScaleStringency(d.stringency_score));
const tooltip = d3.select('.tooltip');

// Load and process data
d3.csv('data/Final_Preprocessed_Data.csv').then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.weekly_count = +d.weekly_count;
        d.stringency_score = +d.stringency_score;
    });

    const countries = Array.from(new Set(data.map(d => d.country)));
    countries.forEach(country => {
        d3.select('#countrySelect').append('option').text(country).attr('value', country);
    });

    function updateChart(selectedCountry) {
        const countryData = data.filter(d => d.country === selectedCountry);
        const casesData = countryData.filter(d => d.indicator === 'cases');
        const deathsData = countryData.filter(d => d.indicator === 'deaths');

        xScale.domain(d3.extent(countryData, d => d.date));
        yScaleCases.domain([0, d3.max(casesData, d => d.weekly_count) * 1.1]);
        yScaleStringency.domain([0, 100]);

        svg.selectAll('*').remove();

        // Draw cases bars
        svg.selectAll('.bar.cases').data(casesData).enter().append('rect')
            .attr('class', 'bar cases')
            .attr('x', d => xScale(d.date) - 5)
            .attr('y', d => yScaleCases(d.weekly_count))
            .attr('width', 10)
            .attr('height', d => height - margin.bottom - yScaleCases(d.weekly_count))
            .attr('fill', '#1f77b4')
            .on('mousemove', function(event, d) {
                tooltip.style('display', 'block').html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Cases: ${d.weekly_count}`);
                tooltip.style('left', (event.pageX + 5) + 'px').style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => tooltip.style('display', 'none'));

        // Draw deaths bars
        svg.selectAll('.bar.deaths').data(deathsData).enter().append('rect')
            .attr('class', 'bar deaths')
            .attr('x', d => xScale(d.date) - 5)
            .attr('y', d => yScaleCases(d.weekly_count))
            .attr('width', 10)
            .attr('height', d => height - margin.bottom - yScaleCases(d.weekly_count))
            .attr('fill', '#d62728')
            .on('mousemove', function(event, d) {
                tooltip.style('display', 'block').html(`Date: ${d3.timeFormat('%Y-%m-%d')(d.date)}<br>Deaths: ${d.weekly_count}`);
                tooltip.style('left', (event.pageX + 5) + 'px').style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => tooltip.style('display', 'none'));

        // Draw stringency line
        svg.append('path').datum(countryData)
            .attr('class', 'line')
            .attr('d', lineGenerator)
            .attr('stroke', '#ff7f0e')
            .attr('fill', 'none');

        // X-axis
        svg.append('g').attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %Y')));

        // Y-axis for cases and deaths
        svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(yScaleCases));

        // Y-axis for stringency index
        svg.append('g').attr('transform', `translate(${width - margin.right},0)`)
            .call(d3.axisRight(yScaleStringency));

        // Axis labels
        svg.append('text').attr('class', 'axis-label').attr('x', width / 2).attr('y', height - 10)
            .attr('text-anchor', 'middle').text('Date');
        svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(-90)')
            .attr('x', -height / 2).attr('y', 15).attr('text-anchor', 'middle')
            .text('Cases and Deaths');
        svg.append('text').attr('class', 'axis-label').attr('transform', 'rotate(90)')
            .attr('x', height / 2).attr('y', -width + margin.right + 40).attr('text-anchor', 'middle')
            .text('Stringency Index');
    }

    // Initialize with first country
    updateChart(countries[0]);
    d3.select('#countrySelect').on('change', function() {
        updateChart(this.value);
    });
});
