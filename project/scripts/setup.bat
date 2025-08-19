@echo off
setlocal enabledelayedexpansion

echo === Card Operations System Setup ===
echo This script will help you set up the Card Operations System.

REM Check for required tools
echo.
echo Checking for required tools...

where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is required but not installed. Aborting.
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo npm is required but not installed. Aborting.
    exit /b 1
)

where psql >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo PostgreSQL is required but not installed. Aborting.
    exit /b 1
)

REM Display versions
for /f "tokens=*" %%a in ('node -v') do set NODE_VERSION=%%a
for /f "tokens=*" %%a in ('npm -v') do set NPM_VERSION=%%a
for /f "tokens=3" %%a in ('psql --version') do set PSQL_VERSION=%%a

echo Node.js version: %NODE_VERSION%
echo npm version: %NPM_VERSION%
echo PostgreSQL version: %PSQL_VERSION%

REM Check if we're in the project root directory
if not exist "backend" (
    echo Error: This script must be run from the project root directory.
    exit /b 1
)

if not exist "frontend" (
    echo Error: This script must be run from the project root directory.
    exit /b 1
)

REM Function to create .env files
echo.
echo Setting up environment files...

REM Backend .env
if not exist "backend\.env" (
    echo Creating backend\.env file...
    copy backend\.env.example backend\.env
    echo Please update backend\.env with your database credentials.
) else (
    echo backend\.env already exists. Skipping.
)

REM Frontend .env
if not exist "frontend\.env" (
    echo Creating frontend\.env file...
    copy frontend\.env.example frontend\.env
    echo Please update frontend\.env with your API URL if needed.
) else (
    echo frontend\.env already exists. Skipping.
)

REM Function to create required directories
echo.
echo Creating required directories...

REM Create uploads directory
if not exist "backend\uploads" (
    mkdir "backend\uploads"
    echo Created backend\uploads directory.
) else (
    echo backend\uploads directory already exists.
)

REM Create logs directory
if not exist "backend\logs" (
    mkdir "backend\logs"
    echo Created backend\logs directory.
) else (
    echo backend\logs directory already exists.
)

REM Function to install dependencies
echo.
echo Installing dependencies...

echo Installing backend dependencies...
cd backend
npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing backend dependencies.
    exit /b 1
)

echo Installing frontend dependencies...
cd ..\frontend
npm install
if %ERRORLEVEL% neq 0 (
    echo Error installing frontend dependencies.
    exit /b 1
)

cd ..

REM Function to set up database
echo.
echo Setting up database...

REM Extract database credentials from .env file
if exist "backend\.env" (
    for /f "tokens=1,2 delims==" %%a in ('type backend\.env ^| findstr /v "^#" ^| findstr "DB_"') do (
        set %%a=%%b
    )
) else (
    echo Error: backend\.env file not found.
    exit /b 1
)

REM Check if database exists
set DB_EXISTS=0
for /f "tokens=*" %%a in ('psql -U %DB_USER% -lqt ^| findstr /i "%DB_NAME%"') do (
    set DB_EXISTS=1
)

if %DB_EXISTS%==0 (
    echo Creating database %DB_NAME%...
    createdb -U %DB_USER% %DB_NAME%
    if %ERRORLEVEL% neq 0 (
        echo Error creating database. Please check your PostgreSQL installation and credentials.
        exit /b 1
    )
) else (
    echo Database %DB_NAME% already exists.
    set /p RESET_DB="Do you want to reset the database? This will delete all data. (y/N): "
    if /i "!RESET_DB!"=="y" (
        echo Dropping database %DB_NAME%...
        dropdb -U %DB_USER% %DB_NAME%
        echo Creating database %DB_NAME%...
        createdb -U %DB_USER% %DB_NAME%
    )
)

REM Run migrations
echo Running database migrations...
cd backend
npx sequelize-cli db:migrate
if %ERRORLEVEL% neq 0 (
    echo Error running migrations.
    exit /b 1
)

REM Seed database
echo Seeding database with initial data...
npx sequelize-cli db:seed:all
if %ERRORLEVEL% neq 0 (
    echo Error seeding database.
    exit /b 1
)

cd ..

echo.
echo === Setup Complete ===
echo You can now start the application:
echo   Backend: cd backend ^&^& npm start
echo   Frontend: cd frontend ^&^& npm start
echo.
echo Default admin credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo IMPORTANT: Change the default admin password after first login!

endlocal