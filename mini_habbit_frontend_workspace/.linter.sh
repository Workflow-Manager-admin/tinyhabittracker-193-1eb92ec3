#!/bin/bash
cd /home/kavia/workspace/code-generation/tinyhabittracker-193-1eb92ec3/mini_habbit_frontend_workspace/mini_habbit_frontend
npm run lint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

