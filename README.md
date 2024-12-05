# CovidStat Visualizer

## Project Overview
CovidStat Visualizer is an interactive web tool built to help users visualize COVID-19 data across EU/EEA region. It allows users to explore statistics such as cases, deaths, and vaccination rates in an engaging, intuitive manner.

## Team Members
- Hima Mynampaty, u1528521, u1528521@utah.edu
- Praneeth Chavva: u1465506, u1465506@utah.edu
- Hemasundar Tatipudi: u1465343, u1465343@utah.edu

---

## Project 

- **Web Page**: [CovidStat Visualizer](https://dataviscourse2024.github.io/group-project-covidstat-visualizer/)
- **Screencast Video**: [Watch Demo](https://www.youtube.com/watch?v=av1WpKiVSVQ)
- **Process Book**: [process book](https://github.com/dataviscourse2024/group-project-covidstat-visualizer/blob/main/Process%20Book.pdf)

---
## Table of Contents
1. [Background and Motivation](#background-and-motivation)
2. [Primary Questions](#primary-questions)
3. [Features](#features)
4. [Installation](#installation-in-your-local-machine)
5. [Resources](#resources)

---
## Background and Motivation
The COVID-19 pandemic has significantly impacted all regions of the world, and understanding the differences in outcomes across countries can provide valuable insights for policy decisions and future health crises. We chose to concentrate on the European Union (EU) and the European Economic Area (EEA) due to the region's diverse pandemic responses, which includes a variety of lockdown measures, vaccination strategies, and testing protocols. This project combines our interests in public health, data visualization, and interactive technologies to create a valuable tool for analyzing COVID-19 trends in these regions. Furthermore, we are motivated by the tool's ability to inform policymakers and health professionals about the efficacy of interventions in mitigating the virus's impact.

## Primary Questions
- How have COVID-19 cases and death rates varied over time in different EU/EEA countries?
- What effect did vaccination campaigns have on reducing cases and deaths in the region?
- How do testing and positivity rates correlate with case and death trends in various countries?
- Which countries responded most effectively, and what factors contributed to their success (e.g., vaccination rates, testing strategies, and government responses)?
- How did the pandemic's waves (e.g., first wave, post-vaccine era) differ regarding case surges and control strategies?

## Features
- **Weekly Deaths and Cases by Country**:
  - **Dropdown Menus:** Users can select countries to display specific data.
  - **Hover Tooltips:** Provide detailed data points for cases, deaths, and vaccination rates.
  - **Highlighted Peaks:** Markers and annotations highlight key events, like vaccination campaigns.
  - **Animated Line Charts:** Smooth animations for drawing trends over time.
- **Government Responses and COVID-19 Case Peaks:**
  - **Checkbox Filters:** Enable selection of intervention types (e.g., lockdowns, mask mandates) with corresponding markers on the chart.
  - **Hover Tooltips:** Reveal details about intervention types, dates, and impacts on cases.
  - **Animated Progression:** Shows the timeline of case trends.
- **Government Response Stringency Index vs. Cases and Deaths:**
  - **Dropdown Menus:** Allow country-specific selection.
  - **Dual Data Representation:** Line graph for stringency index overlaid with bar charts for normalized cases and deaths.
  - **Hover Tooltips:** Provide monthly breakdowns for cases, deaths, and response stringency.
- **Comparing Case Reductions Between Pandemic Waves:**
  - **Bar Chart Grouping:** Visualizes case reductions for different pandemic waves with color-coded stringency levels.
  - **Hover Side Panel:** Displays expanded information about the intervention stringency and wave details.
  - **Country Selection:** Customizable country-specific data.
- **Embedded Screencast Video:** Explains visualization purposes, navigation, and interactive features.

---

## Installation in your local machine

1. Clone the repository:
    ```bash
    git clone https://github.com/dataviscourse2024/group-project-covidstat-visualizer.git

2. Navigate to the project directory:
    ```bash
    cd group-project-covidstat-visualizer

3. Run the web aplication in your local using Python 2 to load all files properly. Run the command in command prompt
    ```bash
    python -m SimpleHTTPServer 8080
4. If you are using Python 3, please run the below command in command prompt
    ```bash
    python -m http.server 8080
5. After the Python command is sucessfull run the below command in any brower to open the web page!
    ```bash
    http://localhost:8080
---

## Resources
- **Libraries Used**:
  - **D3.js**: Used for data manipulation and rendering the SVG elements.
  - **CS**: Stylesheets used to style HTML elements and SVG graphics.
  - **HTML5**: Used for implementing dynamic behaviors, interactions, and event handling.
- **Data Source**: 
  - [Cases and Deaths](https://www.ecdc.europa.eu/en/publications-data/data-national-14-day-notification-rate-covid-19)
  - [Vaccination](https://www.ecdc.europa.eu/en/publications-data/data-covid-19-vaccination-eu-eea)
  - [Testing by week and country](https://www.ecdc.europa.eu/en/publications-data/covid-19-testing)
  - [Response Measures](https://www.ecdc.europa.eu/en/publications-data/download-data-response-measures-covid-19)

---
