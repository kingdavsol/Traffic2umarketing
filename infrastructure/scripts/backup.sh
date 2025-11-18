#!/bin/bash

# Automated Backup Strategy
# Daily snapshots of databases and configurations

BACKUP_DIR="/backups/traffic2umarketing"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "🗄️  Backing up MongoDB..."
docker exec mongo-master mongodump --authenticationDatabase admin -u admin -p $MONGO_PASSWORD -o $BACKUP_DIR/mongodb_$TIMESTAMP

# Backup Redis
echo "🗄️  Backing up Redis..."
docker exec redis redis-cli --rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb

# Compress backups
echo "📦 Compressing backups..."
tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz $BACKUP_DIR/mongodb_$TIMESTAMP $BACKUP_DIR/redis_$TIMESTAMP.rdb

# Clean old backups
echo "🗑️  Cleaning old backups..."
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
  echo "☁️  Uploading to S3..."
  aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.tar.gz s3://traffic2u-backups/
fi

echo "✅ Backup complete!"
