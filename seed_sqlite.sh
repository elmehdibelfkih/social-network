#!/usr/bin/env bash
# ---------------------------------------------------------
# seed_sqlite.sh  —  Auto-generate fake data for SQLite DB
# Usage:
#   ./seed_sqlite.sh db.sqlite [ROWS_PER_TABLE] [--truncate] [--seed N]
# Example:
#   ./seed_sqlite.sh dev.db 100 --truncate --seed 42
# ---------------------------------------------------------

set -euo pipefail

DB_FILE="${1:-}"
if [[ -z "$DB_FILE" ]]; then
  echo "Usage: $0 DB_FILE [ROWS_PER_TABLE] [--truncate] [--seed N]"
  exit 1
fi

ROWS_PER_TABLE="${2:-50}"
TRUNCATE=false
SEED=42

shift || True
shift || True
while (( "$#" )); do
  case "$1" in
    --truncate) TRUNCATE=True; shift ;;
    --seed) SEED="${2:-$SEED}"; shift 2 ;;
    *) shift ;;
  esac
done

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required but was not found."
  exit 2
fi

python - <<PY
import sqlite3, sys, random, re, os, string
from datetime import datetime, timedelta

DB_FILE = os.path.abspath("$DB_FILE")
ROWS_PER_TABLE = int("$ROWS_PER_TABLE")
TRUNCATE = ${TRUNCATE}
SEED = int("$SEED")

random.seed(SEED)

try:
    from faker import Faker
    fake = Faker()
    Faker.seed(SEED)
    have_faker = True
except Exception:
    fake = None
    have_faker = False

conn = sqlite3.connect(DB_FILE)
conn.execute("PRAGMA foreign_keys=OFF;")
cur = conn.cursor()

cur.execute("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
tables = cur.fetchall()
if not tables:
    print("No tables found in", DB_FILE)
    sys.exit(0)

# ---------- Helper Generators ----------

def gen_int(col):
    if re.search(r'id$', col, re.I):
        return random.randint(1, max(100, ROWS_PER_TABLE))
    return random.randint(0, 10000)

def gen_real():
    return round(random.random() * 10000, 3)

def gen_blob():
    return sqlite3.Binary(bytes(random.randint(0,255) for _ in range(8)))

def gen_text(col):
    lc = col.lower()
    if have_faker:
        if "email" in lc: return fake.unique.email()
        if "username" in lc or "user" in lc: return fake.unique.user_name()
        if "name" in lc: return fake.name()
        if "title" in lc: return fake.sentence(nb_words=5)
        if "desc" in lc or "bio" in lc or "content" in lc: return fake.paragraph()
        if "city" in lc: return fake.city()
        if "country" in lc: return fake.country()
        if "phone" in lc: return fake.phone_number()
        if "uuid" in lc: return fake.uuid4()
        if "date" in lc or "time" in lc: return fake.date_time_between(start_date="-2y", end_date="now").isoformat()
        return fake.word()
    else:
        base = ''.join(random.choices(string.ascii_lowercase, k=8))
        if "email" in lc: return f"{base}@example.com"
        if "name" in lc: return base.title()
        return f"Text_{base}"

def gen_check_value(col_name, create_sql):
    """Parse CHECK constraints like privacy IN ('public','private')."""
    pattern = rf"{col_name}[^,]*CHECK\s*\([^)]*IN\s*\(([^)]+)\)\)"
    m = re.search(pattern, create_sql, re.IGNORECASE)
    if not m:
        pattern2 = rf"CHECK\s*\(\s*{col_name}\s+IN\s*\(([^)]+)\)\)"
        m = re.search(pattern2, create_sql, re.IGNORECASE)
    if not m:
        return None
    values = re.findall(r"'([^']+)'", m.group(1))
    if not values:
        return None
    return random.choice(values)

def make_value(col_name, col_type, notnull, default, create_sql):
    check_val = gen_check_value(col_name, create_sql)
    if check_val is not None:
        return check_val

    t = (col_type or "").upper()
    if "INT" in t:
        return gen_int(col_name)
    if any(x in t for x in ["CHAR", "TEXT", "CLOB"]) or t == "":
        return gen_text(col_name)
    if any(x in t for x in ["REAL", "FLOA", "DOUB"]):
        return gen_real()
    if "BLOB" in t:
        return gen_blob()
    if "DATE" in t or "TIME" in t:
        dt = datetime.now() - timedelta(days=random.randint(0, 730))
        return dt.isoformat()
    return gen_text(col_name)

# ---------- Main Seeding ----------

if TRUNCATE:
    for tbl, _ in tables:
        print("Truncating", tbl)
        cur.execute(f'DELETE FROM "{tbl}";')
    conn.commit()

for tbl, create_sql in tables:
    if tbl == "schema_migrations":
        continue

    print("Seeding table:", tbl)
    cur.execute(f"PRAGMA table_info('{tbl}')")
    cols_info = cur.fetchall()
    if not cols_info:
        continue

    # detect unique columns
    cur.execute(f"PRAGMA index_list('{tbl}')")
    unique_cols = set()
    for idx_name, unique, *_ in cur.fetchall():
        if unique:
            cur.execute(f"PRAGMA index_info('{idx_name}')")
            unique_cols.update([r[2] for r in cur.fetchall()])

    decl_types = {c[1]: c[2] for c in cols_info}
    notnulls = {c[1]: bool(c[3]) for c in cols_info}
    pk_cols = [c[1] for c in cols_info if c[5]]
    has_rowid_pk = len(pk_cols) == 1 and decl_types.get(pk_cols[0], "").upper() == "INTEGER"

    cols_to_insert = [c[1] for c in cols_info if not (has_rowid_pk and c[1] in pk_cols)]
    if not cols_to_insert:
        print("  all  PK — skipping")
        continue

    placeholders = ",".join("?" for _ in cols_to_insert)
    col_list = ",".join(f'"{c}"' for c in cols_to_insert)
    insert_sql = f'INSERT INTO "{tbl}" ({col_list}) VALUES ({placeholders})'

    seen_uniques = {c: set() for c in unique_cols}
    batch = []
    for _ in range(ROWS_PER_TABLE):
        row = []
        for cn in cols_to_insert:
            val = make_value(cn, decl_types.get(cn, ""), notnulls.get(cn, False), None, create_sql)
            # enforce uniqueness
            if cn in unique_cols:
                tries = 0
                while val in seen_uniques[cn] and tries < 50:
                    val = make_value(cn, decl_types.get(cn, ""), notnulls.get(cn, False), None, create_sql)
                    tries += 1
                seen_uniques[cn].add(val)
            row.append(val)
        batch.append(tuple(row))

        if len(batch) >= 500:
            try:
                cur.executemany(insert_sql, batch)
                conn.commit()
                batch = []
            except sqlite3.IntegrityError as e:
                print(f"  Skipping some rows due to integrity error: {e}")
                batch = []

    if batch:
        try:
            cur.executemany(insert_sql, batch)
            conn.commit()
        except sqlite3.IntegrityError as e:
            print(f"  Skipping some rows due to integrity error: {e}")

print("✅ Seeding completed for", DB_FILE)
cur.close()
conn.close()
PY

echo "Done. Seeded $DB_FILE (rows per table=$ROWS_PER_TABLE, truncate=$TRUNCATE, seed=$SEED)"
