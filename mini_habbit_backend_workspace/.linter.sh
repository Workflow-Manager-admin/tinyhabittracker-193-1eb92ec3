#!/bin/bash
cd /home/kavia/workspace/code-generation/tinyhabittracker-193-1eb92ec3/mini_habbit_backend_workspace/mini_habbit_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

