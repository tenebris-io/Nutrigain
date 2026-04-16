"""
scripts/scrape_menus.py
-----------------------
Scrapes live OSU dining menus from the Nutrislice API and writes two files
into src/data/ that the Nutrigain app consumes directly:

  src/data/menuData.js   — DINING_HALLS + MENU_ITEMS (replaces mock values)
  src/data/menus.json    — raw structured JSON (for debugging / future use)

Usage (run from the project root):

    # Today's menus:
    python scripts/scrape_menus.py

    # Specific date:
    python scripts/scrape_menus.py --date 2026-04-16

    # Week range:
    python scripts/scrape_menus.py --start 2026-04-14 --end 2026-04-20

Requirements:
    pip install requests
"""

import argparse
import json
import sys
import time
from datetime import date, datetime, timedelta
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR  = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR    = PROJECT_DIR / "src" / "data"

# ---------------------------------------------------------------------------
# Nutrislice API config
# ---------------------------------------------------------------------------

BASE_URL = (
    "https://osu.api.nutrislice.com/menu/api/weeks/school"
    "/{location}/menu-type/{meal}/{date}/"
)

# OSU Traditions locations — maps Nutrislice slugs → app hall IDs + metadata
LOCATIONS = {
    "traditions-at-kennedy": {
        "hall_id":       "kennedy",
        "display_name":  "Kennedy Commons",
        "location_desc": "North Campus",
        "distance":      "0.5 mi",
        "hours":         "7:00 AM – 8:00 PM",
        "lat":           40.0074,
        "lng":           -83.0300,
        "meals": {
            "breakfast": "Breakfast",
            "lunch":     "Lunch/Dinner",
        },
    },
    "traditions-at-scott": {
        "hall_id":       "scott",
        "display_name":  "Scott House",
        "location_desc": "North Campus",
        "distance":      "0.6 mi",
        "hours":         "7:30 AM – 9:00 PM",
        "lat":           40.0063,
        "lng":           -83.0283,
        "meals": {
            "breakfast": "Breakfast",
            "lunch-2":   "Lunch",
            "dinner":    "Dinner",
        },
    },
    "traditions-at-morrill": {
        "hall_id":       "morrill",
        "display_name":  "Morrill Tower",
        "location_desc": "South Campus",
        "distance":      "0.4 mi",
        "hours":         "6:30 AM – 11:00 PM",
        "lat":           40.0020,
        "lng":           -83.0200,
        "meals": {
            "breakfast": "Breakfast",
            "lunch":     "Lunch/Dinner",
        },
    },
}

MEAL_PERIOD_MAP = {
    "Breakfast":     "breakfast",
    "Lunch":         "lunch",
    "Lunch/Dinner":  "lunch",
    "Dinner":        "dinner",
}

HEADERS = {
    "Accept":     "application/json",
    "User-Agent": "NutrigainScraper/1.0",
}

REQUEST_DELAY = 0.5   # seconds between requests


# ---------------------------------------------------------------------------
# API fetch
# ---------------------------------------------------------------------------

