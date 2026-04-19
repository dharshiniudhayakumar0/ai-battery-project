import urllib.request
import urllib.error
import json

try:
    with urllib.request.urlopen('http://localhost:5000/api/devices') as response:
        status = response.getcode()
        body = response.read().decode()
        print(f"Status Code: {status}")
        print(f"Response: {body}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    print(f"Body: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
