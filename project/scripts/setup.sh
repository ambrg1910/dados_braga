#!/bin/bash

# Setup script for Card Operations System
# This script helps with initial setup of the project

echo "=== Card Operations System Setup ==="
echo "This script will help you set up the Card Operations System."

# Check for required tools
echo "\nChecking for required tools..."

command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed. Aborting."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "PostgreSQL is required but not installed. Aborting."; exit 1; }

# Display versions
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
PSQL_VERSION=$(psql --version | awk '{print $3}')

echo "Node.js version: $NODE_VERSION"
echo "npm version: $NPM_VERSION"
echo "PostgreSQL version: $PSQL_VERSION"

# Check if we're in the project root directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: This script must be run from the project root directory."
    exit 1
fi

# Function to create .env files
create_env_files() {
    echo "\nSetting up environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        echo "Creating backend/.env file..."
        cp backend/.env.example backend/.env
        echo "Please update backend/.env with your database credentials."
    else
        echo "backend/.env already exists. Skipping."
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        echo "Creating frontend/.env file..."
        cp frontend/.env.example frontend/.env
        echo "Please update frontend/.env with your API URL if needed."
    else
        echo "frontend/.env already exists. Skipping."
    fi
}

# Function to install dependencies
install_dependencies() {
    echo "\nInstalling dependencies..."
    
    echo "Installing backend dependencies..."
    cd backend && npm install
    if [ $? -ne 0 ]; then
        echo "Error installing backend dependencies."
        exit 1
    fi
    
    echo "Installing frontend dependencies..."
    cd ../frontend && npm install
    if [ $? -ne 0 ]; then
        echo "Error installing frontend dependencies."
        exit 1
    fi
    
    cd ..
}

# Function to set up database
setup_database() {
    echo "\nSetting up database..."
    
    # Source the .env file to get database credentials
    if [ -f "backend/.env" ]; then
        source <(grep -v '^#' backend/.env | sed -E 's/(.*)=(.*)/\1="\2"/')
    else
        echo "Error: backend/.env file not found."
        exit 1
    fi
    
    # Check if database exists
    DB_EXISTS=$(psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -w "$DB_NAME" | wc -l)
    
    if [ "$DB_EXISTS" -eq 0 ]; then
        echo "Creating database $DB_NAME..."
        createdb -U "$DB_USER" "$DB_NAME"
        if [ $? -ne 0 ]; then
            echo "Error creating database. Please check your PostgreSQL installation and credentials."
            exit 1
        fi
    else
        echo "Database $DB_NAME already exists."
        read -p "Do you want to reset the database? This will delete all data. (y/N): " RESET_DB
        if [ "$RESET_DB" = "y" ] || [ "$RESET_DB" = "Y" ]; then
            echo "Dropping database $DB_NAME..."
            dropdb -U "$DB_USER" "$DB_NAME"
            echo "Creating database $DB_NAME..."
            createdb -U "$DB_USER" "$DB_NAME"
        fi
    fi
    
    # Run migrations
    echo "Running database migrations..."
    cd backend && npx sequelize-cli db:migrate
    if [ $? -ne 0 ]; then
        echo "Error running migrations."
        exit 1
    fi
    
    # Seed database
    echo "Seeding database with initial data..."
    npx sequelize-cli db:seed:all
    if [ $? -ne 0 ]; then
        echo "Error seeding database."
        exit 1
    fi
    
    cd ..
}

# Function to create required directories
create_directories() {
    echo "\nCreating required directories..."
    
    # Create uploads directory
    mkdir -p backend/uploads
    echo "Created backend/uploads directory."
    
    # Create logs directory
    mkdir -p backend/logs
    echo "Created backend/logs directory."
}

# Main setup process
echo "\nStarting setup process..."

# Ask for confirmation
read -p "This will set up the Card Operations System. Continue? (Y/n): " CONTINUE
if [ "$CONTINUE" = "n" ] || [ "$CONTINUE" = "N" ]; then
    echo "Setup cancelled."
    exit 0
fi

# Run setup steps
create_env_files
create_directories
install_dependencies
setup_database

echo "\n=== Setup Complete ==="
echo "You can now start the application:"
echo "  Backend: cd backend && npm start"
echo "  Frontend: cd frontend && npm start"
echo "\nDefault admin credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo "\nIMPORTANT: Change the default admin password after first login!"