#!/bin/bash
# =============================================================
# Smart-ZUJ — Convex Deploy Script
# الرفع على كلا البيئتين: Cloud + Self-Hosted
# =============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SELFHOSTED_ENV="$SCRIPT_DIR/.env.selfhosted"

echo ""
echo "🚀 Smart-ZUJ Convex Deploy"
echo "=================================="

# ── 1. Convex Cloud (moonlit-raven-556 → prod: trustworthy-sheep-722) ─────────
echo ""
echo "📡 [1/2] رفع على Convex Cloud..."
npx convex deploy --env-file "$SCRIPT_DIR/../web/.env.local"

# ── 2. Self-Hosted (convex.yazeid.site via Coolify) ───────────────────────────
echo ""
echo "🏠 [2/2] رفع على Self-Hosted (convex.yazeid.site)..."

if [ ! -f "$SELFHOSTED_ENV" ]; then
  echo "❌ ملف .env.selfhosted غير موجود!"
  echo "   أنشئ الملف packages/convex/.env.selfhosted بهذا المحتوى:"
  echo ""
  echo "   CONVEX_SELF_HOSTED_URL=https://convex.yazeid.site"
  echo "   CONVEX_SELF_HOSTED_ADMIN_KEY=<your-admin-key>"
  echo ""
  exit 1
fi

npx convex deploy --env-file "$SELFHOSTED_ENV"

echo ""
echo "✅ تم الرفع بنجاح على كلا البيئتين!"
echo ""
