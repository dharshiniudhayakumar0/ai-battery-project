import sqlite3

try:
    conn = sqlite3.connect('ai_battery.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, created_at FROM devices;")
    rows = cursor.fetchall()
    print(f"Devices found: {len(rows)}")
    for row in rows:
        print(f"ID: {row[0]}, Name: {row[1]}, CreatedAt: {row[2]}, Type: {type(row[2])}")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
