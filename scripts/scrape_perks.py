#!/usr/bin/env python3
"""
Scrape startup perks data from the jnd0/startup-perks GitHub repo.
Outputs a JSON file with all perk details for the frontend.
"""

import json
import re
import urllib.request
import yaml
from pathlib import Path

SITEMAP_URL = "https://startup-perks.com/sitemap-0.xml"
RAW_BASE = "https://raw.githubusercontent.com/jnd0/startup-perks/main/src/content/perks/"

def get_perk_slugs_from_sitemap():
    """Extract perk slugs from the sitemap XML."""
    req = urllib.request.Request(SITEMAP_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        xml_content = resp.read().decode("utf-8")
    
    # Extract all perk URLs
    pattern = r'<loc>https://startup-perks\.com/perks/([^/]+)/</loc>'
    slugs = re.findall(pattern, xml_content)
    return slugs

def fetch_perk_markdown(slug):
    """Fetch and parse a single perk markdown file from GitHub."""
    url = f"{RAW_BASE}{slug}.md"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
        
        # Parse frontmatter (between --- delimiters)
        parts = content.split("---", 2)
        if len(parts) < 3:
            return None
        
        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()
        
        if frontmatter:
            frontmatter["slug"] = slug
            frontmatter["body"] = body
            return frontmatter
    except Exception as e:
        print(f"  ⚠ Failed to fetch {slug}: {e}")
    return None

def main():
    print("🔍 Fetching perk slugs from sitemap...")
    slugs = get_perk_slugs_from_sitemap()
    print(f"  Found {len(slugs)} perks in sitemap")
    
    perks = []
    for i, slug in enumerate(slugs):
        print(f"  [{i+1}/{len(slugs)}] Fetching {slug}...")
        perk = fetch_perk_markdown(slug)
        if perk:
            perks.append(perk)
    
    print(f"\n✅ Successfully fetched {len(perks)} perks")
    
    # Calculate total market value
    total_value = sum(p.get("creditValueUsd", 0) for p in perks)
    active_count = sum(1 for p in perks if p.get("isActive", False))
    verified_count = sum(1 for p in perks if p.get("verified", False))
    
    output = {
        "stats": {
            "totalMarketValue": total_value,
            "activeCount": active_count,
            "verifiedCount": verified_count,
            "lastUpdated": "2026-02-26"
        },
        "perks": perks
    }
    
    # Write to the data directory
    out_path = Path(__file__).parent.parent / "src" / "data" / "perks.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2, default=str)
    
    print(f"📁 Written to {out_path}")
    print(f"   Total market value: ${total_value:,.0f}")
    print(f"   Active: {active_count} | Verified: {verified_count}")

if __name__ == "__main__":
    main()
