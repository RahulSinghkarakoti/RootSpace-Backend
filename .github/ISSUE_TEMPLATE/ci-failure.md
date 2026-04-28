---
name: CI Pipeline Failure
about: Report issues with the CI pipeline
title: "[CI] Pipeline failing on "
labels: ["ci", "bug"]
assignees: ""
---

## CI Pipeline Failure Report

### Pipeline Run
- **Workflow**: [CI Pipeline - Tests & Quality Checks](https://github.com/your-username/family-tree-backend/actions/workflows/test.yml)
- **Run ID**: [Link to failed run]
- **Branch**: [branch name]
- **Commit**: [commit hash]

### Failed Job(s)
- [ ] Run Tests
- [ ] Docker Integration Tests
- [ ] Security Scan

### Error Details

**Job**: [job name]
**Step**: [step name]
**Error Message**:
```
[Paste the error message here]
```

### Local Testing Results

**Local tests pass**: [Yes/No]
**Local Docker tests pass**: [Yes/No]
**Local linting passes**: [Yes/No]

### Additional Context

- [ ] This is a new failure
- [ ] This was working before
- [ ] Related to dependency updates
- [ ] Related to code changes in this PR

### Steps to Reproduce

1. [Describe what triggers the failure]
2. [Any specific conditions]

### Environment
- OS: [e.g., Ubuntu 22.04, macOS, Windows]
- Node.js version: [e.g., 20.x]
- Docker version: [if applicable]

### Possible Solutions

[Any ideas on how to fix this]

---

**Note**: Please check if the issue reproduces locally before reporting.