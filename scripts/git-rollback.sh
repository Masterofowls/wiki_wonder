#!/usr/bin/env bash
# git-rollback.sh — Safe rollback helper using tags and reflog
# Usage: ./scripts/git-rollback.sh [--tag v1.2.3 | --steps N | --commit <sha>]
set -euo pipefail

log()  { echo -e "\033[32m[rollback]\033[0m $*"; }
warn() { echo -e "\033[33m[rollback]\033[0m $*"; }
err()  { echo -e "\033[31m[rollback]\033[0m $*" >&2; }

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_SHA=$(git rev-parse HEAD)

show_help() {
  cat <<EOF
git-rollback.sh — Safe rollback helper

Usage:
  ./scripts/git-rollback.sh --tag <tag>          Rollback to a specific tag
  ./scripts/git-rollback.sh --steps <n>          Rollback n commits (creates backup tag)
  ./scripts/git-rollback.sh --commit <sha>       Rollback to a specific commit SHA
  ./scripts/git-rollback.sh --list-tags          List available rollback tags
  ./scripts/git-rollback.sh --reflog             Show recent reflog entries
  ./scripts/git-rollback.sh --help               Show this help

Examples:
  ./scripts/git-rollback.sh --tag v1.0.0
  ./scripts/git-rollback.sh --steps 3
  ./scripts/git-rollback.sh --commit abc1234
EOF
}

list_tags() {
  log "Available tags:"
  git tag --sort=-creatordate | head -20
}

show_reflog() {
  log "Recent reflog entries:"
  git reflog --oneline -20
}

save_backup_tag() {
  local TAG="rollback-backup-$(date +%Y%m%d-%H%M%S)"
  git tag "$TAG"
  log "Backup tag created: $TAG"
  echo "$TAG"
}

confirm() {
  read -rp "$1 [y/N] " reply
  [[ "${reply:-n}" =~ ^[Yy]$ ]]
}

case "${1:---help}" in
  --help|-h)
    show_help
    ;;
  --list-tags)
    list_tags
    ;;
  --reflog)
    show_reflog
    ;;
  --tag)
    TAG="${2:?'Provide a tag name: --tag v1.0.0'}"
    log "Rolling back to tag: $TAG (current: $CURRENT_SHA)"
    if confirm "This will reset HEAD on branch '$CURRENT_BRANCH'. Continue?"; then
      save_backup_tag
      git checkout "$TAG"
      log "Now at tag $TAG. Run 'git checkout $CURRENT_BRANCH' to return."
    else
      warn "Rollback cancelled."
    fi
    ;;
  --steps)
    N="${2:?'Provide number of steps: --steps 3'}"
    log "Rolling back $N commit(s) on branch '$CURRENT_BRANCH'"
    if confirm "Reset HEAD~$N? This will update the working tree."; then
      BACKUP=$(save_backup_tag)
      git reset --hard "HEAD~${N}"
      log "Rolled back $N steps. Backup at $BACKUP."
    else
      warn "Rollback cancelled."
    fi
    ;;
  --commit)
    SHA="${2:?'Provide a commit SHA: --commit abc1234'}"
    log "Rolling back to commit: $SHA"
    if confirm "Reset to $SHA on '$CURRENT_BRANCH'?"; then
      BACKUP=$(save_backup_tag)
      git reset --hard "$SHA"
      log "Rolled back to $SHA. Backup at $BACKUP."
    else
      warn "Rollback cancelled."
    fi
    ;;
  *)
    err "Unknown option: $1"
    show_help
    exit 1
    ;;
esac
