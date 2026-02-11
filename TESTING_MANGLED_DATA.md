# Testing Mangled Data Support

This document describes the mock endpoints available for testing the handling of "mangled data" (reports with null teams/authors and validation warnings).

## Running the Mock Server

Start the mock server with:

```bash
pnpm run mock-dev
```

This will start both the mock backend server (port 8787) and the Next.js dev server in mock mode.

## Test Endpoints

### 1. Report with No Team (null team)

**URL**: `http://localhost:3000/reports/mangled-no-team`

**Mangled Data**:

- `team: null`
- Validation warning for missing team

**Expected Behavior**:

- Orange warning alert displayed at top of page with Norwegian message about missing team
- No crash when rendering metadata
- Contact information displayed about Slack channel #researchops

---

### 2. Report with No Author (null author)

**URL**: `http://localhost:3000/reports/mangled-no-author`

**Mangled Data**:

- `author: null`
- Validation warning for missing author

**Expected Behavior**:

- Orange warning alert displayed at top of page with Norwegian message about missing author
- Metadata tab doesn't display "Opprettet av" field
- Contact information about Slack channel

---

### 3. Aggregated Report with Both Null Team and Author

**URL**: `http://localhost:3000/reports/aggregated/mangled-aggregated`

**Mangled Data**:

- `team: null`
- `author: null`
- Two validation warnings (one for team, one for author)

**Expected Behavior**:

- Two separate warning alerts displayed at top
- Both warnings show helpful Norwegian messages
- Page renders correctly without crashes

---

### 4. Admin Diagnostics Page

**URL**: `http://localhost:3000/admin/diagnostics`

**Mock Data**:

- Total reports: 25
- Reports with null team: 3
- List of affected reports with IDs and links

**Expected Behavior**:

- Summary statistics displayed
- Table showing all reports missing team assignments
- Links to view each affected report
- Report type (Enkelt/Samslått) displayed
- Admin-only access (requires admin privileges)

---

## Testing Checklist

- [ ] Visit `/reports/mangled-no-team` - verify warning displays with Norwegian text
- [ ] Visit `/reports/mangled-no-author` - verify author warning displays
- [ ] Visit `/reports/aggregated/mangled-aggregated` - verify both warnings display
- [ ] Check that metadata tabs handle null values gracefully
- [ ] Visit `/admin/diagnostics` - verify diagnostics page works
- [ ] Verify diagnostics page shows correct count and list of affected reports
- [ ] Click links in diagnostics table to navigate to affected reports
- [ ] Verify warning messages mention Slack channel #researchops

---

## Warning Messages (Norwegian)

**Team Warning**:

> Denne rapporten mangler et team. Kjenner du igjen denne rapporten? Ta kontakt med oss på Slack-kanalen #researchops og del lenken med oss, samt hvem eller hvilket team som burde eie den.

**Author Warning**:

> Denne rapporten mangler forfatterinformasjon. Hvis du vet hvem som opprettet denne rapporten, ta kontakt med oss på Slack-kanalen #researchops.

---

## Mock API Endpoints

The following mock endpoints have been added to `mock/server.ts`:

1. `GET /api/reports/mangled-no-team` - Single report with null team
2. `GET /api/reports/mangled-no-author` - Single report with null author
3. `GET /api/reports/aggregated/mangled-aggregated` - Aggregated report with both null
4. `GET /admin/reports/diagnostics` - Admin diagnostics data

All endpoints return proper TypeScript-compliant responses matching the updated type definitions.
