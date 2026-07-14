#!/bin/bash
set -e
cd "/Volumes/PortableSSD/DA_Claude"
SRC="Images:Video/Dead Air Creative Media - Portfolio"
OUT="images/portfolio/video/full"

# Shorter/already-modest source clips: Preset640x480 gives a good size/quality
# balance without a second aggressive compression pass.
avconvert -s "$SRC/Fashion/Nevuary/Video/Electric Arcade Location Reel.mp4" -o "$OUT/nevuary/003.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 1.MP4" -o "$OUT/nevuary/004.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 2.MP4" -o "$OUT/nevuary/005.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 3.MP4" -o "$OUT/nevuary/006.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 4.MP4" -o "$OUT/nevuary/007.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 6.MP4" -o "$OUT/nevuary/008.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 7.MP4" -o "$OUT/nevuary/009.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Photo Burst.mp4" -o "$OUT/nevuary/010.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary x Electric Arcade Reel 2.mp4" -o "$OUT/nevuary/011.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Fresh Pop/Video/shorts 1.mp4" -o "$OUT/fresh-pop/002.mp4" -p Preset640x480 --replace
avconvert -s "$SRC/Fashion/Fresh Pop/Video/shorts 2.mp4" -o "$OUT/fresh-pop/003.mp4" -p Preset640x480 --replace

# Larger/higher-bitrate source clips: PresetMediumQuality gives a much bigger size
# reduction (~75-90% smaller) at full source resolution — tested and confirmed to
# hold up visually, so preferred over Preset640x480's harder downscale for these.
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary x Electric Arcade Reel 1.mp4" -o "$OUT/nevuary/001.mp4" -p PresetMediumQuality --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 5.MP4" -o "$OUT/nevuary/002.mp4" -p PresetMediumQuality --replace
avconvert -s "$SRC/Fashion/Fresh Pop/Video/fp1.mp4" -o "$OUT/fresh-pop/001.mp4" -p PresetMediumQuality --replace
avconvert -s "$SRC/Commercial/Flawless Finesse Detailing BMW Promo.MP4" -o "$OUT/flawless-finesse/001.mp4" -p PresetMediumQuality --replace
avconvert -s "$SRC/Commercial/RiverRidge/Video/RiverRidge NI Hospice Donation.MP4" -o "$OUT/ni-hospice/001.mp4" -p PresetMediumQuality --replace
avconvert -s "$SRC/Commercial/RiverRidge/Video/RiverRidge Balmoral 2026.mp4" -o "$OUT/riverridge/001.mp4" -p PresetMediumQuality --replace

find "$OUT" -name "._*" -delete
echo "--- done ---"
for d in nevuary fresh-pop flawless-finesse ni-hospice riverridge; do
  ls -la "$OUT/$d"
done
