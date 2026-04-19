import urllib.request
import urllib.error
import json
import codecs

with codecs.open("traceback_output.txt", "w", "utf-8") as f:
    try:
        with urllib.request.urlopen('http://localhost:5000/api/devices') as response:
            f.write(f"Status: {response.status}\n")
            f.write(response.read().decode() + "\n")
    except urllib.error.HTTPError as e:
        f.write(f"HTTP Error {e.code}: {e.reason}\n")
        body = e.read().decode()
        try:
            data = json.loads(body)
            f.write("\n=== TRACEBACK ===\n")
            f.write(data.get('traceback', 'No traceback in JSON'))
            f.write("\n=================\n")
        except json.JSONDecodeError:
            f.write("Raw Body:\n")
            f.write(body + "\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
