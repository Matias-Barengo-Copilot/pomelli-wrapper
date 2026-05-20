---
name: migration-planner
description: Generate phased migration plans with testing and rollback steps for framework migrations, refactoring, and legacy modernization
argument-hint: "[migration-map-file-path]"
allowed-tools: Write, Read, Glob, Grep
---

# Migration Planner

Generate a structured, phased migration plan with independent phases, testing steps, and rollback procedures for each phase.

## Purpose

Migrations are high-risk activities. This skill helps you:
- Break large migrations into manageable, independently testable phases
- Define clear success criteria for each phase
- Establish testing strategies and rollback procedures
- Reduce risk through incremental validation
- Make progress visible and trackable

## When to Use

Use this skill when planning:
- Framework migrations (React 16 → 18, Vue 2 → 3, Angular → React)
- Platform migrations (on-premise → cloud, monolith → microservices)
- Legacy system modernization (rehost, replatform, refactor, replace)
- Large-scale refactoring (architecture changes, code modernization)
- Database migrations (SQL → NoSQL, schema changes)
- Language migrations (JavaScript → TypeScript, Python 2 → 3)

**When NOT to use:**
- Simple refactoring tasks (single file/module)
- Adding new features without changing existing architecture
- Bug fixes that don't require systematic rollout

## Arguments

Migration map file path (optional): `$ARGUMENTS`

If provided, read it first to understand current state and migration goals.
If not provided, conduct interview to gather migration context.

## Input Format: Migration Map

A migration map should contain:

```markdown
# Migration Map: <name>

## Current State
- Existing technology/framework/architecture
- Dependencies and integrations
- Known limitations

## Target State
- Desired technology/framework/architecture
- Expected benefits
- Success metrics

## Functional Inventory

### Keep (preserve as-is)
- Features/modules that work well and won't change
- Stable APIs that must maintain compatibility
- Critical paths that cannot break

### Change (refactor/update)
- Features/modules that need modernization
- Components to rewrite in new framework
- Areas requiring architectural changes

### Drop (remove/deprecate)
- Deprecated features to eliminate
- Technical debt to clean up
- Unused code to remove

## Known Problems
- Technical debt
- Performance issues
- Security vulnerabilities
- Integration challenges
- Dependency conflicts
```

## Interview Questions

If no migration map is provided, ask:

### 1. Migration Overview
"Describe the migration in one sentence."

### 2. Current State
"What are you migrating FROM?"
- Technology/framework/architecture
- Version numbers
- Key dependencies
- System scale (users, data volume, traffic)

### 3. Target State
"What are you migrating TO?"
- Technology/framework/architecture
- Version numbers
- Why this target (benefits, constraints)

### 4. Scope and Inventory
"What needs to change?"
- Features/modules to keep as-is
- Features/modules to refactor/rewrite
- Features/modules to deprecate/remove
- Estimated scope (file count, LOC, services)

### 5. Dependencies and Integration
"What systems/services does this interact with?"
- External APIs
- Databases
- Authentication systems
- Other services/microservices
- Third-party integrations

### 6. Constraints
"What constraints exist?"
- Zero downtime required?
- Backward compatibility needed?
- Regulatory/compliance requirements?
- Team size and expertise
- Timeline expectations

### 7. Known Risks
"What are the biggest risks?"
- Data loss concerns
- Downtime impact
- Performance degradation
- Breaking changes for users
- Team unfamiliarity with target tech

### 8. Success Criteria
"How will you know the migration succeeded?"
- Performance benchmarks
- Feature parity requirements
- User acceptance criteria
- Technical metrics (test coverage, build times, etc.)

## Phase Generation Guidelines

### Key Principles

1. **Independence**: Each phase must be independently testable and deployable
2. **Incremental**: Each phase delivers value and can be validated before proceeding
3. **Reversible**: Each phase includes clear rollback procedures
4. **Isolated**: Phases minimize risk through feature flags, parallel systems, or gradual rollout
5. **Measurable**: Each phase has concrete success criteria

### Common Phase Patterns

