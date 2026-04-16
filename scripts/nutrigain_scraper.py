"""
scripts/nutrigain_scraper.py
----------------------------
Standalone scraper — fetches OSU dining hall menus from the Nutrislice API
and writes a single self-contained JSON file (no app files are touched).

Useful for inspecting raw API data or building your own pipeline.
Use scripts/scrape_menus.py instead if you want to update the app directly.

Usage:
    # Scrape today's menus for all locations:
    python scripts/nutrigain_scraper.py

    # Scrape a specific date:
    python scripts/nutrigain_scraper.py --date 2026-04-16

    # Scrape a date range:
    python scripts/nutrigain_scraper.py --start 2026-04-14 --end 2026-04-20

    # Write output to a custom file:
    python scripts/nutrigain_scraper.py --date 2026-04-16 --output menus.json

Requirements:
    pip install requests
"""

import argparse
import json
import sys
import time
from datetime import date, datetime, timedelta

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL = "https://osu.api.nutrislice.com/menu/api/weeks/school/{location}/menu-type/{meal}/{date}/"

LOCATIONS = {
    "traditions-at-kennedy": {
        "display_name": "Kennedy Commons",
        "meals": {
            "breakfast": "Breakfast",
            "lunch":     "Lunch/Dinner",
        },
    },
    "traditions-at-scott": {
        "display_name": "Scott House",
        "meals": {
            "breakfast": "Breakfast",
            "lunch-2":   "Lunch",
            "dinner":    "Dinner",
        },
    },
    "traditions-at-morrill": {
        "display_name": "Morrill Tower",
        "meals": {
            "breakfast": "Breakfast",
            "lunch":     "Lunch/Dinner",
        },
    },
}

HEADERS = {
    "Accept":     "application/json",
    "User-Agent": "NutrigainScraper/1.0",
}

REQUEST_DELAY = 0.5


# ---------------------------------------------------------------------------
# API helpers
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
        print(f"  [Network error] {url}: {e}", file=sys.stderr)
        return None
    except json.JSONDecodeError:
        print(f"  [Bad JSON] {url}", file=sys.stderr)
        return None

    for day in week_data.get("days", []):
        if day.get("date") == target_date:
            return day

    print(f"  [No data for {target_date}] {url}", file=sys.stderr)
    return None


# ---------------------------------------------------------------------------
# Nutrition extraction
# ---------------------------------------------------------------------------

def extract_nutrition(food_item: dict) -> dict:
    nf = food_item.get("nutritionFacts") or food_item.get("nutrition_facts") or {}

    def get(*keys):
        for k in keys:
            v = nf.get(k)
            if v is not None:
                return v
        return None

    return {
        "calories":        get("calories"),
        "serving_size":    get("servingSize", "serving_size"),
        "total_fat_g":     get("totalFat", "total_fat"),
        "saturated_fat_g": get("saturatedFat", "saturated_fat"),
        "trans_fat_g":     get("transFat", "trans_fat"),
        "cholesterol_mg":  get("cholesterol"),
        "sodium_mg":       get("sodium"),
        "total_carbs_g":   get("totalCarbohydrates", "total_carbohydrates", "totalCarbs"),
        "dietary_fiber_g": get("dietaryFiber", "dietary_fiber"),
        "total_sugars_g":  get("totalSugars", "total_sugars", "sugars"),
        "added_sugars_g":  get("addedSugars", "added_sugars"),
        "protein_g":       get("protein"),
        "vitamin_d_mcg":   get("vitaminD", "vitamin_d"),
        "calcium_mg":      get("calcium"),
        "iron_mg":         get("iron"),
        "potassium_mg":    get("potassium"),
    }


def extract_allergens(food_item: dict) -> list[str]:
    allergens = []
    for a in food_item.get("allergens", []):
        name = a.get("name") or a.get("allergen") or ""
        if name:
            allergens.append(name.lower())
    return sorted(allergens)


