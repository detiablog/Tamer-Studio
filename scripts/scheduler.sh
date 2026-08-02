#!/bin/bash
echo "Starting scheduler..."
echo "Scheduler PID: $$"

while true; do
  CURRENT_HOUR=$(date +%H)
  CURRENT_MINUTE=$(date +%M)
  CURRENT_DAY=$(date +%u)
  
  echo "[$(date)] Scheduler tick: $(date)"
  
  if [ "$CURRENT_MINUTE" = "00" ]; then
    echo "[$(date)] Running hourly tasks..."
  fi
  
  if [ "$CURRENT_HOUR" = "02" ] && [ "$CURRENT_MINUTE" = "00" ]; then
    echo "[$(date)] Running daily backup..."
  fi
  
  if [ "$CURRENT_DAY" = "7" ] && [ "$CURRENT_HOUR" = "03" ] && [ "$CURRENT_MINUTE" = "00" ]; then
    echo "[$(date)] Running weekly cleanup..."
  fi
  
  sleep 60
done
