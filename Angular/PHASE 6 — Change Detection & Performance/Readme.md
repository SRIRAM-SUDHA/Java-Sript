# PHASE 6 — Change Detection & Performance

## Goal
Understand how Angular updates the UI, avoid common performance pitfalls, and learn modern direction (signals).

## Topics
1. **Change Detection Strategy**
   - Default vs `OnPush`
   - What triggers change detection
   - Common “UI didn’t update” causes
2. **Signals (Modern Angular)**
   - Signals vs Observables (roles and tradeoffs)
   - When to use signals
   - Interop with RxJS

## Hands-on (Do This)
- Convert at least one feature area to `OnPush`.
- Identify and remove one unnecessary re-render cause (template functions, heavy pipes, etc.).
- Try signals for a small piece of local UI state and compare with RxJS.

## Exit Criteria
- You can choose `OnPush` deliberately and debug update issues.
- You understand where signals fit (and where they don’t).

## Next
- Continue to `../PHASE 7 — Advanced Component Patterns/Readme.md`

