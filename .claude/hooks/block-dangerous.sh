#!/bin/bash
# PreToolUse hook: 拦截危险命令
# 退出码 0 = 放行, 2 = 拦截

INPUT=$(cat)
TOOL=$(echo "$INPUT" | jq -r '.tool_name // empty')
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ "$TOOL" = "Bash" ] || [ "$TOOL" = "PowerShell" ]; then
  if echo "$COMMAND" | grep -qE 'rm\s+-rf\s+/|drop\s+table|truncate\s+table|\.env'; then
    echo "BLOCKED: 危险命令被拦截 - $COMMAND"
    exit 2
  fi
fi

exit 0