def fetch_menu(location_slug: str, meal_slug: str, target_date: str) -> dict | None:
    url = BASE_URL.format(location=location_slug, meal=meal_slug, date=target_date)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
        week_data = resp.json()
    except requests.exceptions.HTTPError as e:
        print(f"  [HTTP {e.response.status_code}] {url}", file=sys.stderr)
        return None
    except requests.exceptions.RequestException as e:
        print(f"  [Network error] {e}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"  [Bad JSON] {url}", file=sys.stderr)
        return None

    for day in week_data.get("days", []):
        if day.get("date") == target_date:
            return day

    print(f"  [No data for {target_date}]", file=sys.stderr)
    return None


# ---------------------------------------------------------------------------
# Nutrition / allergen / tag extraction
# ---------------------------------------------------------------------------

def _get(d: dict, *keys):
    for k in keys:
        v = d.get(k)
        if v is not None:
            return v
    return None


def extract_nutrition(food: dict) -> dict:
    nf = food.get("nutritionFacts") or food.get("nutrition_facts") or {}
    return {
        "calories":        _get(nf, "calories"),
        "serving_size":    _get(nf, "servingSize", "serving_size"),
        "total_fat_g":     _get(nf, "totalFat", "total_fat"),
        "saturated_fat_g": _get(nf, "saturatedFat", "saturated_fat"),
        "trans_fat_g":     _get(nf, "transFat", "trans_fat"),
        "cholesterol_mg":  _get(nf, "cholesterol"),
        "sodium_mg":       _get(nf, "sodium"),
        "total_carbs_g":   _get(nf, "totalCarbohydrates", "total_carbohydrates", "totalCarbs"),
        "dietary_fiber_g": _get(nf, "dietaryFiber", "dietary_fiber"),
        "total_sugars_g":  _get(nf, "totalSugars", "total_sugars", "sugars"),
        "added_sugars_g":  _get(nf, "addedSugars", "added_sugars"),
        "protein_g":       _get(nf, "protein"),
        "vitamin_d_mcg":   _get(nf, "vitaminD", "vitamin_d"),
        "calcium_mg":      _get(nf, "calcium"),
        "iron_mg":         _get(nf, "iron"),
        "potassium_mg":    _get(nf, "potassium"),
    }


def extract_allergens(food: dict) -> list[str]:
    out = []
    for a in food.get("allergens", []):
        name = a.get("name") or a.get("allergen") or ""
        if name:
            out.append(name.lower())
    return sorted(out)


# Nutrislice dietary label → Nutrigain dietary tag
_LABEL_MAP = {
    "vegan":       "vegan",
    "vegetarian":  "vegetarian",
    "gluten free": "gluten-free",
    "gluten-free": "gluten-free",
    "dairy free":  "dairy-free",
    "dairy-free":  "dairy-free",
    "nut free":    "nut-free",
    "nut-free":    "nut-free",
    "halal":       "halal",
    "kosher":      "kosher",
}

def extract_dietary_tags(food: dict) -> list[str]:
    tags = set()
    for t in food.get("dietaryInformation", food.get("labels", [])):
        raw = (t.get("name") or t.get("label") or "").strip().lower()
        mapped = _LABEL_MAP.get(raw)
        if mapped:
            tags.add(mapped)

    # Infer high-protein: ≥ 25g protein
    nf = food.get("nutritionFacts") or food.get("nutrition_facts") or {}
    protein = _get(nf, "protein")
    if protein and float(protein) >= 25:
        tags.add("high-protein")

    return sorted(tags)


# ---------------------------------------------------------------------------
# Parse a day's API response into structured items
# ---------------------------------------------------------------------------

def parse_day_items(day_data: dict, hall_id: str, meal_period: str) -> list[dict]:
    """
    Returns a flat list of menu item dicts shaped to match Nutrigain's
    MENU_ITEMS schema in mockData.js.
    """
    items = []
    item_counter = [0]

    for menu_type in day_data.get("menuTypes", []):
        for station in menu_type.get("menuStations", []):
            station_name = station.get("name", "").strip()
            for entry in station.get("menuItems", []):
                food = entry.get("food") or entry
                name = (food.get("name") or "").strip()
                if not name:
                    continue

                item_counter[0] += 1
                nf        = extract_nutrition(food)
                tags      = extract_dietary_tags(food)
                allergens = extract_allergens(food)

                def to_int(v):
                    try:
                        return int(round(float(v)))
                    except (TypeError, ValueError):
                        return 0

                items.append({
                    "_tmp_id":     f"{hall_id}_{meal_period}_{item_counter[0]}",
                    "hallId":      hall_id,
                    "name":        name,
                    "category":    station_name or "General",
                    "mealPeriod":  meal_period,
                    "calories":    to_int(nf["calories"]),
                    "protein":     to_int(nf["protein_g"]),
                    "carbs":       to_int(nf["total_carbs_g"]),
                    "fat":         to_int(nf["total_fat_g"]),
                    "fiber":       to_int(nf["dietary_fiber_g"]),
                    "sodium":      to_int(nf["sodium_mg"]),
                    "allergens":   allergens,
                    "dietary":     tags,
                    "description": (food.get("description") or "").strip() or None,
                    "available":   True,
                    "_nutrition":  nf,
                })

    return items


# ---------------------------------------------------------------------------
# Build DINING_HALLS list
# ---------------------------------------------------------------------------

def build_dining_halls(scraped_slugs: list[str]) -> list[dict]:
    halls = []
    for slug in scraped_slugs:
        cfg = LOCATIONS[slug]
        meals_served = list({
            MEAL_PERIOD_MAP.get(label, "lunch")
            for label in cfg["meals"].values()
        })
        halls.append({
            "id":           cfg["hall_id"],
            "name":         cfg["display_name"],
            "location":     cfg["location_desc"],
            "distance":     cfg["distance"],
            "hours":        cfg["hours"],
            "status":       "green",     # placeholder — update from real-time source
            "waitTime":     "< 5 min",   # placeholder
            "capacity":     20,          # placeholder
            "lat":          cfg["lat"],
            "lng":          cfg["lng"],
            "image":        None,
            "currentMeals": meals_served,
        })
    return halls


# ---------------------------------------------------------------------------
# Main scrape
# ---------------------------------------------------------------------------

def scrape_date(target_date: str) -> tuple[list[dict], list[dict]]:
    """
    Scrape all locations for one date.
    Returns (dining_halls, menu_items) ready to write into menuData.js.
    """
    print(f"\nScraping {target_date}...")
    all_items: list[dict] = []
    successful_slugs: list[str] = []

    for loc_slug, loc_cfg in LOCATIONS.items():
        print(f"  {loc_cfg['display_name']}")
        hall_id  = loc_cfg["hall_id"]
        got_data = False

        for meal_slug, meal_label in loc_cfg["meals"].items():
            meal_period = MEAL_PERIOD_MAP.get(meal_label, "lunch")
            print(f"    → {meal_label}...", end=" ", flush=True)
            time.sleep(REQUEST_DELAY)

            day_data = fetch_menu(loc_slug, meal_slug, target_date)
            if day_data is None:
                print("skipped")
                continue

            items = parse_day_items(day_data, hall_id, meal_period)
            if not items:
                print("no items")
                continue

            print(f"{len(items)} items")
            all_items.extend(items)
            got_data = True

        if got_data:
            successful_slugs.append(loc_slug)

    # Assign stable sequential IDs
    for i, item in enumerate(all_items, 1):
        item["id"] = f"m{i:04d}"
        del item["_tmp_id"]

    dining_halls = build_dining_halls(successful_slugs)
    return dining_halls, all_items


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------

def write_js(dining_halls: list[dict], menu_items: list[dict], target_date: str):
    """Write src/data/menuData.js — a drop-in for the menu portions of mockData.js."""

    halls_json = json.dumps(dining_halls, indent=2, ensure_ascii=False)
    items_json = json.dumps(menu_items,   indent=2, ensure_ascii=False)

    js = f"""\
// src/data/menuData.js
// Auto-generated by scripts/scrape_menus.py — do not edit by hand.
// Last scraped: {target_date}
//
// Drop-in replacement for the DINING_HALLS and MENU_ITEMS exports in
// mockData.js.  Set USE_LIVE_DATA = true in AppContext.js to activate.

export const SCRAPED_DATE = '{target_date}';

export const DINING_HALLS = {halls_json};

export const MENU_ITEMS = {items_json};
"""

    out_path = DATA_DIR / "menuData.js"
    out_path.write_text(js, encoding="utf-8")
    print(f"\n✓ Wrote {out_path}")


def write_json(dining_halls: list[dict], menu_items: list[dict], target_date: str):
    """Write src/data/menus.json — raw structured data for debugging."""
    payload = {
        "source":       "OSU Nutrislice",
        "date":         target_date,
        "generated":    datetime.utcnow().isoformat() + "Z",
        "dining_halls": dining_halls,
        "menu_items":   menu_items,
    }
    out_path = DATA_DIR / "menus.json"
    out_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"✓ Wrote {out_path}")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(
        description="Scrape OSU Nutrislice → Nutrigain src/data/menuData.js"
    )
    g = p.add_mutually_exclusive_group()
    g.add_argument("--date",  metavar="YYYY-MM-DD", help="Single date (default: today)")
    g.add_argument("--start", metavar="YYYY-MM-DD", help="Range start (use with --end)")
    p.add_argument("--end",   metavar="YYYY-MM-DD", help="Range end (inclusive)")
    return p.parse_args()


def main():
    args = parse_args()
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if args.start:
        if not args.end:
            print("Error: --end is required with --start", file=sys.stderr)
            sys.exit(1)
        start_dt  = datetime.strptime(args.start, "%Y-%m-%d").date()
        end_dt    = datetime.strptime(args.end,   "%Y-%m-%d").date()
        all_items: list[dict] = []
        last_halls: list[dict] = []
        cur = start_dt
        while cur <= end_dt:
            halls, items = scrape_date(cur.isoformat())
            all_items.extend(items)
            last_halls = halls
            cur += timedelta(days=1)
        for i, item in enumerate(all_items, 1):
            item["id"] = f"m{i:04d}"
        write_js(last_halls, all_items, args.end)
        write_json(last_halls, all_items, args.end)
    else:
        target = args.date or date.today().isoformat()
        halls, items = scrape_date(target)
        write_js(halls,  items, target)
        write_json(halls, items, target)

    print("\nDone. To use live data in your app, set USE_LIVE_DATA = true in AppContext.js.")


if __name__ == "__main__":
    main()
