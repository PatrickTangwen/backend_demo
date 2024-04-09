import json
from etl import get_vital_data, save_to_csv
import os
import pandas as pd
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def main():
    print("program is running")
    with open('config.json') as json_file:
        config = json.load(json_file)
    
    auth_key = config['auth_key']
    user_id = config['user_id']
    functions = config['functions']
    start_date = config['start_date']
    end_date = config['end_date']
    directory = config['directory']
    data = get_vital_data(auth_key, user_id, functions, start_date, end_date)
    print(f"data is updated!") 
    save_to_csv(data, directory)

    def list_files_with_paths(folder_path):
        files_list = []
        for root, dirs, files in os.walk(folder_path):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                files_list.append(file_path)
        return files_list

    folder_path = 'vital_csvs'
    files_with_paths = list_files_with_paths(folder_path)

    uri = config['uri']

    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)

    mydb = client['med-dash-user-data']

    # Iterate over files and collections using the mapped names
    for file_path in files_with_paths:
        # Extract file name
        file_name = os.path.basename(file_path)
        collection_name = file_name[:-4]
        # Read CSV file into a DataFrame
        df = pd.read_csv(file_path)
        print(file_path," -> ",collection_name)
        # Get the collection
        collection = mydb[collection_name]
        # Convert DataFrame to dictionary for MongoDB insertion
        data = df.to_dict(orient='records')
        # Drop existing collection
        collection.drop()
        # Insert new data into MongoDB Atlas collection
        collection.insert_many(data)
        # Close the connection
    client.close()
    print("Data uploaded to MongoDB Atlas successfully.")

   
if __name__ == "__main__":
    main()
