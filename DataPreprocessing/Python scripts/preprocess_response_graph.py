import pandas as pd
import os

# Load the dataset from the provided file path
response_data = pd.read_csv('Data/response_graphs_data_2022-08-25.csv')
final_path = 'ProcessedData/'
file_name = 'processed_response_graph.csv'

# List of EU/EEA countries
eu_eea_countries = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark",
    "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy",
    "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal",
    "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Iceland", "Liechtenstein", "Norway"
]

# Filter the dataset for EU/EEA countries
filtered_data = response_data[response_data['Country'].isin(eu_eea_countries)].copy()

# Convert date columns into the proper date format
filtered_data['date_start'] = pd.to_datetime(filtered_data['date_start'])
filtered_data['date_end'] = pd.to_datetime(filtered_data['date_end'], errors='coerce')

# Fill missing 'date_end' by using the last date present in the dataset
last_date_present = filtered_data['date_end'].max()
# Avoid chained assignment by using loc to set values directly
filtered_data.loc[filtered_data['date_end'].isna(), 'date_end'] = last_date_present


# Define the weights for interventions
intervention_weights = {
    'StayHomeOrder': 1.0, 'StayHomeOrderPartial': 0.5,
    'RegionalStayHomeOrder': 0.9, 'RegionalStayHomeOrderPartial': 0.45,
    'WorkplaceClosures': 0.8, 'WorkplaceClosuresPartial': 0.4,
    'ClosureOfPublicTransport': 0.7, 'ClosureOfPublicTransportPartial': 0.35,
    'QuarantineForInternationalTravellers': 0.6, 'QuarantineForInternationalTravellersPartial': 0.3,
    'MasksMandatoryAllSpaces': 0.85, 'MasksMandatoryAllSpacesPartial': 0.425,
    'BanOnAllEvents': 0.75, 'BanOnAllEventsPartial': 0.375,
    'PrivateGatheringRestrictions': 0.6, 'PrivateGatheringRestrictionsPartial': 0.3,
    'NonEssentialShops': 0.55, 'NonEssentialShopsPartial': 0.275
}

# Default weight for interventions not explicitly listed
default_weight = 0.2

# Calculate stringency index
def calculate_stringency(row):
    intervention_type = row['Response_measure']
    weight = intervention_weights.get(intervention_type, default_weight)
    return weight

# Apply stringency score calculation
filtered_data['stringency_score'] = filtered_data.apply(calculate_stringency, axis=1)

# Normalize stringency scores to 0-100 range
max_score = filtered_data['stringency_score'].max()
filtered_data['stringency_score'] = (filtered_data['stringency_score'] / max_score) * 100

# Calculate duration of interventions
filtered_data['intervention_duration'] = (filtered_data['date_end'] - filtered_data['date_start']).dt.days

# Aggregate stringency score by country and date to get a total stringency index per day
aggregated_data = filtered_data.groupby(['Country', 'date_start'])['stringency_score'].sum().reset_index()

