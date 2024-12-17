@echo off
IF NOT EXIST "node_modules" (
    echo node_modules not found. Running setup.bat...
    call setup.bat
)

IF NOT EXIST "dist" (
    echo dist folder not found. Running setup.bat...
    call setup.bat
)

echo Running dist/index.js...
node dist/index.js
pause