#!/bin/bash

# Name: run_with_all_permissions.sh
# Purpose: Run main.ts with Deno, allowing all permissions.

echo "Starting main.ts with all permissions..."

deno run --watch --allow-all main.ts