#### Pattern 1: Strangler Fig
Gradually replace old system while it continues running.
- **Phase 1**: Set up routing layer (feature flags, proxy)
- **Phase 2**: Migrate low-risk module, run in parallel
- **Phase 3**: Migrate medium-risk modules incrementally
- **Phase 4**: Migrate high-risk modules with extensive testing
- **Phase 5**: Deprecate and remove old system

#### Pattern 2: Parallel Run
Run old and new systems side-by-side.
- **Phase 1**: Build new system foundation
- **Phase 2**: Implement new features in parallel with old
- **Phase 3**: Dual-write to both systems
- **Phase 4**: Validate data consistency
- **Phase 5**: Cutover and decommission old system

#### Pattern 3: Module-by-Module
Migrate one module/service at a time.
- **Phase 1**: Set up new tech stack infrastructure
- **Phase 2**: Migrate non-critical module (proof of concept)
- **Phase 3**: Migrate modules with few dependencies
- **Phase 4**: Migrate core modules with high test coverage
- **Phase 5**: Migrate final integration points

#### Pattern 4: Layer-by-Layer
Migrate by architectural layer.
- **Phase 1**: Migrate data layer (schema, queries)
- **Phase 2**: Migrate business logic layer
- **Phase 3**: Migrate API/service layer
- **Phase 4**: Migrate presentation layer
- **Phase 5**: Optimize and tune

### Phase Structure Template

Each phase must include:

```markdown
## Phase N: <descriptive name>

### Objective
Clear statement of what this phase accomplishes and why it comes in this order.

### Prerequisites
- Dependencies that must be complete before starting
- Required infrastructure or tooling
- Team knowledge or training needed

### Steps
Numbered, concrete implementation steps:
1. Specific action with clear outcome
2. Another specific action
3. ...

### Testing Strategy
**Unit Tests:**
- What unit tests will be written or updated

**Integration Tests:**
- What integration scenarios must pass

**E2E Tests:**
- What user flows must be validated

**Performance Tests:**
- What performance benchmarks must be met

**Manual Testing:**
- What manual validation is required

**Acceptance Criteria:**
- Concrete, testable conditions for phase completion

### Rollback Procedure
Step-by-step instructions to revert this phase:
1. Specific rollback action
2. Data restoration steps if needed
3. Configuration changes to revert
4. Verification steps after rollback

**Rollback Decision Criteria:**
- When to rollback (error rates, performance degradation, etc.)
- Who can approve rollback
- Maximum time to execute rollback

### Success Criteria
Measurable outcomes that indicate phase completion:
- [ ] Technical metric (e.g., all tests pass, zero errors in logs)
- [ ] Business metric (e.g., feature parity validated)
- [ ] Operational metric (e.g., response time < 200ms)
- [ ] User metric (e.g., zero user-reported issues for 48 hours)

### Deployment Strategy
How this phase will be deployed:
- Feature flags used
- Percentage rollout (0% → 10% → 50% → 100%)
- Canary deployment approach
- Blue-green deployment steps
- A/B testing if applicable

### Monitoring and Observability
What to monitor during and after deployment:
- Key metrics to watch
- Alert thresholds
- Dashboards to create
- Logging requirements
- Incident response plan

### Estimated Duration
- Development: X days/weeks
- Testing: X days/weeks
- Deployment/validation: X days/weeks
- Total: X days/weeks

### Dependencies
- Blocks: [List phases that cannot start until this completes]
- Blocked by: [List phases that must complete before this starts]
```

## Output Format

Generate a migration plan with this structure:

