# Commit Message

## feat: implement multi-widget isolation with React Context

### Summary
Fixed critical issue where multiple widgets on the same page interfered with each other's conversation management. Implemented React Context-based isolation to ensure each widget instance operates independently.

### Changes
- Created `WidgetContext` and `WidgetProvider` for instance isolation
- Updated widget to wrap components with `WidgetProvider`
- Modified `ChatContainer` to use widget from context instead of global window reference
- Deprecated global `window.__customgpt_widget_instance` (kept for backward compatibility)
- Added test page for multi-widget scenarios

### Technical Details
- Each widget now has its own React Context providing instance reference
- Components access widget instance via `useWidget()` hook
- Global reference only set for first widget to maintain backward compatibility
- Session IDs include high-precision timestamps to prevent collisions

### Testing
- Created `test-multi-widget.html` to verify isolation
- Both embedded and floating widgets can coexist without conflicts
- Conversation management works independently for each widget

### Breaking Changes
None - existing single-widget implementations continue to work without changes.

Fixes: Multiple widgets on same page not working independently