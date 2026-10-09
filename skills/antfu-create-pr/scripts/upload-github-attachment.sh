#!/usr/bin/env bash
# Upload one local file to GitHub user-attachments and print its URL.
# Fallback for GitHub CLI versions without `gh pr create --attach`.
set -euo pipefail

usage() {
  printf 'Usage: %s [--repo OWNER/REPO] [--content-type MIME] FILE\n' "$(basename "$0")"
}

repository=''
content_type=''
attachment_file=''

while (($# > 0)); do
  case "$1" in
    --repo) repository="${2:-}"; shift 2 ;;
    --content-type) content_type="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    --*) printf 'Unknown option: %s\n' "$1" >&2; usage >&2; exit 2 ;;
    *)
      if [[ -n "$attachment_file" ]]; then
        printf 'Only one file can be uploaded per invocation.\n' >&2
        exit 2
      fi
      attachment_file="$1"; shift ;;
  esac
done

for tool in gh curl; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    printf '%s is required.\n' "$tool" >&2
    exit 127
  fi
done

if [[ -z "$attachment_file" || ! -f "$attachment_file" ]]; then
  printf 'Provide one existing local file.\n' >&2
  usage >&2
  exit 2
fi

if [[ -z "$repository" ]]; then
  repository="$(gh repo view --json nameWithOwner --jq .nameWithOwner 2>/dev/null || true)"
fi
if [[ -z "$repository" ]]; then
  printf 'Could not resolve a GitHub repository. Run inside a checkout or pass --repo OWNER/REPO.\n' >&2
  exit 2
fi

token="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$token" ]]; then
  token="$(gh auth token 2>/dev/null || true)"
fi
if [[ -z "$token" ]]; then
  printf 'GitHub authentication is required. Run gh auth login or set GH_TOKEN/GITHUB_TOKEN.\n' >&2
  exit 1
fi

if [[ -z "$content_type" ]]; then
  if ! command -v file >/dev/null 2>&1; then
    printf 'The file utility is required for MIME detection; install it or pass --content-type.\n' >&2
    exit 127
  fi
  content_type="$(file --brief --mime-type "$attachment_file")"
fi

repository_id="$(GH_TOKEN="$token" gh api "repos/$repository" --jq .id)"

# Undocumented endpoint, observed from the web UI upload flow.
response="$(curl --silent --show-error --fail-with-body \
  --request POST \
  --header "Authorization: Bearer $token" \
  --header 'Accept: application/json' \
  --url-query "name=$(basename "$attachment_file")" \
  --url-query "content_type=$content_type" \
  --url-query "repository_id=$repository_id" \
  --data-binary "@$attachment_file" \
  'https://uploads.github.com/user-attachments/assets')"

attachment_url="$(printf '%s' "$response" | sed -n 's/.*"url"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
if [[ "$attachment_url" != https://github.com/user-attachments/* ]]; then
  printf 'GitHub did not return a user-attachment URL.\n' >&2
  exit 1
fi

printf '%s\n' "$attachment_url"
