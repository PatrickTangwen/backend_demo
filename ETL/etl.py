from tqdm import tqdm
import pandas as pd
from vital.client import Vital
from vital.environment import VitalEnvironment
from datetime import datetime, timedelta

def get_vital_data(auth_key, user_id, functions, start_date, end_date):
    client = Vital(api_key=auth_key, environment=VitalEnvironment.SANDBOX)
    data = {}

    # Convert start_date and end_date to datetime objects
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    # Define the chunk size (e.g., 7 days)
    chunk_size = timedelta(days=7)
    # Calculate the total number of chunks
    total_chunks = (end_date - start_date).days // 7 + 1
    with tqdm(total=total_chunks, desc="Fetching data") as pbar:
        # Iterate through the date range in chunks of 7 days or less
        current_date = start_date
        while current_date <= end_date:
            # Calculate the end date for the current chunk
            chunk_end_date = min(current_date + chunk_size, end_date)

            # Fetch data for the current chunk
            for func in functions:
                method = getattr(client.vitals, func)
                function_data = method(
                    user_id=user_id,
                    start_date=current_date.strftime("%Y-%m-%d"),
                    end_date=chunk_end_date.strftime("%Y-%m-%d")
                )
                if len(function_data) != 0:
                    # print(func)
                    # print(type(function_data))
                    if func not in data:
                        data[func] = []
                    data[func].extend(function_data)

            # Move to the next chunk
            current_date += chunk_size + timedelta(days=1)  # Increment by 1 day to avoid overlap
            # Update tqdm progress bar
            pbar.update(1)

    return data


def save_to_csv(data, directory):
    for key, value in data.items():
        final_data = pd.DataFrame([vars(item) for item in value])
        filename = f'{directory}/{key}.csv'
        final_data.to_csv(filename, index=False)