#!/bin/bash
set -e
cd "/Volumes/PortableSSD/DA_Claude"
SRC="Images:Video/Dead Air Creative Media - Portfolio"
OUT="images/portfolio/video/full"

# Preset1280x720 (a fixed bounding box, not an adaptive "quality" preset) for
# every clip: gallery videos display large in the full-size viewer (portrait
# clips can run near full viewport height), and the earlier low-res encodes
# were visibly soft there. Verified fixed presets give predictable, identical
# output dimensions regardless of source bitrate/complexity — PresetMediumQuality
# was tried first since it looked great on one clip, but turned out to pick
# resolution adaptively per source and silently under-delivered on higher-
# bitrate footage, so it's not used here despite the smaller file size.
avconvert -s "$SRC/Fashion/Nevuary/Video/Electric Arcade Location Reel.mp4" -o "$OUT/nevuary/003.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 1.MP4" -o "$OUT/nevuary/004.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 2.MP4" -o "$OUT/nevuary/005.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 3.MP4" -o "$OUT/nevuary/006.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 4.MP4" -o "$OUT/nevuary/007.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 6.MP4" -o "$OUT/nevuary/008.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 7.MP4" -o "$OUT/nevuary/009.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Photo Burst.mp4" -o "$OUT/nevuary/010.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary x Electric Arcade Reel 2.mp4" -o "$OUT/nevuary/011.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Fresh Pop/Video/shorts 1.mp4" -o "$OUT/fresh-pop/002.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Fresh Pop/Video/shorts 2.mp4" -o "$OUT/fresh-pop/003.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary x Electric Arcade Reel 1.mp4" -o "$OUT/nevuary/001.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Nevuary/Video/Nevuary Jacket 5.MP4" -o "$OUT/nevuary/002.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Fashion/Fresh Pop/Video/fp1.mp4" -o "$OUT/fresh-pop/001.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Commercial/Flawless Finesse Detailing BMW Promo.MP4" -o "$OUT/flawless-finesse/001.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Commercial/RiverRidge/Video/RiverRidge NI Hospice Donation.MP4" -o "$OUT/ni-hospice/001.mp4" -p Preset1280x720 --replace
avconvert -s "$SRC/Commercial/RiverRidge/Video/RiverRidge Balmoral 2026.mp4" -o "$OUT/riverridge/001.mp4" -p Preset1280x720 --replace
# Preset960x540, not Preset1280x720: this reel runs 139s (vs ~30-60s for every
# other clip), so at the same bitrate the 720p encode came out to 113MB, over
# GitHub's 100MB hard file-size limit. Still a fixed bounding-box preset
# (predictable output), just one size down to fit the length.
avconvert -s "$SRC/Commercial/RiverRidge/Video/Agivey River RR Reel.mp4" -o "$OUT/riverridge/002.mp4" -p Preset960x540 --replace
avconvert -s "$SRC/Commercial/RiverRidge/Video/RR Spar Testimonial (Fixed Captions).mp4" -o "$OUT/riverridge/003.mp4" -p Preset1280x720 --replace

find "$OUT" -name "._*" -delete
echo "--- done ---"
for d in nevuary fresh-pop flawless-finesse ni-hospice riverridge; do
  ls -la "$OUT/$d"
done