```markdown
# Migration Plan: <descriptive name>

**Generated:** <date>
**Migration Type:** <framework/platform/architecture/language>

---

## Executive Summary

### Current State
Brief description of what exists today.

### Target State
Brief description of desired end state.

### Migration Approach
1-2 sentences describing the overall strategy (strangler fig, parallel run, etc.)

### Timeline Estimate
- Total phases: N
- Estimated duration: X weeks/months
- Key milestones: [Phase 1 by date, Phase N by date]

### Risk Level
[LOW / MEDIUM / HIGH]

---

## Migration Overview

### Scope
**In Scope:**
- What will be migrated

**Out of Scope:**
- What will NOT be migrated

### Dependencies
- External systems affected
- Required infrastructure
- Team requirements

### Constraints
- Zero downtime requirement
- Backward compatibility needs
- Regulatory constraints
- Resource limitations

---

## Phase 1: <name>
[Full phase structure as defined above]

---

## Phase 2: <name>
[Full phase structure as defined above]

---

## Phase N: <name>
[Full phase structure as defined above]

---

## Risk Assessment

### High-Risk Areas
- [Area 1]: Risk description and mitigation
- [Area 2]: Risk description and mitigation

### Common Migration Risks
**Data Loss:**
- Prevention: [strategies]
- Detection: [monitoring]
- Mitigation: [backup/recovery]

**Downtime:**
- Prevention: [strategies]
- Target: [acceptable downtime]
- Communication plan: [stakeholder notification]

**Performance Degradation:**
- Baseline metrics: [current performance]
- Target metrics: [required performance]
- Monitoring: [how to detect issues]

**Breaking Changes:**
- API compatibility strategy
- User communication plan
- Deprecation timeline

---

## Contingency Plans

### If Phase N Fails
- Rollback procedure (see phase-specific section)
- Alternative approaches to consider
- Escalation path

### If Timeline Slips
- Critical path phases that cannot be delayed
- Optional phases that could be deferred
- Scope reduction options

### If New Blockers Emerge
- Decision framework for addressing blockers
- When to pause vs. pivot
- Escalation contacts

---

## Communication Plan

### Stakeholders
- Who needs updates and how often
- What information they need

### Team Communication
- Daily standups during migration phases
- Incident response protocol
- Success celebration milestones

### User Communication
- When to notify users of changes
- How to communicate breaking changes
- Support plan during migration

---

## Success Metrics

### Technical Metrics
- [ ] All automated tests pass
- [ ] Performance meets or exceeds baseline
- [ ] Zero critical bugs in production
- [ ] Code coverage > X%

### Business Metrics
- [ ] Feature parity with old system
- [ ] User satisfaction maintained or improved
- [ ] Zero data loss incidents
- [ ] Downtime < X hours total

### Operational Metrics
- [ ] Deployment time < X minutes
- [ ] Rollback time < X minutes
- [ ] Mean time to recovery < X hours
- [ ] On-call incidents reduced by X%

---

## Post-Migration

### Cleanup Tasks
- Remove old code/infrastructure
- Update documentation
- Remove feature flags
- Archive legacy systems

### Knowledge Transfer
- Document lessons learned
- Update team runbooks
- Train team on new system

### Optimization Opportunities
- Performance tuning
- Cost optimization
- Technical debt paydown

---

## Appendices

### Appendix A: Technology Comparison
| Feature | Current | Target | Notes |
|---------|---------|--------|-------|
| ...     | ...     | ...    | ...   |

### Appendix B: Dependency Map
[Visual or textual representation of system dependencies]

### Appendix C: Reference Links
- Internal documentation
- External resources
- Vendor documentation
```

## Quality Checklist

Before finalizing the plan, verify:

- [ ] Each phase is independently testable
- [ ] Each phase can be deployed without completing future phases
- [ ] Each phase has clear rollback procedures
- [ ] Testing strategy is comprehensive (unit, integration, E2E)
- [ ] Success criteria are measurable and concrete
- [ ] Risk assessment covers data loss, downtime, performance, breaking changes
- [ ] Timeline estimates are realistic
- [ ] Dependencies between phases are clearly documented
- [ ] Deployment strategy minimizes risk (feature flags, gradual rollout)
- [ ] Monitoring and observability are defined for each phase

## Best Practices

### DO
- Start with low-risk, high-learning phases (proof of concept)
- Use feature flags to control rollout
- Run old and new systems in parallel when possible
- Validate data integrity at each phase
- Document rollback procedures BEFORE deploying
- Celebrate small wins to maintain momentum
- Over-communicate with stakeholders

### DON'T
- Attempt "big bang" migrations without phasing
- Skip testing to save time
- Ignore rollback planning
- Assume old and new systems are feature-equivalent
- Migrate high-risk areas first
- Deploy to 100% of users immediately
- Forget to monitor after deployment

## Common Migration Pitfalls

