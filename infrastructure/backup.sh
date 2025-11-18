#!/bin/bash

BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup all MongoDB databases
mongodump --uri="mongodb://admin:${MONGO_PASSWORD}@localhost:27017" \
  --out=$BACKUP_DIR/$TIMESTAMP

# Compress backup
tar -czf $BACKUP_DIR/$TIMESTAMP.tar.gz $BACKUP_DIR/$TIMESTAMP
rm -rf $BACKUP_DIR/$TIMESTAMP

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/$TIMESTAMP.tar.gz s3://my-backup-bucket/

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: $BACKUP_DIR/$TIMESTAMP.tar.gz"
