@echo off
SETLOCAL EnableDelayedExpansion

SET ENVIRONMENT=%1
IF "%ENVIRONMENT%"=="" SET ENVIRONMENT=production
SET BACKUP_TYPE=%2
IF "%BACKUP_TYPE%"=="" SET BACKUP_TYPE=full

echo 🗄️  Creating database backup for %ENVIRONMENT%...

:: Configuration
SET TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%-%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET BACKUP_DIR=%TEMP%\glowverse-backups
IF NOT EXIST "%BACKUP_DIR%" MKDIR "%BACKUP_DIR%"

IF "%ENVIRONMENT%"=="production" (
    SET DB_INSTANCE=glowverse-production
    SET DB_HOST=%PRODUCTION_DB_HOST%
    SET DB_NAME=%PRODUCTION_DB_NAME%
    SET DB_USER=%PRODUCTION_DB_USER%
    SET DB_PASSWORD=%PRODUCTION_DB_PASSWORD%
) ELSE IF "%ENVIRONMENT%"=="staging" (
    SET DB_INSTANCE=glowverse-staging
    SET DB_HOST=%STAGING_DB_HOST%
    SET DB_NAME=%STAGING_DB_NAME%
    SET DB_USER=%STAGING_DB_USER%
    SET DB_PASSWORD=%STAGING_DB_PASSWORD%
) ELSE (
    echo [ERROR] Invalid environment: %ENVIRONMENT%
    exit /b 1
)

SET BACKUP_FILE=%ENVIRONMENT%-%BACKUP_TYPE%-%TIMESTAMP%.sql
SET COMPRESSED_FILE=%BACKUP_FILE%.gz
SET ENCRYPTED_FILE=%BACKUP_FILE%.gpg

:: Check for pg_dump
where pg_dump >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pg_dump not found in PATH. Please install PostgreSQL tools.
    exit /b 1
)

echo Creating SQL dump...
SET PGPASSWORD=%DB_PASSWORD%

pg_dump --host=%DB_HOST% --username=%DB_USER% --dbname=%DB_NAME% --format=custom --verbose --file="%BACKUP_DIR%\%BACKUP_FILE%"

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SQL dump failed.
    SET PGPASSWORD=
    exit /b 1
)
SET PGPASSWORD=

echo Backup created: %BACKUP_FILE%

:: Note: Compression and encryption would require 7zip / GPG for Windows
echo [INFO] Skipping compression/encryption/S3 upload as they require additional tools (7zip, GPG, AWS CLI) to be configured on Windows.
echo [INFO] Backup file is available at: %BACKUP_DIR%\%BACKUP_FILE%

echo Database backup process completed.
