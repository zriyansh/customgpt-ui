# Analytics Dashboard Debugging Guide

The Analytics Dashboard is showing a 404 error. Here's how to debug and fix this issue:

## Step 1: Check if you have an agent selected

1. Go to http://localhost:3002 (or your local dev server)
2. Make sure you have an API key configured
3. Create or select an agent from the dropdown

## Step 2: Verify agent is selected before navigating

The analytics page requires a current agent to be selected. If no agent is selected, you'll be redirected to the home page.

## Step 3: Check the URL patterns

Make sure you're accessing:
- Development: http://localhost:3002/analytics
- Not: any external URL that might give a 404

## Step 4: Verify API endpoints

The analytics page tries to fetch data from these endpoints:
- `GET /api/v1/projects/{project_id}/analytics/conversations/`
- `GET /api/v1/projects/{project_id}/analytics/queries/`
- `GET /api/v1/projects/{project_id}/analytics/traffic/`
- `GET /api/v1/projects/{project_id}/analytics/statistics/`
- `GET /api/v1/projects/{project_id}/analytics/reports/`

## Step 5: Mock data for testing

If the API endpoints aren't working, the analytics store has mock data fallback.

## Temporary Fix

To test the analytics page with mock data:

1. Go to http://localhost:3002
2. Set up your API key if not already done
3. Create a test agent
4. Select the agent from the dropdown
5. Navigate to Analytics via the sidebar

## Expected behavior

Once an agent is selected, the analytics page should load with:
- Performance metrics cards
- Charts showing conversation and query data
- Date range picker
- Export functionality