1. **Underestimating Complexity**: Legacy systems have hidden dependencies
2. **Skipping Parallel Run**: Assuming new system works without validation
3. **Inadequate Testing**: Missing edge cases that only appear in production
4. **No Rollback Plan**: Unable to revert when issues occur
5. **Poor Communication**: Surprising users with breaking changes
6. **Ignoring Performance**: New system slower than old system
7. **Data Migration Issues**: Schema mismatches, data loss, corruption
8. **Feature Gaps**: New system missing features users depend on

## Examples

### Example 1: React 16 → React 18 Migration

**Migration Type:** Framework upgrade (minor breaking changes)

**Approach:** Strangler fig with feature flags

**Key Phases:**
1. **Infrastructure Setup**: Update build tools, dependencies
2. **Concurrent Rendering**: Enable concurrent mode on non-critical pages
3. **Automatic Batching**: Test and validate state update changes
4. **Suspense Integration**: Migrate data fetching to Suspense
5. **Final Cleanup**: Remove React 16 compatibility code

**Risk Level:** MEDIUM (breaking changes in concurrent rendering)

---

### Example 2: Monolith → Microservices

**Migration Type:** Architecture change

**Approach:** Parallel run with gradual extraction

**Key Phases:**
1. **Service Mesh Setup**: Implement API gateway and service discovery
2. **Extract Auth Service**: Low-risk, high-value extraction
3. **Extract User Service**: Core service with extensive testing
4. **Extract Order Service**: Complex business logic with data migration
5. **Decommission Monolith**: Remove old code, archive database

**Risk Level:** HIGH (data consistency across services)

---

### Example 3: JavaScript → TypeScript

**Migration Type:** Language migration

**Approach:** Module-by-module with gradual typing

**Key Phases:**
1. **TypeScript Setup**: Configure compiler, add type definitions
2. **Convert Utilities**: Start with pure functions, no external dependencies
3. **Convert Components**: UI components with prop type safety
4. **Convert Business Logic**: Service layer with strict typing
5. **Enable Strict Mode**: Enforce full type safety

**Risk Level:** LOW (non-breaking, incremental adoption)

---

## Research Sources

This skill was designed based on industry best practices from:

- [Cloud Migration Strategy 2026: Build Cost-Efficient Infrastructure](https://www.novasarc.com/cloud-migration-strategy-2026-cost-efficient-infrastructure)
- [Zero Downtime Data Center Migration Planning](https://russellsmovingandstorage.com/2026/03/07/data-center-migration-zero-downtime/)
- [Phases of Cloud Migration: Complete Guide for 2026](https://riseuplabs.com/phases-of-cloud-migration/)
- [Plan your migration - Cloud Adoption Framework | Microsoft Learn](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/migrate/plan-migration)
- [Divide your Jira or Confluence migration into phases | Atlassian Documentation](https://confluence.atlassian.com/display/ENTERPRISE/Divide+your+Jira+or+Confluence+migration+into+phases)
- [Modernizing a React Application: A Phased Approach to Backend Migration](https://medium.com/@sriram_in/modernizing-a-react-application-a-phased-approach-to-backend-migration-and-frontend-refactoring-bf170caf79ef)
- [Navigating Frontend Migration: Strategies for Refactoring and Microfrontends](https://medium.com/syngenta-digitalblog/navigating-frontend-migration-strategies-for-refactoring-rewriting-and-embracing-microfrontends-331520cde2bb)
- [Legacy System Modernization Guide for Enterprises 2026](https://www.sparkouttech.com/legacy-system-modernization/)
- [Legacy System Migration: Best Practices](https://www.openlegacy.com/blog/legacy-system-migration-best-practices)

Key insights from research:
- Phased migrations are far more cost-efficient and lower-risk than "big bang" approaches
- Each phase should include dry runs and testing in staging environments
- Rollback procedures must be documented and tested before production deployment
- Feature flags and gradual rollout (0% → 10% → 50% → 100%) minimize risk
- Parallel run strategies allow validation before full cutover
- Common patterns: Strangler Fig, Module-by-Module, Layer-by-Layer
- Critical success factors: monitoring, communication, incremental validation
