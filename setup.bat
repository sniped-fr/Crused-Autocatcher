@echo off

where yarn >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Yarn not found. Installing Yarn...
    npm install -g yarn
)

where tsc >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo TypeScript not found. Installing TypeScript...
    npm install -g typescript
)

IF NOT EXIST "node_modules" (
    echo node_modules not found. Installing dependencies...
    yarn install
)

echo Compiling TypeScript...
tsc

echo Setup complete.
pause
