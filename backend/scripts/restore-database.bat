@echo off
SETLOCAL EnableDelayedExpansion

SET ENVIRONMENT=%1
SET BACKUP_FILE=%2

IF "%ENVIRONMENT%"=="" (
    echo Usage: restore-database.bat ^<environment^> ^<backup-file^>
    exit /b 1
)
IF "%BACKUP_FILE%"=="" (
    echo Usage: restore-database.bat ^<environment^> ^<backup-file^>
    exit /b 1
)

echo 🔄 Restoring database for %ENVIRONMENT% from %BACKUP_FILE%...

IF "%ENVIRONMENT%"=="production" (
    echo [WARNING] You are about to restore the PRODUCTION database!
    set /p CONFIRM="Type 'RESTORE PRODUCTION' to continue: "
    if "!CONFIRM!" NEQ "RESTORE PRODUCTION" (
        echo Restore cancelled.
        exit /b 0
    )
    SET DB_HOST=%PRODUCTION_DB_HOST%
    SET DB_NAME=%PRODUCTION_DB_NAME%
    SET DB_USER=%PRODUCTION_DB_USER%
    SET DB_PASSWORD=%PRODUCTION_DB_PASSWORD%
) ELSE IF "%ENVIRONMENT%"=="staging" (
    SET DB_HOST=%STAGING_DB_HOST%
    SET DB_NAME=%STAGING_DB_NAME%
    SET DB_USER=%STAGING_DB_USER%
    SET DB_PASSWORD=%STAGING_DB_PASSWORD%
) ELSE (
    echo [ERROR] Invalid environment: %ENVIRONMENT%
    exit /b 1
)

where pg_restore >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pg_restore not found in PATH.
    exit /b 1
)

echo Restoring database...
SET PGPASSWORD=%DB_PASSWORD%

:: Drop connections (requires psql)
psql --host=%DB_HOST% --username=%DB_USER% --dbname=postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='%DB_NAME%' AND pid <> pg_backend_pid();"

pg_restore --host=%DB_HOST% --username=%DB_USER% --dbname=%DB_NAME% --clean --if-exists --verbose "%BACKUP_FILE%"

IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Restore failed.
    SET PGPASSWORD=
) ELSE (
    echo [SUCCESS] Database restored successfully.
    SET PGPASSWORD=
)

echo Database restore process completed.
