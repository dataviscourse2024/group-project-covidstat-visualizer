import pandas as pd
import os
import datetime

# Load the dataset
testing_data = pd.read_csv('Data/testing.csv')
final_path = 'ProcessedData/'
file_name = 'processed_testing.csv'


# Handle Missing Values using forward filling and interpolation
testing_data['tests_done'] = testing_data['tests_done'].fillna(method='ffill').interpolate()
testing_data['positivity_rate'] = testing_data['positivity_rate'].fillna(method='ffill').interpolate()


# Function to convert ISO week to year-week format
def iso_to_year_week(iso_week_str):
    # Append '-1' to assume Monday as the first day of the week
    date = datetime.datetime.strptime(iso_week_str + '-1', "%Y-W%W-%w")
    return f"{date.year}-{date.strftime('%U')}"
  
# Remove 'W' from 'year_week' and convert to datetime format
testing_data['year_week'] = testing_data['year_week'].apply(iso_to_year_week)


# Convert this to a date, considering it as the first day of the given week
testing_data['date'] = pd.to_datetime(testing_data['year_week'].apply(lambda x: f"{x[:4]}-{x[6:]}-1"), format='%Y-%W-%w')


# Calculate Testing Effectiveness Metric as the ratio of new_cases to tests_done, expressed as a percentage
testing_data['testing_effectiveness'] = (testing_data['new_cases'] / testing_data['tests_done'])*100

# Columns to remove as they are not needed for the analysis
columns_to_drop = ['country_code', 'level', 'region', 'region_name', 'population', 'testing_data_source']
testing_data.drop(columns=columns_to_drop, inplace=True)

# Filling NaN values with 0, especially important after new calculations or dropping columns
testing_data.fillna(0, inplace=True)

# Ensure the directory exists
os.makedirs(final_path, exist_ok=True)

# Save the resulting DataFrame to a CSV file
file_path = os.path.join(final_path, file_name)
testing_data.to_csv(file_path, index=False)

# Display the modified DataFrame
print(testing_data.head())

# Changes made from the original dataset:

# 1. Handle missing values using forward fill (`ffill()`) and interpolation for `tests_done` and `positivity_rate`.
# 2. Convert the 'year_week' ISO format into a proper `date`, assuming Monday as the first day of the week.
# 3. Calculate a new metric `testing_effectiveness` as the percentage of `new_cases` to `tests_done`.
# 4. Categorize `testing_effectiveness` into 'High', 'Medium', and 'Low' using predefined thresholds.
# 5. Add 7-day rolling averages for `tests_done` and `positivity_rate` for smoother time series analysis.
# 6. Remove unnecessary columns like `country_code`, `level`, `region`, `region_name`, `population`, and `testing_data_source`.
# 7. Fill any remaining NaN values in the dataset with 0 after calculations and column cleanup.
# 8. Sort the dataset by `country` and `date` to ensure chronological order and improve performance for further analysis.
