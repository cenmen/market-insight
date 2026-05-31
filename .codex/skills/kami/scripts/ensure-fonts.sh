#!/usr/bin/env bash
set -euo pipefail

# Portable across bash 3.2+ (macOS stock /bin/bash) and bash 4+ (Linux, Homebrew).
# Avoids `declare -A` so the script runs on a fresh macOS without `brew install bash`.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_FONT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/assets/fonts"

# Download target lives OUTSIDE the skill directory on purpose.
#
# Keep downloaded recovery fonts outside the skill directory. WeasyPrint first
# uses template-relative assets/fonts paths in this checkout; if those files are
# absent, fontconfig can resolve "TsangerJinKai02" from this XDG user font
# directory instead.
FONT_DIR="${KAMI_FONT_DIR:-${XDG_DATA_HOME:-$HOME/.local/share}/fonts/kami}"

MIN_SIZE_CN=10000000  # 10MB for TsangerJinKai (large CJK glyph set)

# TsangerJinKai (CN): index N pairs CN_NAMES[N] with CN_LOCAL_NAMES[N].
CN_NAMES=("仓耳今楷02-W04.ttf" "仓耳今楷02-W05.ttf")
CN_LOCAL_NAMES=("TsangerJinKai02-W04.ttf" "TsangerJinKai02-W05.ttf")

# Mirror order is intentionally jsdmirror-first here, opposite of the
# templates' @font-face fallback (which lists jsdelivr first). Reasoning:
# this script runs interactively when fonts are missing locally, often from
# China where jsdmirror is reachable and faster than jsdelivr; templates run
# anywhere and prioritize jsdelivr's broader global coverage.
MIRROR_SOURCES=(
  "https://cdn.jsdmirror.com/gh/tw93/Kami@main/assets/fonts"
  "https://cdn.jsdelivr.net/gh/tw93/Kami@main/assets/fonts"
)

check_size() {
  local file="$1"
  local min_size="$2"
  [[ -f "$file" ]] || return 1
  local size
  size=$(wc -c < "$file" | tr -d ' ')
  [[ "$size" -ge "$min_size" ]]
}

cn_present_in() {
  local dir="$1" name
  for name in "${CN_LOCAL_NAMES[@]}"; do
    check_size "$dir/$name" "$MIN_SIZE_CN" || return 1
  done
  return 0
}

refresh_fontconfig() {
  # The XDG font dir is already on fontconfig's default scan path, so a cache
  # refresh is all that is needed for WeasyPrint to pick the fonts up. Optional:
  # absence of fc-cache (e.g. minimal sandbox) is non-fatal, fontconfig rescans
  # the directory lazily on next use.
  if command -v fc-cache >/dev/null 2>&1; then
    fc-cache -f "$FONT_DIR" >/dev/null 2>&1 || true
  fi
}

download_tsanger() {
  local cn_name="$1"
  local local_name="$2"
  local target="$FONT_DIR/$local_name"

  # Source 1: official tsanger.cn
  local official_url="https://tsanger.cn/download/${cn_name}"
  echo "  Trying: tsanger.cn (official)"
  if curl --retry 2 --connect-timeout 15 --max-time 300 -fSL "$official_url" -o "$target.tmp" 2>/dev/null; then
    if check_size "$target.tmp" "$MIN_SIZE_CN"; then
      mv "$target.tmp" "$target"
      echo "  OK: $local_name downloaded ($(du -h "$target" | cut -f1))"
      return 0
    else
      rm -f "$target.tmp"
    fi
  else
    rm -f "$target.tmp"
  fi

  # Source 2+: CDN mirrors (already named TsangerJinKai02-W0x.ttf)
  for src in "${MIRROR_SOURCES[@]}"; do
    local url="$src/$local_name"
    echo "  Trying: $url"
    if curl --retry 2 --connect-timeout 15 --max-time 300 -fSL "$url" -o "$target.tmp" 2>/dev/null; then
      if check_size "$target.tmp" "$MIN_SIZE_CN"; then
        mv "$target.tmp" "$target"
        echo "  OK: $local_name downloaded ($(du -h "$target" | cut -f1))"
        return 0
      else
        rm -f "$target.tmp"
      fi
    else
      rm -f "$target.tmp"
    fi
  done

  echo "  ERROR: all sources failed for $local_name"
  return 1
}

# A full skill checkout ships the committed font files. Templates resolve their
# relative `../fonts/*` @font-face path against them directly, so there is
# nothing to download or register.

cn_failed=0
if cn_present_in "$REPO_FONT_DIR"; then
  echo "OK: TsangerJinKai fonts present in repo checkout ($REPO_FONT_DIR)"
else
  mkdir -p "$FONT_DIR"
  if cn_present_in "$FONT_DIR"; then
    echo "OK: TsangerJinKai fonts present ($FONT_DIR)"
  else
    echo "Downloading TsangerJinKai fonts to $FONT_DIR ..."
    for i in "${!CN_NAMES[@]}"; do
      cn_name="${CN_NAMES[$i]}"
      local_name="${CN_LOCAL_NAMES[$i]}"
      if check_size "$FONT_DIR/$local_name" "$MIN_SIZE_CN"; then
        echo "  OK: $local_name already present"
        continue
      fi
      if ! download_tsanger "$cn_name" "$local_name"; then
        cn_failed=$((cn_failed + 1))
      fi
    done
    if [[ "$cn_failed" -gt 0 ]]; then
      echo ""
      echo "Some TsangerJinKai files could not be downloaded. Alternatives:"
      echo "  1. Install Source Han Serif SC: brew install --cask font-source-han-serif-sc"
      echo "  2. Copy TsangerJinKai02-W04.ttf and W05.ttf manually into $FONT_DIR"
    fi
  fi
fi

if [[ "$cn_failed" -gt 0 ]]; then
  exit 1
fi

refresh_fontconfig
echo "OK: all fonts ready"
