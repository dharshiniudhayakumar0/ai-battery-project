import requests
import json

try:
    response = requests.get('http://localhost:5000/api/devices')
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        error_data = response.json()
        print("Error:")
        print(error_data.get('error', 'No error message'))
        print("\nTraceback:")
        print(error_data.get('traceback', 'No traceback provided'))
except Exception as e:
    print(f"Request failed: {e}")
