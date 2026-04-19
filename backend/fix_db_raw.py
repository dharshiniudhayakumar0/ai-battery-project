import sqlite3
from datetime import datetime

try:
    conn = sqlite3.connect('ai_battery.db')
    cursor = conn.cursor()
    now_str = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f')
    cursor.execute("UPDATE devices SET created_at = ? WHERE created_at IS NULL;", (now_str,))
    print(f"Updated {cursor.rowcount} rows")
    conn.commit()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
