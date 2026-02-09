# Stage 3: Archive

**After deployment/merge:**

## Steps

1. **Review Code** (run first):
   - Run `oracle` and `code_review` tool **in parallel** on the change's diff
   - Consolidate findings and propose fixes to the user
   - Wait for user approval before proceeding

2. **Extract Knowledge**:
   - Use `find_thread` to search for threads related to this change
   - Look for: new patterns, bug fixes, gotchas, architectural decisions, lessons learned
   - If valuable knowledge is found, invoke the `knowledge` skill to persist it

3. **Move folder**: `changes/<change-id>/` → `changes/archive/YYYY-MM-DD-<change-id>/`
4. **Update Specs**: Update `specs/` to reflect the new "current truth" if capabilities changed.
5. **Archive**: `openspec archive <change-id> --yes`

## When to Archive

- After PR is merged
- After deployment is verified
- When the change is considered "done"

## Spec Sync

If the change introduced new capabilities or modified existing ones:

1. Read delta specs from `openspec/changes/<change-id>/specs/*/spec.md`
2. Apply changes to main specs at `openspec/specs/<capability>/spec.md`:
   - **ADDED**: Add new requirements to main spec
   - **MODIFIED**: Update existing requirements in main spec
   - **REMOVED**: Remove requirements from main spec
   - **RENAMED**: Rename requirements in main spec

## CLI Commands

```bash
# Archive a completed change
openspec archive <change-id> --yes

# List archived changes
ls openspec/changes/archive/

# View archive details
cat openspec/changes/archive/YYYY-MM-DD-<change-id>/proposal.md
```
