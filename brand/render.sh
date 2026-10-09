#!/usr/bin/env bash
# ব্র্যান্ড রাস্টার বানাও: public/logo.svg → favicon (ico/png), PWA আইকন, apple-touch-icon; brand/og.html → সোশ্যাল প্রিভিউ PNG
# দরকার: google-chrome (headless), python3 + Pillow (favicon.ico)। চালাও: bash brand/render.sh
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME=${CHROME:-google-chrome}
shot() { # shot <html-file> <WxH> <out.png>
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$2" --screenshot="$3" "file://$PWD/$1" >/dev/null 2>&1
}
tmp=brand/.icon.html
for size in 16 32 48 180 192 512; do
  printf '<html><body style="margin:0;background:transparent"><img src="../public/logo.svg" style="display:block;width:%spx;height:%spx"></body></html>' "$size" "$size" > "$tmp"
  case $size in
    16|32|48) out=brand/.favicon-$size.png ;;
    180) out=public/apple-touch-icon.png ;;
    *) out=public/icon-$size.png ;;
  esac
  shot "$tmp" "${size},${size}" "$out"
done
cp brand/.favicon-32.png public/favicon-32.png
python3 - <<'PY'
# ICO = header + directory + PNG blobs (PNG-in-ICO; সব আধুনিক ব্রাউজার/উইন্ডোজ পড়ে) — Pillow append_images ICO-তে নেয় না, তাই হাতে
import struct
sizes=(16,32,48); blobs=[open(f"brand/.favicon-{s}.png","rb").read() for s in sizes]
off=6+16*len(sizes); out=bytearray(struct.pack("<HHH",0,1,len(sizes)))
for s,b in zip(sizes,blobs):
    out+=struct.pack("<BBBBHHII", s%256, s%256, 0, 0, 1, 32, len(b), off); off+=len(b)
for b in blobs: out+=b
open("public/favicon.ico","wb").write(out)
PY
rm -f "$tmp" brand/.favicon-*.png
shot brand/og.html 1200,630 public/og-v2.png
ls -l public/favicon.ico public/favicon-32.png public/icon-192.png public/icon-512.png public/apple-touch-icon.png public/og-v2.png
