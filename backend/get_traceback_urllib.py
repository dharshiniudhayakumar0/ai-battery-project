import urllib.request
import urllib.error
import json

try:
    with urllib.request.urlopen('http://localhost:5000/api/devices') as response:
        print(f"Status: {response.status}")
        print(response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.reason}")
    body = e.read().decode()
    try:
        data = json.loads(body)
        print("\n=== TRACEBACK ===")
        print(data.get('traceback', 'No traceback in JSON'))
        print("=================\n")
    except json.JSONDecodeError:
        print("Raw Body:")
        print(body)
except Exception as e:
    print(f"Error: {e}")
