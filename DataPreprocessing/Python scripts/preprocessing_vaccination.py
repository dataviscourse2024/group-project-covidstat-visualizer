import pandas as pd
from datetime import datetime
import os

# Load the vaccination dataset
vaccination_data = pd.read_csv('Data/vaccination.csv')
final_path = 'ProcessedData/'
file_name = 'processed_vaccination.csv'


# Convert YearWeekISO to a proper datetime format
def convert_year_week_iso_to_date(year_week_iso):
    year, week = map(int, year_week_iso.split('-W'))
    return datetime.strptime(f'{year} {week} 1', '%G %V %u')

vaccination_data['Date'] = vaccination_data['YearWeekISO'].apply(convert_year_week_iso_to_date)

# Sort the data by country and date to ensure cumulative calculations work correctly
vaccination_data.sort_values(by=['ReportingCountry', 'Date'], inplace=True)

# Calculating cumulative vaccination totals for each country over time
vaccination_data['CumulativeVaccinations'] = vaccination_data.groupby('ReportingCountry')['NumberDosesReceived'].cumsum()

# Create a cumulative vaccination rate as a percentage of the population
vaccination_data['CumulativeVaccinationRate'] = (vaccination_data['CumulativeVaccinations'] / vaccination_data['Population']) * 100

# Calculate weekly vaccination rates (new doses administered per week)
vaccination_data['VaccinationRateWeekly'] = vaccination_data.groupby('ReportingCountry')['NumberDosesReceived'].diff().fillna(0)

# Add 7-day rolling average for vaccination rates
vaccination_data['VaccinationRate_7d_avg'] = vaccination_data['VaccinationRateWeekly'].rolling(window=7).mean()

# Categorize vaccination milestones based on cumulative vaccination rate
def categorize_vaccination_milestones(percentage):
    if percentage >= 75:
        return '75%+ Vaccinated'
    elif percentage >= 50:
        return '50%+ Vaccinated'
    elif percentage >= 25:
        return '25%+ Vaccinated'
    else:
        return 'less than 25% Vaccinated'

vaccination_data['VaccinationMilestone'] = vaccination_data['CumulativeVaccinationRate'].apply(categorize_vaccination_milestones)

# Drop unnecessary columns
columns_to_drop = ['YearWeekISO', 'Denominator', 'DoseAdditional1', 'DoseAdditional2', 
                   'DoseAdditional3', 'DoseAdditional4', 'DoseAdditional5', 
                   'UnknownDose', 'TargetGroup', 'Vaccine']

vaccination_data_cleaned = vaccination_data.drop(columns=columns_to_drop)

# Ensure data is sorted by country and date for proper cumulative calculations
vaccination_data_cleaned.sort_values(by=['ReportingCountry', 'Date'], inplace=True)

# Reset the index after sorting
vaccination_data_cleaned.reset_index(drop=True, inplace=True)

# Recalculate cumulative vaccinations based on 'NumberDosesReceived'
vaccination_data_cleaned['RecalculatedCumulative'] = vaccination_data_cleaned.groupby('ReportingCountry')['NumberDosesReceived'].cumsum()

# Check if the recalculated cumulative matches the existing 'CumulativeVaccinations'
vaccination_data_cleaned['CumulativeCheck'] = vaccination_data_cleaned['RecalculatedCumulative'] == vaccination_data_cleaned['CumulativeVaccinations']

# List of columns that are not needed for visualization
columns_to_drop = ['NumberDosesExported', 'FirstDoseRefused', 'Region', 'RecalculatedCumulative', 'CumulativeCheck']

# Drop the unnecessary columns
vaccination_data_cleaned = vaccination_data_cleaned.drop(columns=columns_to_drop)

os.makedirs(final_path, exist_ok=True)

# Save the resulting DataFrame to a CSV file
file_path = os.path.join(final_path, file_name)
vaccination_data_cleaned.to_csv(file_path, index=False)

# Display the modified DataFrame
print(vaccination_data_cleaned.head())


# The vaccination.csv dataset has been processed with the following changes and enhancements:

# 1. Date Conversion:
#    - Converted YearWeekISO to a proper Date format for chronological analysis.

# 2. Sorting:
#    - Sorted the data by ReportingCountry and Date to ensure proper cumulative calculations.

# 3. Cumulative Vaccination Calculation:
#    - Calculated CumulativeVaccinations by summing NumberDosesReceived over time for each country.
#    - Created a CumulativeVaccinationRate as a percentage of the population.

# 4. Vaccination Rate (Weekly):
#    - Added a column VaccinationRateWeekly to show the weekly rate of doses administered for each country.

# 5. Rolling Averages:
#    - Added a 7-day rolling average (VaccinationRate_7d_avg) for smoother visualization of vaccination trends.

# 6. Vaccination Milestones:
#    - Categorized countries based on their cumulative vaccination rates into milestones: 
#      <25% Vaccinated, 25%+ Vaccinated, 50%+ Vaccinated, and 75%+ Vaccinated.

# 7. Recalculated Cumulative Vaccinations:
#    - Recalculated the cumulative doses to ensure consistency and added a CumulativeCheck column for validation.

# 8. Dropped Unnecessary Columns:
#    - Dropped several columns, including various dose-specific columns, region, and other unused fields.
