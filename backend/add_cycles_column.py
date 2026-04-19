import sqlite3

try:
    conn = sqlite3.connect('ai_battery.db')
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE battery_data ADD COLUMN cycles FLOAT;")
    conn.commit()
    print("Column 'cycles' added successfully.")
    conn.close()
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column 'cycles' already exists.")
    else:
        print(f"Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