def extract_tags(food_item: dict) -> list[str]:
    tags = []
    for t in food_item.get("dietaryInformation", food_item.get("labels", [])):
        name = t.get("name") or t.get("label") or ""
        if name:
            tags.append(name.lower())
    return sorted(tags)


# ---------------------------------------------------------------------------
# Menu parsing
# ---------------------------------------------------------------------------

def parse_day(day_data: dict) -> list[dict]:
    stations_out = []

    for menu_type in day_data.get("menuTypes", []):
        for station in menu_type.get("menuStations", []):
            station_name = station.get("name", "Unknown Station").strip()
            items_out = []

            for food_item in station.get("menuItems", []):
                food = food_item.get("food") or food_item
                name = (food.get("name") or "").strip()
                if not name:
                    continue

                items_out.append({
                    "name":        name,
                    "description": (food.get("description") or "").strip() or None,
                    "nutrition":   extract_nutrition(food),
                    "allergens":   extract_allergens(food),
                    "tags":        extract_tags(food),
                })

            if items_out:
                stations_out.append({
                    "station": station_name,
                    "items":   items_out,
                })

    return stations_out


# ---------------------------------------------------------------------------
# Main scrape loop
# ---------------------------------------------------------------------------

def scrape_date(target_date: str) -> dict:
    print(f"\nScraping {target_date}...")
    locations_out = []

    for loc_slug, loc_cfg in LOCATIONS.items():
        print(f"  {loc_cfg['display_name']}")
        meals_out = []

        for meal_slug, meal_label in loc_cfg["meals"].items():
            print(f"    → {meal_label}...", end=" ", flush=True)
            time.sleep(REQUEST_DELAY)

            day_data = fetch_menu(loc_slug, meal_slug, target_date)
            if day_data is None:
                print("skipped")
                continue

            stations = parse_day(day_data)
            if not stations:
                print("no items")
                continue

            item_count = sum(len(s["items"]) for s in stations)
            print(f"{item_count} items across {len(stations)} stations")

            meals_out.append({
                "meal":     meal_label,
                "stations": stations,
            })

        if meals_out:
            locations_out.append({
                "location": loc_cfg["display_name"],
                "slug":     loc_slug,
                "meals":    meals_out,
            })

    return {
        "date":       target_date,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "locations":  locations_out,
    }


def scrape_range(start: str, end: str) -> list[dict]:
    start_dt = datetime.strptime(start, "%Y-%m-%d").date()
    end_dt   = datetime.strptime(end,   "%Y-%m-%d").date()
    results  = []
    current  = start_dt
    while current <= end_dt:
        results.append(scrape_date(current.isoformat()))
        current += timedelta(days=1)
    return results


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    parser = argparse.ArgumentParser(
        description="Scrape OSU Traditions dining menus from Nutrislice → Nutrigain JSON"
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--date",  metavar="YYYY-MM-DD", help="Scrape a single date (default: today)")
    group.add_argument("--start", metavar="YYYY-MM-DD", help="Start of date range (use with --end)")
    parser.add_argument("--end",   metavar="YYYY-MM-DD", help="End of date range (inclusive)")
    parser.add_argument(
        "--output",
        metavar="FILE",
        default="nutrigain_menus.json",
        help="Output JSON file path (default: nutrigain_menus.json)",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    if args.start:
        if not args.end:
            print("Error: --end is required when using --start", file=sys.stderr)
            sys.exit(1)
        data = scrape_range(args.start, args.end)
    else:
        target = args.date or date.today().isoformat()
        data = [scrape_date(target)]

    output = {
        "source":    "OSU Nutrislice",
        "base_url":  "https://osu.nutrislice.com",
        "generated": datetime.utcnow().isoformat() + "Z",
        "menus":     data,
    }

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    total_days = len(data)
    print(f"\n✓ Done. Wrote {total_days} day(s) to {args.output}")


if __name__ == "__main__":
    main()
