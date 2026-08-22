import os, json

ROOT = os.path.join(os.path.dirname(__file__), "..")
FULL_PHOTO_DIR = os.path.join(ROOT, "images/portfolio/full")
FULL_VIDEO_DIR = os.path.join(ROOT, "images/portfolio/video/full")

PROJECTS = [
    {
        "slug": "nevuary",
        "title": "Nevuary",
        "tag": "Video & Photography",
        "description": "A full campaign for Nevuary's racing jacket drop, from studio product shots to street-style campaign photography and short-form video across two locations. We built a visual world that matched the brand's motorsport-meets-streetwear identity, shot to move fast across Instagram and TikTok.",
        "hasPhotos": True,
        "hasVideos": True,
    },
    {
        "slug": "fresh-pop",
        "title": "Fresh Pop",
        "tag": "Video",
        "description": "Street-style video content for Fresh Pop, built entirely around movement and location. Short, punchy edits designed for the scroll. No posed shots, just real energy.",
        "hasPhotos": False,
        "hasVideos": True,
    },
    {
        "slug": "riverridge",
        "title": "RiverRidge",
        "tag": "Commercial & Event",
        "description": "Ongoing brand and sponsorship coverage for RiverRidge Waste Management, from equestrian sponsorship at the Balmoral Show to a charity partnership with Northern Ireland Hospice. Coverage built to show up wherever RiverRidge shows up, on-brand every time.",
        "hasPhotos": True,
        "hasVideos": True,
    },
    {
        "slug": "ulster-rally",
        "title": "Ulster Rally",
        "tag": "Action",
        "description": "Trackside action photography from the Ulster Rally: fast cars, tight corners and the split-second timing that motorsport photography demands.",
        "hasPhotos": True,
        "hasVideos": False,
    },
    {
        "slug": "moo-town",
        "title": "Moo Town Creamery",
        "tag": "Food",
        "description": "Bright, appetite-driving product photography for Moo Town Creamery, built to make every scoop look exactly as good as it tastes, shot for their menu, socials and seasonal campaigns.",
        "hasPhotos": True,
        "hasVideos": False,
    },
    {
        "slug": "portrait",
        "title": "Portrait",
        "tag": "Photography",
        "description": "A collection of portrait work across multiple shoots and subjects. Proof that good portrait photography is about direction and light, not just the person in front of the camera.",
        "hasPhotos": True,
        "hasVideos": False,
    },
    {
        "slug": "event",
        "title": "Event",
        "tag": "Photography",
        "description": "Event photography built to capture the moments people actually remember: the reactions, not just the room.",
        "hasPhotos": True,
        "hasVideos": False,
    },
    {
        "slug": "flawless-finesse",
        "title": "Flawless Finesse Detailing",
        "tag": "Video",
        "description": "A promo video for Flawless Finesse Detailing, built around the most satisfying part of the job: foam, water and a car going from dull to showroom in sixty seconds.",
        "hasPhotos": False,
        "hasVideos": True,
    },
    {
        "slug": "ni-hospice",
        "title": "NI Hospice",
        "tag": "RiverRidge · Video",
        "description": "A short film documenting RiverRidge's donation partnership with Northern Ireland Hospice. A reminder that sponsorship content can do more than put a logo on a banner.",
        "hasPhotos": False,
        "hasVideos": True,
    },
]

def interleave(photos, videos):
    """Scatter videos evenly through the photo set instead of grouping them
    all at the front — a project page with a dozen tall video tiles stacked
    before any photos reads as a wall of clips, not a gallery. Each video
    gets an evenly-spaced target slot (centred in its share of the run:
    video j of n targets position (j+0.5)/n along the total length); photos
    fill in original order around them. No-op if either list is empty."""
    total = len(photos) + len(videos)
    if not videos or not photos:
        return videos + photos
    result = [None] * total
    for j, v in enumerate(videos):
        pos = min(round((j + 0.5) * total / len(videos)), total - 1)
        while result[pos] is not None:
            pos = (pos + 1) % total
        result[pos] = v
    pi = 0
    for i in range(total):
        if result[i] is None:
            result[i] = photos[pi]
            pi += 1
    return result


manifest = {}
for p in PROJECTS:
    slug = p["slug"]
    videos = []
    photos = []

    if p["hasVideos"]:
        vdir = os.path.join(FULL_VIDEO_DIR, slug)
        if os.path.isdir(vdir):
            for fname in sorted(os.listdir(vdir)):
                if fname.startswith("._") or not fname.endswith(".mp4"):
                    continue
                videos.append({
                    "type": "video",
                    "src": f"images/portfolio/video/full/{slug}/{fname}",
                })

    if p["hasPhotos"]:
        pdir = os.path.join(FULL_PHOTO_DIR, slug)
        if os.path.isdir(pdir):
            for fname in sorted(os.listdir(pdir)):
                if fname.startswith("._") or not fname.endswith(".webp"):
                    continue
                photos.append({
                    "type": "image",
                    "src": f"images/portfolio/full/{slug}/{fname}",
                })

    media = interleave(photos, videos)

    # attach a poster to the first video if a hero image exists
    hero = f"images/portfolio/{slug}.webp"
    if os.path.isfile(os.path.join(ROOT, hero)):
        for m in media:
            if m["type"] == "video":
                m["poster"] = hero
                break

    manifest[slug] = {
        "title": p["title"],
        "tag": p["tag"],
        "description": p["description"],
        "media": media,
    }

out_path = os.path.join(ROOT, "js", "portfolio-data.js")
with open(out_path, "w") as f:
    f.write("// Auto-generated by scripts/generate-manifest.py. Do not hand-edit media arrays.\n")
    f.write("var PORTFOLIO_PROJECTS = ")
    f.write(json.dumps(manifest, indent=2, ensure_ascii=False))
    f.write(";\n")

total_media = sum(len(v["media"]) for v in manifest.values())
print(f"Wrote {out_path}")
print(f"Total media items: {total_media}")
for slug, v in manifest.items():
    print(f"  {slug}: {len(v['media'])} items")
