#!/bin/bash

# Database backup script for Card Operations System
# This script creates a backup of the PostgreSQL database and manages retention

# Configuration
BACKUP_DIR="/path/to/backups"
DB_NAME="card_operations"
DB_USER="postgres"
RETENTION_DAYS=30

# Create timestamp for the backup file
DATETIME=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATETIME.sql"

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Display start message
echo "Starting backup of $DB_NAME database at $(date)"

# Perform backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Compress backup file
    echo "Compressing backup file..."
    gzip $BACKUP_FILE
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    
    echo "Backup completed successfully at $(date)"
    echo "Backup file: ${BACKUP_FILE}.gz"
    echo "Backup size: $BACKUP_SIZE"
    
    # Remove old backups
    echo "Removing backups older than $RETENTION_DAYS days..."
    find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(find $BACKUP_DIR -name "${DB_NAME}_*.sql.gz" | wc -l)
    echo "Current backup count: $BACKUP_COUNT"
else
    echo "Backup failed with error code $?"
    exit 1
fi

echo "Backup process completed at $(date)"