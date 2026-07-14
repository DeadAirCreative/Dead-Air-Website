import os

OUT = os.path.join(os.path.dirname(__file__), "..", "images", "placeholders")
os.makedirs(OUT, exist_ok=True)

BARS = ["#F6F5F1", "#D8FF3E", "#FF3B2F", "#2A2A2A", "#A6A39B", "#141414"]

def testcard_svg(width, height, label, sublabel="", is_video=False):
    bar_w = width / len(BARS)
    bars = "".join(
        f'<rect x="{i*bar_w:.1f}" y="0" width="{bar_w+1:.1f}" height="{height*0.62:.1f}" fill="{c}" opacity="0.9"/>'
        for i, c in enumerate(BARS)
    )
    play = ""
    if is_video:
        cx, cy, r = width/2, height*0.31, min(width, height)*0.09
        play = f'''
        <circle cx="{cx}" cy="{cy}" r="{r}" fill="#0A0A0A" opacity="0.55"/>
        <circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#F6F5F1" stroke-width="2"/>
        <path d="M {cx-r*0.35} {cy-r*0.5} L {cx-r*0.35} {cy+r*0.5} L {cx+r*0.55} {cy} Z" fill="#F6F5F1"/>
        '''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" role="img" aria-label="{label} placeholder">
  <rect width="{width}" height="{height}" fill="#0A0A0A"/>
  {bars}
  <rect x="0" y="{height*0.62:.1f}" width="{width}" height="{height*0.38:.1f}" fill="#0A0A0A"/>
  <line x1="0" y1="{height*0.62:.1f}" x2="{width}" y2="{height*0.62:.1f}" stroke="#FF3B2F" stroke-width="2"/>
  {play}
  <text x="{width/2}" y="{height*0.78:.1f}" font-family="monospace" font-size="{min(width,height)*0.045:.1f}" fill="#F6F5F1" text-anchor="middle" letter-spacing="2">{label}</text>
  <text x="{width/2}" y="{height*0.87:.1f}" font-family="monospace" font-size="{min(width,height)*0.032:.1f}" fill="#A6A39B" text-anchor="middle" letter-spacing="1">{sublabel}</text>
</svg>'''

specs = [
    ("hero-reel", 1600, 900, "HERO REEL — REPLACE", "16:9 · MP4/WEBM, 15–30S LOOP, MUTED+CAPTIONS", True),
    ("service-video", 900, 1100, "VIDEO CONTENT", "REPLACE WITH REEL STILL OR CLIP", True),
    ("service-photography", 900, 1100, "PHOTOGRAPHY", "REPLACE WITH HERO PHOTO", False),
    ("service-design", 900, 1100, "GRAPHIC DESIGN", "REPLACE WITH DESIGN SAMPLE", False),
    ("portfolio-1", 1200, 1500, "PROJECT 01", "CLIENT NAME · VIDEO", True),
    ("portfolio-2", 1200, 900, "PROJECT 02", "CLIENT NAME · PHOTOGRAPHY", False),
    ("portfolio-3", 1200, 1200, "PROJECT 03", "CLIENT NAME · DESIGN", False),
    ("portfolio-4", 1200, 1500, "PROJECT 04", "CLIENT NAME · VIDEO", True),
    ("portfolio-5", 1200, 900, "PROJECT 05", "CLIENT NAME · PHOTOGRAPHY", False),
    ("portfolio-6", 1200, 1200, "PROJECT 06", "CLIENT NAME · DESIGN", False),
    ("portfolio-7", 1200, 1500, "PROJECT 07", "CLIENT NAME · VIDEO", True),
    ("portfolio-8", 1200, 900, "PROJECT 08", "CLIENT NAME · PHOTOGRAPHY", False),
    ("about-founder", 1000, 1250, "FOUNDER PHOTO", "REPLACE — 4:5 PORTRAIT", False),
    ("about-studio", 1600, 1000, "BEHIND THE SCENES", "REPLACE — STUDIO/ON-LOCATION SHOT", True),
    ("case-study-1", 1600, 1000, "CASE STUDY", "BEFORE/AFTER OR CAMPAIGN STILL", True),
    ("og-image", 1200, 630, "DEAD AIR", "CONTENT THAT CUTS THROUGH THE NOISE", False),
]

for name, w, h, label, sub, vid in specs:
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(testcard_svg(w, h, label, sub, vid))

print(f"Generated {len(specs)} placeholder SVGs in {OUT}")
