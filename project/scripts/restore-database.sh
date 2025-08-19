#!/bin/bash

# Database restore script for Card Operations System
# This script restores a PostgreSQL database from a backup file

# Configuration
DB_NAME="card_operations"
DB_USER="postgres"
BACKUP_DIR="/path/to/backups"

# Function to display usage information
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo "Restore the $DB_NAME database from a backup file."
    echo ""
    echo "Options:"
    echo "  -f, --file FILENAME   Specify the backup file to restore from"
    echo "  -l, --list            List available backup files"
    echo "  -h, --help            Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --list"
    echo "  $0 --file ${DB_NAME}_20230501_120000.sql.gz"
}

# Function to list available backup files
list_backups() {
    echo "Available backup files in $BACKUP_DIR:"
    echo ""
    
    # Check if backup directory exists and is not empty
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        # List backup files sorted by date (newest first)
        find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f | sort -r | while read -r file; do
            # Extract filename and creation date
            filename=$(basename "$file")
            creation_date=$(date -r "$file" "+%Y-%m-%d %H:%M:%S")
            file_size=$(du -h "$file" | cut -f1)
            
            echo "$filename (Created: $creation_date, Size: $file_size)"
        done
    else
        echo "No backup files found in $BACKUP_DIR"
        exit 1
    fi
}

# Function to restore database from backup
restore_database() {
    local backup_file="$1"
    local full_path="$BACKUP_DIR/$backup_file"
    
    # Check if backup file exists
    if [ ! -f "$full_path" ]; then
        echo "Error: Backup file '$backup_file' not found in $BACKUP_DIR"
        exit 1
    fi
    
    echo "Preparing to restore $DB_NAME from backup: $backup_file"
    echo "WARNING: This will overwrite the current database. All current data will be lost."
    echo "Press CTRL+C now to abort, or press ENTER to continue..."
    read -r
    
    echo "Starting restore process at $(date)"
    
    # Create temporary directory for extraction
    TMP_DIR=$(mktemp -d)
    echo "Extracting backup file..."
    
    # Extract the gzipped SQL file
    gunzip -c "$full_path" > "$TMP_DIR/${DB_NAME}.sql"
    
    # Drop and recreate the database
    echo "Dropping existing database..."
    dropdb -U "$DB_USER" --if-exists "$DB_NAME"
    
    echo "Creating new database..."
    createdb -U "$DB_USER" "$DB_NAME"
    
    # Restore from the extracted SQL file
    echo "Restoring database from backup..."
    psql -U "$DB_USER" -d "$DB_NAME" -f "$TMP_DIR/${DB_NAME}.sql"
    
    # Check if restore was successful
    if [ $? -eq 0 ]; then
        echo "Database restore completed successfully at $(date)"
    else
        echo "Database restore failed with error code $?"
        exit 1
    fi
    
    # Clean up temporary files
    rm -rf "$TMP_DIR"
}

# Parse command line arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

while [ $# -gt 0 ]; do
    case "$1" in
        -f|--file)
            if [ -z "$2" ]; then
                echo "Error: Backup filename not specified"
                exit 1
            fi
            BACKUP_FILE="$2"
            restore_database "$BACKUP_FILE"
            shift 2
            ;;
        -l|--list)
            list_backups
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo "Error: Unknown option '$1'"
            show_usage
            exit 1
            ;;
    esac
done