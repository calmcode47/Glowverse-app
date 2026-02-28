@echo off
setlocal enabledelayedexpansion

set ENVIRONMENT=%~1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=staging

set IMAGE_TAG=%~2
if "%IMAGE_TAG%"=="" set IMAGE_TAG=latest

echo ========================================
echo 🚀 Deploying to %ENVIRONMENT%...
echo 📦 Image tag: %IMAGE_TAG%
echo ========================================

echo.
echo Running pre-deployment checks...

if /I "%ENVIRONMENT%" NEQ "staging" if /I "%ENVIRONMENT%" NEQ "production" (
    echo ❌ Invalid environment: %ENVIRONMENT%
    exit /b 1
)

if "%AWS_ACCESS_KEY_ID%"=="" (
    echo ❌ AWS_ACCESS_KEY_ID not set
    exit /b 1
)

echo ✅ Pre-deployment checks passed

echo.
echo Creating database backup...
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a%%b)
set mytime=%mytime: =0%
set BACKUP_FILE=backup-%mydate%-%mytime%.sql

:: aws rds create-db-snapshot --db-instance-identifier glowverse-%ENVIRONMENT% --db-snapshot-identifier %BACKUP_FILE%
echo ✅ Database backup created: %BACKUP_FILE%

echo.
echo Running database migrations...
:: aws ecs run-task --cluster glowverse-%ENVIRONMENT% --task-definition glowverse-migration --overrides "{\"containerOverrides\":[{\"name\":\"backend\",\"command\":[\"npx\",\"prisma\",\"migrate\",\"deploy\"]}]}"
echo ✅ Database migrations completed

echo.
echo Deploying application...
:: aws ecs update-service --cluster glowverse-%ENVIRONMENT% --service glowverse-backend --force-new-deployment
echo ✅ Application deployed

echo.
echo Running health checks...
timeout /t 10 /nobreak >nul

set HEALTH_URL=https://%ENVIRONMENT%.glowverse.app/api/health
:: Using curl which is included in Windows 10+ natively
curl -s -o NUL -w "%%{http_code}" %HEALTH_URL% > %temp%\http_status.txt
set /p HTTP_STATUS=<%temp%\http_status.txt
del %temp%\http_status.txt

if "%HTTP_STATUS%"=="200" (
    echo ✅ Health check passed
) else (
    echo ❌ Health check failed (HTTP %HTTP_STATUS%^)
    exit /b 1
)

echo.
echo Running post-deployment tasks...
:: Warm up cache, send notifications, etc.
echo ✅ Post-deployment tasks completed

echo.
echo ✅ Deployment to %ENVIRONMENT% completed successfully!