# Expanded intervention categories dictionary
intervention_categories = {
    'StayHomeOrder': 'Lockdown', 'StayHomeOrderPartial': 'Lockdown',
    'RegionalStayHomeOrder': 'Lockdown', 'RegionalStayHomeOrderPartial': 'Lockdown',
    'WorkplaceClosures': 'Workplace', 'WorkplaceClosuresPartial': 'Workplace',
    'ClosureOfPublicTransport': 'Transport', 'ClosureOfPublicTransportPartial': 'Transport',
    'QuarantineForInternationalTravellers': 'Travel', 'QuarantineForInternationalTravellersPartial': 'Travel',
    'MasksMandatoryAllSpaces': 'Masks', 'MasksMandatoryAllSpacesPartial': 'Masks',
    'MasksMandatoryClosedSpaces': 'Masks', 'MasksMandatoryClosedSpacesPartial': 'Masks',
    'MasksVoluntaryAllSpaces': 'Masks', 'MasksVoluntaryAllSpacesPartial': 'Masks',
    'MasksVoluntaryClosedSpaces': 'Masks', 'MasksVoluntaryClosedSpacesPartial': 'Masks',
    'BanOnAllEvents': 'Events', 'BanOnAllEventsPartial': 'Events',
    'RestaurantsCafes': 'Business', 'RestaurantsCafesPartial': 'Business',
    'ClosDaycare': 'Education', 'ClosDaycarePartial': 'Education',
    'ClosHigh': 'Education', 'ClosHighPartial': 'Education',
    'ClosPrim': 'Education', 'ClosPrimPartial': 'Education',
    'ClosSec': 'Education', 'ClosSecPartial': 'Education',
    'ClosPubAny': 'Public Space', 'ClosPubAnyPartial': 'Public Space',
    'EntertainmentVenues': 'Public Space', 'EntertainmentVenuesPartial': 'Public Space',
    'GymsSportsCentres': 'Public Space', 'GymsSportsCentresPartial': 'Public Space',
    'HotelsOtherAccommodation': 'Business', 'HotelsOtherAccommodationPartial': 'Business',
    'IndoorOver100': 'Gathering', 'IndoorOver1000': 'Gathering', 'IndoorOver50': 'Gathering', 'IndoorOver500': 'Gathering',
    'OutdoorOver100': 'Gathering', 'OutdoorOver1000': 'Gathering', 'OutdoorOver50': 'Gathering', 'OutdoorOver500': 'Gathering',
    'PlaceOfWorship': 'Public Space', 'PlaceOfWorshipPartial': 'Public Space',
    'PrivateGatheringRestrictions': 'Gathering', 'PrivateGatheringRestrictionsPartial': 'Gathering',
    'SocialCircle': 'Social Distancing', 'SocialCirclePartial': 'Social Distancing',
    'Teleworking': 'Workplace', 'TeleworkingPartial': 'Workplace',
    'AdaptationOfWorkplace': 'Workplace', 'AdaptationOfWorkplacePartial': 'Workplace',
    'StayHomeRiskG': 'Lockdown', 'StayHomeRiskGPartial': 'Lockdown',
    'StayHomeGen': 'Lockdown', 'StayHomeGenPartial': 'Lockdown',
    'NonEssentialShops': 'Business', 'NonEssentialShopsPartial': 'Business',
    'MassGather50': 'Gathering', 'MassGather50Partial': 'Gathering',
    'MassGatherAll': 'Gathering', 'MassGatherAllPartial': 'Gathering'
}

# Apply categories and assign 'Other' for unmatched types
filtered_data['intervention_category'] = filtered_data['Response_measure'].map(intervention_categories).fillna('Other')

def categorize_stringency(score):
    if score >= 75:
        return 'High'
    elif score >= 50:
        return 'Medium'
    else:
        return 'Low'

# Apply the categorization function to the stringency score
filtered_data['stringency_category'] = filtered_data['stringency_score'].apply(categorize_stringency)


# Ensure the directory exists
os.makedirs(final_path, exist_ok=True)

# Save the resulting DataFrame to a CSV file
file_path = os.path.join(final_path, file_name)
filtered_data.to_csv(file_path, index=False)


# Display the first few rows of the processed data
print(filtered_data.head())



'''

1. Country Filtering: 
   - Filtered dataset to include only EU/EEA countries based on a predefined list.

2. Date Conversion:
   - Converted `date_start` and `date_end` columns to proper datetime format for date-based analysis.

3. Handling Missing `date_end` Values:
   - Filled missing `date_end` values with the latest `date_end` available in the dataset.

4. Stringency Score Calculation:
   - Added a `stringency_score` column to represent the severity of each intervention.
   - Assigned predefined weights to interventions (between 0 and 1) based on intervention type.
   - Applied a default weight of 0.2 for interventions not explicitly listed.

5. Stringency Score Normalization:
   - Scaled `stringency_score` values to a range of 0 to 100 for consistency across interventions.

6. Intervention Duration Calculation:
   - Added `intervention_duration` column to calculate the number of days each intervention lasted (`date_end` - `date_start`).

7. Intervention Category Assignment:
   - Added `intervention_category` column to classify each intervention into broader categories (e.g., `Lockdown`, `Masks`, `Gathering`).
   - Expanded the category mapping to include more intervention types.
   - Assigned `"Other"` category for any interventions not explicitly categorized.

8. Aggregated Stringency Data:
   - Created an additional aggregated DataFrame (`aggregated_data`) with daily stringency scores by summing `stringency_score` for each country and date.

9. Categorizing Intervention Severity
    - categorize the stringency scores into severity levels (e.g., Low, Medium, High).
'''