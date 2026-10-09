#!/usr/bin/env bash
# ব্র্যান্ড রাস্টার বানাও: public/logo.svg → PWA আইকন, apple-touch-icon; brand/og.html → সোশ্যাল প্রিভিউ PNG
# দরকার: google-chrome (headless)। চালাও: bash brand/render.sh
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME=${CHROME:-google-chrome}
shot() { # shot <html-file> <WxH> <out.png>
  "$CHROME" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --default-background-color=00000000 \
    --window-size="$2" --screenshot="$3" "file://$PWD/$1" >/dev/null 2>&1
}
tmp=brand/.icon.html
for size in 192 512 180; do
  printf '<html><body style="margin:0;background:transparent"><img src="../public/logo.svg" style="display:block;width:%spx;height:%spx"></body></html>' "$size" "$size" > "$tmp"
  case $size in 180) out=public/apple-touch-icon.png ;; *) out=public/icon-$size.png ;; esac
  shot "$tmp" "${size},${size}" "$out"
done
rm -f "$tmp"
shot brand/og.html 1200,630 public/og-v1.png
ls -l public/icon-192.png public/icon-512.png public/apple-touch-icon.png public/og-v1.png
