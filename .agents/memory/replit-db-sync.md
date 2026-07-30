---
name: Replit Database Sync
description: Replit Deployment settings have a checkbox to copy dev DB to production on publish.
---

## The Feature

In Replit's Deployment settings pane, there is a checkbox labeled:
**"Copy your development database to production database"**

## What It Does

When enabled, every time you publish, your entire **development database** (all tables: songs, settings, requests, guest musicians, etc.) is copied to the **production database**, overwriting any existing production data.

## When to Use It

- **Enable it** if you want dev and production data to stay in sync automatically.
- **Keep it off** if production has live data (e.g., real song requests from audience members) that you don't want overwritten.

## Current Project Status

For this Guilty Pleasures Karaoke app:
- Production database is the "live" one that audience members see
- Development database is where you test changes
- Enabling the checkbox is recommended since you manage the app and want changes to be consistent

## Alternative: Manual Sync

If the checkbox is off, I can manually copy specific data (songs, settings, etc.) from dev to production using the API.
