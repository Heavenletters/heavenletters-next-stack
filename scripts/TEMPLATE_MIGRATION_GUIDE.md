# Transactional Template Migration Guide

## Overview
This guide explains how to create a new transactional template in ListMonk to replace the existing campaign-based template (ID 6).

## The Problem
- Template ID 6 currently uses Campaign API format (`{{.title}}`)
- Transactional API requires Transactional template format (`{{.Tx.Data.title}}`)
- We need to create a new template specifically for transactional emails

## Solution: Create New Transactional Template

### Option 1: Create New Template via ListMonk Web Interface

1. **Access ListMonk Admin**
   - Go to: https://mailer.heavenletters.org
   - Login with admin credentials

2. **Create New Template**
   - Navigate to Templates section
   - Click "Add Template"
   - Name: "Heavenletter Daily Transactional"
   - Type: **Transactional** (not Campaign)
   - Import the HTML from: `daily_heavenletter_transactional_template.html`

3. **Update Environment Configuration**
   ```bash
   # Update scripts/.env
   HEAVENLETTER_TEMPLATE_ID=7  # Use new template ID (e.g., 7)
   ```

### Option 2: Create Template via API (if you have admin access)

```bash
# Get new template ID first, then update the script
curl -X POST https://mailer.heavenletters.org/api/templates \
  -u "bounce:fXoO3F6Vn2CrkZndwThZjA6xz3XWiJLn" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Heavenletter Daily Transactional",
    "type": "transactional",
    "data": "'"$(cat daily_heavenletter_transactional_template.html | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/  */ /g')"'"
  }'
```

## Template Differences

### Campaign Template (Current - ID 6)
```html
<h3>{{.title}}</h3>
<p>Published on {{.publishedOn}}</p>
<p>{{.body}}</p>
```

### Transactional Template (New - ID 7)
```html
<h3>{{.Tx.Data.title}}</h3>
<p>Published on {{.Tx.Data.publishedOn}}</p>
<p>{{.Tx.Data.body}}</p>
```

## Testing the Solution

1. **Update Template ID in Environment**
   ```bash
   # In scripts/.env
   HEAVENLETTER_TEMPLATE_ID=7  # Use new template ID
   ```

2. **Test Transactional Script**
   ```bash
   # Test with dry-run first
   cd scripts
   node send-daily-heavenletters-transactional.js --email=mojahkhanyi@hotmail.com --dry-run

   # Then test actual sending
   node send-daily-heavenletters-transactional.js --email=mojahkhanyi@hotmail.com
   ```

## Benefits of Transactional API

✅ **Individual Emails**: No campaign grouping, each subscriber gets personalized email
✅ **Dynamic Subject Lines**: Subject set via API parameter, no template changes needed
✅ **Immediate Delivery**: Emails sent instantly, no scheduling delays
✅ **No Campaign Storage**: Reduces ListMonk database clutter
✅ **Better Performance**: Simpler architecture, faster processing

## Migration Steps

1. ✅ Create transactional template HTML (`daily_heavenletter_transactional_template.html`)
2. ✅ Create transactional script (`send-daily-heavenletters-transactional.js`)
3. ⏳ **NEXT**: Create template in ListMonk web interface
4. ⏳ Update environment configuration with new template ID
5. ⏳ Test with actual email sending
6. ⏳ Switch to new transactional script for production

## Files Created

- `send-daily-heavenletters-transactional.js` - New transactional email script
- `daily_heavenletter_transactional_template.html` - Template for transactional emails
- `TEMPLATE_MIGRATION_GUIDE.md` - This guide

## Rollback Plan

If issues occur, you can always:
1. Keep the original script (`send-daily-heavenletters.js`) for campaign-based sending
2. Use template ID 6 for campaign-based emails
3. Switch back by using the original script