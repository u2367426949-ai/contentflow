#!/bin/bash
cd /root/workspace/NodeIA/contentflow
rm -rf prisma/migrations

# Connect to Neon and run migration
DATABASE_URL="postgresql://neondb_owner:***@ep-still-breeze-atbbk7tj.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
export DATABASE_URL

npx prisma migrate dev --name init 2>&1
echo "EXIT: $?"
