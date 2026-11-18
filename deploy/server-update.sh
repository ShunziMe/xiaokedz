#!/usr/bin/env bash
# =============================================================================
#  小课桌 · 服务器上一键更新（配合「git clone 到站点根目录」的部署方式）
#
#  用法：在站点根目录执行
#          cd /www/wwwroot/你的域名 && bash deploy/server-update.sh
#    或： bash deploy/server-update.sh /www/wwwroot/你的域名
#
#  工作流：本地改代码 → git push → 服务器上跑这个脚本。
#  注意：api/config.php 已被 .gitignore 排除，更新不会覆盖线上数据库密码；
#        但被 git 跟踪的文件（例如 assets/js/sync-config.js）不要在服务器上直接改，
#        否则脚本会检测到本地改动并停止，避免 pull 冲突。
# =============================================================================
set -euo pipefail

SITE="${1:-$(pwd)}"
cd "$SITE" || { echo "✗ 目录不存在：$SITE"; exit 1; }

if [ ! -d .git ]; then
  echo "✗ $SITE 不是 git 仓库，这个脚本只给「clone 部署」用。"
  echo "  用 deploy.sh / pack.sh 部署的，请继续用那两种方式更新。"
  exit 1
fi

# ---------- git 2.35.2+ 安全校验 ----------
# 宝塔站点目录属主是 www:www，而面板终端以 root 执行 git，
# git 会报 "detected dubious ownership" 并拒绝一切操作。
# 这条不是你仓库坏了，也不是历史分叉，千万不要 reset --hard。
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git config --global --add safe.directory "$SITE" 2>/dev/null || true
  if git rev-parse --git-dir >/dev/null 2>&1; then
    echo "→ 已把 $SITE 加入 git safe.directory（修复 dubious ownership）"
  else
    echo "✗ git 仍然拒绝访问 $SITE。请手动执行后重试："
    echo "    git config --global --add safe.directory $SITE"
    exit 1
  fi
fi

echo "→ 站点：$SITE"
echo "→ 当前版本：$(git rev-parse --short HEAD) $(git log -1 --format=%s)"

# ---------- 本地改动检查 ----------
# 只看「被 git 跟踪的文件」，untracked 的 .user.ini / 上传的图片等不该挡住更新
DIRTY="$(git status --porcelain --untracked-files=no)"

# sync-config.js 是「服务器部署配置」（云同步开关），本地改它属于正常情况：
# 用 skip-worktree 让 git 长期忽略这个文件的改动，既不会被 pull 覆盖，也不会拦更新
case "$DIRTY" in
  *sync-config.js*)
    git update-index --skip-worktree assets/js/sync-config.js 2>/dev/null || true
    echo "→ assets/js/sync-config.js 有本地改动（云同步开关），已标记 skip-worktree，保留服务器上的设置"
    DIRTY="$(git status --porcelain --untracked-files=no)"
    ;;
esac

if [ -n "$DIRTY" ]; then
  mapfile -t DIRTY_PATHS < <(git status --porcelain=v1 --untracked-files=no | cut -c4-)
  DEPLOY_PATHS=()
  OTHER_PATHS=()
  for path in "${DIRTY_PATHS[@]}"; do
    case "$path" in
      deploy/deploy.sh|deploy/pack.sh|deploy/rollback.sh|deploy/server-update.sh)
        DEPLOY_PATHS+=("$path")
        ;;
      *)
        OTHER_PATHS+=("$path")
        ;;
    esac
  done

  if [ "${#OTHER_PATHS[@]}" -gt 0 ]; then
    echo ""
    echo "✗ 检测到业务文件的本地改动，为避免覆盖已停止更新："
    printf '  %s\n' "${OTHER_PATHS[@]}"
    echo ""
    echo "  请先在本地修改并 push；服务器上的业务文件应保持与 Git 一致。"
    if [ "${#DEPLOY_PATHS[@]}" -gt 0 ]; then
      echo "  deploy/ 脚本本地改动本可自动备份，但需先处理上面的业务文件。"
    fi
    exit 1
  fi

  if [ "${#DEPLOY_PATHS[@]}" -gt 0 ]; then
    BACKUP_DIR="${XK_BACKUP_DIR:-/www/xiaokedz-backups}"
    if ! mkdir -p "$BACKUP_DIR" 2>/dev/null; then
      BACKUP_DIR="${TMPDIR:-/tmp}/xiaokedz-backups"
      mkdir -p "$BACKUP_DIR"
    fi
    BACKUP_FILE="$BACKUP_DIR/deploy-local-$(date +%Y%m%d-%H%M%S).patch"
    git diff --binary HEAD -- "${DEPLOY_PATHS[@]}" > "$BACKUP_FILE"
    echo "→ deploy/ 脚本有本地改动，已备份：$BACKUP_FILE"
    git restore --source=HEAD --staged --worktree -- "${DEPLOY_PATHS[@]}"
    echo "→ 已恢复 deploy/ 脚本到服务器当前版本，继续更新"
    DIRTY="$(git status --porcelain --untracked-files=no)"
    if [ -n "$DIRTY" ]; then
      echo "✗ 恢复 deploy/ 后仍有本地改动，停止更新："
      printf '%s\n' "$DIRTY"
      exit 1
    fi
  fi
fi

echo "→ 拉取 origin/main …"
if ! git pull --ff-only origin main; then
  echo "✗ 拉取失败。常见原因和对应处理："
  echo "   1) 连不上 GitHub（443 超时）→ 改用 deploy/pack.sh 打包上传"
  echo "   2) 历史分叉（non-fast-forward）→ git fetch origin && git reset --hard origin/main"
  echo "      ⚠ reset --hard 会丢掉服务器上的所有本地改动，执行前先确认"
  echo "   3) 归属校验（dubious ownership）→ git config --global --add safe.directory $SITE"
  echo "   4) 提示 sync-config.js 会被覆盖 → 先 git update-index --no-skip-worktree assets/js/sync-config.js"
  exit 1
fi

echo "→ 修正权限 …"
chown -R www:www "$SITE" 2>/dev/null || true
find "$SITE" -path "$SITE/.git" -prune -o -type d -exec chmod 755 {} + 2>/dev/null || true
find "$SITE" -path "$SITE/.git" -prune -o -type f ! -name '.user.ini' -exec chmod 644 {} + 2>/dev/null || true
if [ -f "$SITE/api/config.php" ]; then
  chown www:www "$SITE/api/config.php" 2>/dev/null || true
  chmod 600 "$SITE/api/config.php"
fi
chmod +x "$SITE"/deploy/*.sh 2>/dev/null || true

echo ""
echo "✓ 已更新到 $(git rev-parse --short HEAD) $(git log -1 --format=%s)"
echo "  浏览器强制刷新 Ctrl+F5 看新内容（CSS/JS 有 7 天缓存）"
