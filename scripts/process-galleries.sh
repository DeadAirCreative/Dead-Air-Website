#!/bin/bash
set -e
cd "/Volumes/PortableSSD/DA_Claude"
SRC="Images:Video/Dead Air Creative Media - Portfolio"
OUT="images/portfolio/full"
mkdir -p "$OUT"

process_folder() {
  local slug="$1"
  local folder="$2"
  local dest="$OUT/$slug"
  rm -rf "$dest"
  mkdir -p "$dest"
  local i=1
  find "$folder" -iname "*.jpg" -not -name "._*" | sort | while read -r f; do
    local num=$(printf "%03d" "$i")
    local tmp="$dest/$num.jpg"
    sips -Z 1400 -s format jpeg -s formatOptions high "$f" --out "$tmp" >/dev/null 2>&1
    cwebp -q 82 -quiet "$tmp" -o "$dest/$num.webp"
    rm -f "$tmp"
    i=$((i+1))
  done
  rm -f "$dest"/._*
  echo "$slug: $(ls "$dest" | wc -l) images"
}

process_folder "nevuary" "$SRC/Fashion/Nevuary/Photo"
process_folder "riverridge" "$SRC/Commercial/RiverRidge/Photo"
process_folder "ulster-rally" "$SRC/Action/Ulster Rally"
process_folder "moo-town" "$SRC/Food/Moo Town Creamery/Photo"
process_folder "portrait" "$SRC/Portrait/Photo"
process_folder "event" "$SRC/Event/Photo"

echo "--- done ---"
du -sh "$OUT"
