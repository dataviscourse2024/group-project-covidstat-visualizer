# CovidStat Visualizer

## Project Overview
CovidStat Visualizer is an interactive web tool built to help users visualize COVID-19 data across EU/EEA region. It allows users to explore statistics such as cases, deaths, and vaccination rates in an engaging, intuitive manner.

---

## Project 

- **Web Page**: [CovidStat Visualizer](https://dataviscourse2024.github.io/group-project-covidstat-visualizer/)
- **Screencast Video**: [Watch Demo](https://www.youtube.com/watch?v=av1WpKiVSVQ)

---

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

- **Process Book**: [process book](https://github.com/dataviscourse2024/group-project-covidstat-visualizer/blob/main/Process%20Book.pdf)
- **Data Source**: 
  - [Cases and Deaths](https://www.ecdc.europa.eu/en/publications-data/data-national-14-day-notification-rate-covid-19)
  - [Vaccination](https://www.ecdc.europa.eu/en/publications-data/data-covid-19-vaccination-eu-eea)
  - [Testing by week and country](https://www.ecdc.europa.eu/en/publications-data/covid-19-testing)
  - [Response Measures](https://www.ecdc.europa.eu/en/publications-data/download-data-response-measures-covid-19)

---
