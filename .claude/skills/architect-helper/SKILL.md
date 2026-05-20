---
name: architect-helper
description: Interview architect and generate comprehensive architecture.md files documenting cloud platform, scalability, cost estimates, and scaling guidance. Use when starting projects or when architecture.md doesn't exist.
argument-hint: "[project-name]"
allowed-tools: Write, Read, AskUserQuestion
---

# Architect Helper - Architecture Assessment & Recommendation Generator

Generate a comprehensive, project-specific `architecture.md` file by interviewing the architect about cloud platform, scalability constraints, concurrent users, request durations, budget, and deployment level.

## When to Use

- Starting a new project that needs architecture planning
- Existing project has no architecture.md or technical architecture documentation
- Architect needs to document architecture decisions for engineering team
- Creating architecture recommendations with cost estimates
- Assessing scalability requirements and infrastructure needs
- Evaluating cloud platform options (AWS, Azure, GCP, hybrid)

## Arguments

Project name (optional): `$ARGUMENTS`
- If provided (e.g., "Acme API"), use this as the project name
- If not provided, ask during the interview

## Why This Matters

Architecture decisions are complex, costly to change later, and have long-term implications for scalability, performance, and budget. This skill helps architects think through requirements systematically and generate comprehensive recommendations that engineers can reference during implementation. Good architecture documentation reduces costly mistakes, prevents over-engineering, and ensures infrastructure scales efficiently.

## Interview Questions

Ask these questions one at a time. Be practical and focus on concrete requirements, not theoretical possibilities.

### 1. Project Name

**If not provided as argument:**
"What is the name of this project or system?"

**If provided:**
"Great! So we're planning the architecture for `$ARGUMENTS`. Let's get started."

---

### 2. Project Description

"In 1-2 sentences, what does this project do? What is the core functionality?"

**Guidance:** This provides context for architecture decisions. Example: "A REST API for real-time inventory management across 50+ retail locations with mobile app integration."

---

### 3. Cloud Platform

"Which cloud platform are you targeting?"

**Options:**
- AWS (Amazon Web Services)
- Azure (Microsoft Azure)
- GCP (Google Cloud Platform)
- Multi-cloud / Hybrid
- On-premises
- Not decided yet

**Guidance:** Platform choice affects all subsequent recommendations. If "not decided yet", provide comparison and ask follow-up: "What are your key decision criteria? (cost, existing team expertise, specific service needs, compliance requirements)"

---

### 4. Deployment Level

"What level of deployment are you planning for?"

**Options:**
- **Demo/POC**: Proof of concept, testing ideas, minimal cost
- **Mid-tier Production**: Real production traffic, moderate scale, cost-conscious
- **Enterprise Scale**: High availability, global distribution, performance-critical

**Guidance:** This determines infrastructure complexity and cost ranges. A demo needs different architecture than enterprise production.

---

### 5. Expected Concurrent Users

"How many concurrent users do you expect at peak times?"

**Ranges:**
- <100 (very small)
- 100-1,000 (small)
- 1,000-10,000 (medium)
- 10,000-100,000 (large)
- 100,000+ (very large)

**Guidance:** Concurrent users (not total users) determines compute and database sizing. Ask clarifying questions if needed: "Are these authenticated sessions, API requests, or websocket connections?"

---

### 6. Request Duration Expectations

"What are your latency requirements for typical requests?"

**Ask about:**
- Acceptable response time for API requests (e.g., <200ms, <500ms, <1s)
- Any real-time requirements (websockets, SSE, long polling)
- Geographic distribution (global users vs. single region)

**Guidance:** Latency requirements affect caching strategy, CDN usage, and geographic distribution. Sub-100ms requirements need edge computing. >1s is acceptable for background jobs.

---

### 7. Traffic Patterns

"What are your expected traffic patterns?"

**Ask about:**
- Steady traffic vs. spiky/variable
- Time-of-day patterns (business hours vs. 24/7)
- Seasonal variations
- Expected growth rate (e.g., 2x per year, 10x in 6 months)

**Guidance:** Spiky traffic favors serverless. Steady traffic favors traditional compute. This affects cost optimization strategies.

---

### 8. Data Characteristics

"Tell me about your data requirements."

**Ask about:**
- Data type (relational, document, key-value, time-series, graph)
- Data size (GB, TB, PB scale)
- Read vs. write ratio (read-heavy, write-heavy, balanced)
- Data retention requirements (days, months, years, indefinite)
- Backup and recovery needs (RPO/RTO targets if known)

**Guidance:** This determines database choice (RDS, DynamoDB, MongoDB, etc.) and storage strategy. Relational data needs SQL databases. Document data can use NoSQL. Time-series needs specialized DBs.

---

### 9. Budget Constraints

"What is your monthly infrastructure budget range?"

**Ranges:**
- <$100/month (minimal, demo)
- $100-$500/month (small production)
- $500-$2,000/month (mid-tier production)
- $2,000-$10,000/month (growing business)
- $10,000+/month (enterprise)
- Not defined yet

**Guidance:** Budget determines serverless vs. provisioned, managed vs. self-hosted, and optimization priorities. Be realistic about costs for the scale discussed.

---

### 10. Compliance & Security Requirements

"Are there any compliance or security requirements we need to consider?"

**Examples:**
- HIPAA (healthcare)
- PCI-DSS (payment card data)
- GDPR (EU user data)
- SOC 2
- Data residency requirements (data must stay in specific regions)
- Government/defense requirements

**Guidance:** Compliance affects architecture significantly. HIPAA requires encryption at rest/transit and audit logging. GDPR affects data storage locations. If none, note "Standard security best practices apply."

---

### 11. Integration Requirements

"What external systems or services will this integrate with?"

**Ask about:**
- Third-party APIs (payment processors, authentication providers, etc.)
- Existing internal systems
- Data imports/exports
- Webhooks or event streaming
- File storage requirements (S3, blob storage)

**Guidance:** Heavy API integration needs API gateway and rate limiting. File processing needs object storage. Event-driven needs message queues.

---

### 12. Availability Requirements

"What are your availability and disaster recovery expectations?"

**Ask about:**
- Required uptime (99%, 99.9%, 99.99%)
- Acceptable downtime for maintenance
- Multi-region failover needed?
- Backup frequency and retention
- Recovery time objective (RTO) and recovery point objective (RPO)

**Guidance:** 99.9% uptime (8.76 hours/year downtime) is standard production. 99.99% requires multi-AZ. 99.999% requires multi-region. Each nine adds cost complexity.

---

### 13. Team Expertise

"What is your team's experience level with cloud infrastructure and the chosen platform?"

**Options:**
- Expert (extensive cloud experience)
- Intermediate (some cloud experience, learning)
- Beginner (new to cloud)
- Mixed team

**Guidance:** This affects recommendations for managed vs. self-hosted services. Beginners should use more managed services (less operational overhead). Experts can optimize costs with self-managed infrastructure.

---

### 14. Development Workflow

"How does your team develop and deploy?"

**Ask about:**
- CI/CD pipeline (GitHub Actions, Jenkins, GitLab CI, none yet)
- Containerization (Docker, Kubernetes, none)
- Infrastructure as Code (Terraform, CloudFormation, none)
- Testing approach (automated tests, manual)
- Deployment frequency (multiple times/day, weekly, monthly)

**Guidance:** This determines automation recommendations. Frequent deploys need robust CI/CD. Container experience enables Kubernetes. IaC experience enables Terraform recommendations.

---

### 15. Monitoring & Observability

"What are your monitoring and observability needs?"

**Ask about:**
- Application performance monitoring (APM)
- Log aggregation and search
- Metrics and dashboards
- Alerting requirements
- Distributed tracing (for microservices)

**Guidance:** Production systems need monitoring. Start simple (CloudWatch, Application Insights). Enterprise needs comprehensive observability (Datadog, New Relic). This adds to monthly costs.

---

### 16. Scaling Strategy Preference

"Do you have a preference for scaling approach?"

**Options:**
- Serverless (auto-scaling, pay-per-use, minimal ops)
- Container-based (Kubernetes, ECS, more control)
- Traditional VMs (EC2, VMs, maximum control)
- Hybrid approach
- Not sure, recommend best fit

**Guidance:** Serverless is best for variable traffic and small teams. Containers for microservices and moderate scale. VMs for specific performance needs or legacy workloads.

---

## Generate architecture.md

After all questions are answered, generate the architecture.md file using this structure:

```markdown
# Architecture: <Project Name>

> <Project description from interview>

**Last Updated:** <current date>

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Recommendations](#architecture-recommendations)
3. [Scaling Strategy](#scaling-strategy)
4. [Cost Estimates](#cost-estimates)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Monitoring & Operations](#monitoring--operations)
7. [Security & Compliance](#security--compliance)
8. [Open Questions & Future Considerations](#open-questions--future-considerations)

---

## Overview

### System Summary

- **Cloud Platform:** <AWS/Azure/GCP/Hybrid>
- **Target Scale:** <deployment level: demo/mid-tier/enterprise>
- **Concurrent Users:** <expected peak concurrent users>
- **Latency Target:** <response time requirements>
- **Budget Range:** <monthly budget>
- **Availability Target:** <uptime SLA>

### Architecture Style

<Based on requirements, recommend:>
- Serverless (event-driven, auto-scaling)
- Microservices (container-based, independently deployable)
- Monolith (traditional, simple deployment)
- Hybrid (combination based on workload characteristics)

**Rationale:** <Why this architecture style fits the requirements - be specific about concurrent users, traffic patterns, team expertise>

---

## Architecture Recommendations

### Compute Layer

**Service:** <Specific service recommendation: e.g., AWS Lambda + API Gateway, Azure App Service, GCP Cloud Run, ECS Fargate, Kubernetes>

**Configuration:**
<Specific sizing, instance types, auto-scaling rules>

**Rationale:** <Why this choice based on:>
- Concurrent user requirements
- Traffic patterns (steady vs. spiky)
- Latency requirements
- Team expertise
- Cost constraints

**Scaling:** <How this service scales to meet demand>

**Monthly Cost:** <Estimated cost range>

**Example Configuration:**
```
<Platform-specific configuration example>
- AWS Lambda: 1GB memory, <X>ms average duration, <Y>M invocations/month
- Or: EC2 t3.medium instances, auto-scaling 2-8 instances based on CPU
- Or: Azure App Service: Standard S1 tier, auto-scale rules
```

---

### Database

**Service:** <Specific service: e.g., AWS RDS PostgreSQL, Azure SQL Database, DynamoDB, MongoDB Atlas, Cloud SQL>

**Configuration:**
<Instance size, storage, backup settings>

**Rationale:** <Why this database choice:>
- Data type (relational/document/key-value)
- Read/write patterns
- Data size and growth
- Query complexity
- Consistency requirements

**Backup & Recovery:**
- Automated backups: <frequency>
- Retention: <period>
- Point-in-time recovery: <yes/no>
- RPO/RTO: <targets>

**Scaling Strategy:**
- Vertical scaling: <when and how>
- Horizontal scaling: <read replicas, sharding if needed>
- Performance thresholds for scaling triggers

**Monthly Cost:** <Estimated cost range>

**Example Configuration:**
```
<Platform-specific configuration>
- AWS RDS PostgreSQL: db.t3.small (2 vCPU, 2GB RAM), 100GB SSD, Multi-AZ for production
- Or: DynamoDB: On-demand capacity, <X>GB storage, DAX caching for hot data
```

---

### Caching Layer

**Service:** <e.g., Redis (ElastiCache/Azure Cache/Cloud Memorystore), CloudFront, Varnish, none if not needed>

**Rationale:** <When caching makes sense:>
- High read-to-write ratio
- Expensive database queries
- Latency reduction needs
- API rate limiting requirements

**Strategy:**
- Cache frequently accessed data: <examples>
- TTL settings: <typical values>
- Cache invalidation: <strategy>

**Monthly Cost:** <Estimated cost range, or "Not needed at current scale">

**Example Configuration:**
```
<If recommended>
- Redis: cache.t3.small (1.37GB), 1 node for demo, 2+ nodes with failover for production
- Or: "Not recommended at current scale - re-evaluate at 10k+ concurrent users"
```

---

### CDN & Static Assets

**Service:** <e.g., CloudFront, Azure CDN, Cloud CDN, Cloudflare>

**Rationale:**
- Reduce latency for static assets
- Offload origin server
- Global user distribution
- Bandwidth cost optimization

**Configuration:**
- Origin: <S3/blob storage/application server>
- Edge locations: <global/specific regions>
- Cache behaviors: <static assets, API caching rules if applicable>

**Monthly Cost:** <Estimated cost range>

**Example:**
```
<If recommended>
- CloudFront distribution with S3 origin, <X>GB/month transfer
- Or: "Not needed - single region traffic, minimal static assets"
```

---

### Storage

**Service:** <e.g., S3, Azure Blob Storage, Cloud Storage>

**Use Cases:**
- User uploads
- Static assets (images, documents)
- Backups
- Logs
- Application artifacts

**Configuration:**
- Storage class: <Standard, Infrequent Access, Archive>
- Lifecycle policies: <transition rules>
- Versioning: <enabled/disabled>
- Encryption: <at-rest encryption enabled>

**Monthly Cost:** <Estimated cost based on data volume>

---

### Message Queue / Event Streaming

**Service:** <e.g., SQS, SNS, EventBridge, Azure Service Bus, Pub/Sub, RabbitMQ, Kafka - or "Not needed">

**Rationale:**
<If recommended, explain use cases:>
- Asynchronous processing
- Event-driven workflows
- Decoupling services
- Background jobs

**Configuration:**
<Queue types, retention, dead-letter queues>

**Monthly Cost:** <Estimated cost or "Not needed at current scale">

---

### API Gateway / Load Balancer

**Service:** <e.g., AWS API Gateway, Azure API Management, Application Load Balancer, Kong>

**Features:**
- Request routing
- Rate limiting and throttling
- Authentication/authorization
- Request/response transformation
- API versioning

**Configuration:**
<Specific settings based on requirements>

**Monthly Cost:** <Estimated cost>

---

### Authentication & Authorization

**Service:** <e.g., AWS Cognito, Auth0, Azure AD B2C, Firebase Auth, custom JWT>

**Rationale:** <Why this choice based on security requirements>

**Features:**
- User management
- Social login
- MFA
- Token management
- Role-based access control

**Monthly Cost:** <Estimated cost based on MAU>

---

## Scaling Strategy

### Phase 1: Initial Scale (<X> concurrent users)

**Approach:**
<Recommended starting configuration>

**Key Characteristics:**
- <Configuration details>
- <Cost range>
- <When to scale up>

**Example:**
```
- Serverless compute (AWS Lambda) with API Gateway
- RDS PostgreSQL db.t3.small, single AZ
- No caching layer (not needed yet)
- S3 for static assets, no CDN
- CloudWatch for basic monitoring
- Estimated cost: $200-400/month
```

---

### Phase 2: Growth Scale (<Y> concurrent users)

**Approach:**
<How to scale from Phase 1>

**Key Changes:**
- <What needs to upgrade>
- <What to add>

**Triggers for Phase 2:**
- Concurrent users exceeds <threshold>
- Database CPU consistently >70%
- API latency >500ms at p95
- Monthly costs approaching $<threshold>

**Example:**
```
- Add Redis caching layer for database query results
- Upgrade RDS to db.t3.medium, enable Multi-AZ
- Add CloudFront CDN for static assets
- Implement auto-scaling rules
- Estimated cost: $800-1,500/month
```

---

### Phase 3: Enterprise Scale (<Z> concurrent users)

**Approach:**
<How to scale from Phase 2>

**Key Changes:**
- Multi-region deployment
- Read replicas for database
- Advanced caching strategies
- Microservices decomposition (if monolith)
- Enhanced monitoring and observability

**Triggers for Phase 3:**
- Concurrent users exceeds <threshold>
- Global user distribution requires multi-region
- Downtime becomes costly (need 99.99% uptime)
- Team grows and can manage complexity

**Example:**
```
- Multi-region deployment (primary + failover)
- Database read replicas in each region
- ElastiCache Redis cluster
- Global CloudFront distribution
- Container orchestration (ECS/Kubernetes) for better resource utilization
- Comprehensive monitoring (Datadog/New Relic)
- Estimated cost: $5,000-15,000/month
```

---

### Vertical vs. Horizontal Scaling

**Vertical Scaling (Scale Up):**
- **When:** Quick fix for capacity issues, simple workloads
- **How:** Increase instance size (e.g., t3.small → t3.large)
- **Limits:** Eventually hit instance size limits
- **Use for:** Database, single-instance workloads

**Horizontal Scaling (Scale Out):**
- **When:** Need high availability, handle variable load
- **How:** Add more instances, load balance across them
- **Benefits:** No upper limit, better fault tolerance
- **Use for:** Stateless compute, API servers, web servers

**Recommendation for this project:** <Specific guidance based on architecture>

---

## Cost Estimates

### Monthly Breakdown (Phase 1 - Initial Production)

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| Compute | <details> | $<amount> |
| Database | <details> | $<amount> |
| Storage | <details> | $<amount> |
| Networking | <details> | $<amount> |
| Monitoring | <details> | $<amount> |
| Backup | <details> | $<amount> |
| **Total** | | **$<range>** |

### Cost Optimization Strategies

1. **Right-sizing:** <Specific recommendations>
2. **Reserved Instances:** <When to consider, estimated savings>
3. **Spot Instances:** <If applicable for non-critical workloads>
4. **Auto-scaling:** <Automatic scale-down during low traffic>
5. **Storage Lifecycle:** <Archive old data to cheaper tiers>
6. **Serverless vs. Provisioned:** <Analysis for this project>

### Cost Triggers & Alerts

- Set billing alerts at: $<amount>, $<amount>, $<amount>
- Review costs weekly during first 3 months
- Implement tagging strategy for cost attribution
- Monitor cost per user/request metrics

### Projected Costs by Phase

| Phase | Users | Est. Monthly Cost | Notes |
|-------|-------|-------------------|-------|
| Demo/POC | <100 | $<amount> | <notes> |
| Phase 1 | <range> | $<amount> | <notes> |
| Phase 2 | <range> | $<amount> | <notes> |
| Phase 3 | <range> | $<amount> | <notes> |

---

## Implementation Roadmap

### Phase 1: MVP / Demo (Weeks 1-4)

**Goal:** Get a working system deployed with minimal viable infrastructure

**Tasks:**
1. Set up cloud account and initial access controls
2. Deploy basic compute infrastructure
3. Set up database with initial schema
4. Configure basic networking (VPC, subnets, security groups)
5. Implement simple CI/CD pipeline
6. Set up basic monitoring and logging
7. Deploy first version of application

**Success Criteria:**
- [ ] Application accessible via public URL
- [ ] Database persistent and backed up
- [ ] Basic monitoring in place
- [ ] Can deploy updates via CI/CD
- [ ] Total cost under $<budget>

---

### Phase 2: Production Ready (Weeks 5-8)

**Goal:** Add production-grade reliability, security, and performance

**Tasks:**
1. Enable Multi-AZ for database
2. Implement auto-scaling for compute
3. Add SSL/TLS certificates (HTTPS)
4. Configure proper IAM roles and security groups
5. Set up automated backups and test recovery
6. Implement health checks and automated failover
7. Add API rate limiting and throttling
8. Enhanced monitoring and alerting

**Success Criteria:**
- [ ] System survives single-AZ failure
- [ ] Auto-scaling tested under load
- [ ] SSL certificates configured and auto-renewing
- [ ] Backup and recovery tested
- [ ] Alerts working for critical issues
- [ ] Security review completed

---

### Phase 3: Scale & Optimize (Ongoing)

**Goal:** Optimize for performance, cost, and scale as usage grows

**Tasks:**
1. Implement caching layer (Redis)
2. Add CDN for static assets
3. Database query optimization and indexing
4. Cost optimization review (right-sizing, reserved instances)
5. Performance testing and bottleneck identification
6. Consider microservices decomposition if needed
7. Multi-region deployment (if global users)
8. Advanced observability (APM, distributed tracing)

**Success Criteria:**
- [ ] p95 latency under <target>
- [ ] Cost per user/request optimized
- [ ] Can handle <target> concurrent users
- [ ] 99.9%+ uptime achieved
- [ ] Team comfortable with operations

---

## Monitoring & Operations

### Monitoring Stack

**Service:** <e.g., CloudWatch, Azure Monitor, Stackdriver, Datadog, New Relic>

**Key Metrics to Track:**

**Application Metrics:**
- Request rate (requests per second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Apdex score (user satisfaction)

**Infrastructure Metrics:**
- CPU utilization (compute instances)
- Memory utilization
- Disk I/O and storage usage
- Network throughput

**Database Metrics:**
- Connection count
- Query performance (slow query log)
- Replication lag (if using replicas)
- Storage usage and growth rate

**Business Metrics:**
- Active users
- API calls per customer
- Feature usage
- Cost per request

### Alerting Strategy

**Critical Alerts (immediate page):**
- Application down (health check fails)
- Error rate >5%
- Database connection pool exhausted
- Disk usage >90%

**Warning Alerts (notify during business hours):**
- Response time >500ms (p95)
- CPU usage >70% for >15 minutes
- Unusual traffic patterns
- Cost exceeds daily budget

**Configuration:**
<Platform-specific alert setup: CloudWatch Alarms, Azure Monitor alerts, etc.>

### Logging

**Service:** <e.g., CloudWatch Logs, Azure Log Analytics, Stackdriver Logging, ELK stack>

**Log Retention:**
- Application logs: <X> days
- Access logs: <Y> days
- Audit logs: <Z> days (compliance requirement)

**Log Structure:**
- Structured JSON logging
- Include request ID for tracing
- Log levels: ERROR, WARN, INFO, DEBUG

### Incident Response

1. **Detection:** Monitoring alerts or user reports
2. **Triage:** Assess severity, assign owner
3. **Investigation:** Check logs, metrics, recent changes
4. **Mitigation:** Rollback, scale up, or fix
5. **Resolution:** Confirm fix, monitor stability
6. **Postmortem:** Document incident, root cause, prevention

---

## Security & Compliance

### Security Best Practices

**Network Security:**
- VPC with public/private subnets
- Security groups: principle of least privilege
- No SSH/RDP from 0.0.0.0/0
- Bastion host or AWS Systems Manager for access

**Data Security:**
- Encryption at rest (database, storage)
- Encryption in transit (TLS 1.2+)
- Secrets management (<AWS Secrets Manager, Azure Key Vault>)
- Regular security patching

**Access Control:**
- IAM roles instead of access keys
- Multi-factor authentication required
- Principle of least privilege
- Regular access reviews

**Application Security:**
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- Rate limiting to prevent abuse

### Compliance Requirements

<Based on interview question #10>

**Applicable Standards:**
- <HIPAA, PCI-DSS, GDPR, SOC 2, etc. or "Standard security best practices">

**Required Controls:**
<If compliance requirements exist, list specific controls:>
- Audit logging of all data access
- Data residency (data stored in <region>)
- Encryption standards
- Access controls
- Incident response procedures

**Audit Trail:**
- Enable CloudTrail (AWS) / Activity Log (Azure) / Audit Logs (GCP)
- Log retention: <period based on compliance>
- Regular audit log reviews

---

## Open Questions & Future Considerations

### Decisions Needed

<List any decisions that need to be made before implementation>

1. **Question:** <Open question from interview>
   - **Impact:** <What this affects>
   - **Recommendation:** <Suggested approach>
   - **Decision by:** <Who decides and when>

### Future Enhancements

<Features or capabilities to consider later>

1. **Multi-region deployment**
   - **When:** User base grows globally or 99.99% uptime required
   - **Complexity:** High (data replication, routing)
   - **Cost impact:** 2-3x current costs

2. **Machine Learning / AI Features**
   - **When:** Sufficient data and use case defined
   - **Services:** <SageMaker, Azure ML, Vertex AI>
   - **Considerations:** Training costs, inference latency

3. **GraphQL API**
   - **When:** Complex client data needs, multiple client types
   - **Considerations:** Caching complexity, migration effort

### Assumptions Made

<Document key assumptions from the interview>

1. <Assumption 1 - e.g., "Traffic is primarily US-based, single region deployment acceptable">
2. <Assumption 2 - e.g., "Team has 1-2 DevOps engineers available for infrastructure management">
3. <Assumption 3 - e.g., "Data retention: 2 years active, 5 years archived">

### Review Points

**3-Month Review:**
- Validate cost estimates against actual spend
- Review auto-scaling effectiveness
- Assess monitoring coverage
- Check if assumptions still hold

**6-Month Review:**
- Re-evaluate architecture for scale changes
- Consider reserved instances for cost savings
- Review security posture
- Plan for next phase scaling

---

## Architecture Diagram

<Note: Include a text-based architecture diagram or reference to diagram file>

```
<Simple ASCII diagram or note to create visual diagram>

Example for serverless architecture:

┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   CloudFront    │  (CDN)
│   + S3 Static   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lambda/AppSvc  │  (Compute)
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐  ┌───────┐
│  RDS  │  │ Redis │  (Data)
│ (DB)  │  │(Cache)│
└───────┘  └───────┘
```

---

## References & Resources

### Platform Documentation

<Link to specific services recommended>

- <Cloud provider documentation links>
- <Service-specific best practices>
- <Pricing calculators>

### Cost Estimation

- **AWS Pricing Calculator:** https://calculator.aws.amazon.com/
- **Azure Pricing Calculator:** https://azure.microsoft.com/en-us/pricing/calculator/
- **GCP Pricing Calculator:** https://cloud.google.com/products/calculator

### Architecture Patterns

<Reference relevant architecture patterns for this project>

- <Well-Architected Framework links>
- <Architecture reference implementations>

---

*Architecture documentation generated via `/architect-helper` skill*
*Last updated: <date>*
```

## Output Process

1. After gathering all interview responses, generate the complete architecture.md file
2. Ask: "I've generated your architecture.md file. Where would you like me to save it?"
   - Suggest: `architecture.md` at project root
   - Or: `docs/architecture.md`
   - Or: `accounts/<account-name>/architecture.md` (if using account structure)
3. Write the file to the specified location
4. Confirm: "architecture.md created at <path>. Review and customize as needed."
5. Ask: "Would you like me to commit this to git? (y/n)"
6. If yes, commit with message: `docs: add architecture documentation via architect-helper`

---

## Quality Bar

Good architecture documentation:
- Provides specific, actionable recommendations (not generic advice)
- Includes realistic cost estimates for 2026 pricing
- Explains the "why" behind each architectural decision
- Considers the team's expertise level
- Scales progressively (doesn't over-engineer for day 1)
- Includes concrete examples (instance types, configurations)
- Documents assumptions and open questions
- Provides clear scaling triggers and roadmap

Bad architecture documentation:
- Vague recommendations ("use a database")
- Unrealistic cost estimates or no cost breakdown
- Over-engineered for current needs
- No consideration of team expertise
- Missing security and compliance considerations
- No scaling strategy or future planning
- Assumes unlimited budget

---

## Examples

### Example 1: Small SaaS API (Mid-tier Production)

**Scenario:** REST API for project management SaaS, 500-2k concurrent users, AWS, $500-1k/month budget

**Key Recommendations:**
- **Compute:** AWS Lambda + API Gateway (serverless, auto-scaling, cost-effective)
- **Database:** RDS PostgreSQL db.t3.small, Multi-AZ
- **Caching:** ElastiCache Redis cache.t3.small
- **Storage:** S3 Standard for user uploads
- **CDN:** CloudFront for static assets
- **Monitoring:** CloudWatch + AWS X-Ray

**Cost Breakdown:**
- Lambda: ~$100/month (1M requests)
- RDS: ~$70/month (db.t3.small Multi-AZ)
- ElastiCache: ~$50/month (cache.t3.small)
- S3 + CloudFront: ~$30/month (50GB storage, 200GB transfer)
- Monitoring: ~$20/month
- **Total: ~$270/month** (well under budget, room to scale)

**Scaling:** Start without Redis caching, add when query latency >200ms. Upgrade RDS to t3.medium when CPU >70%.

---

### Example 2: Enterprise Analytics Platform (Enterprise Scale)

**Scenario:** Real-time analytics dashboard, 50k+ concurrent users, global distribution, AWS, 99.99% uptime, $10k/month budget

**Key Recommendations:**
- **Compute:** ECS Fargate containers, auto-scaling across multiple AZs
- **Database:** Aurora PostgreSQL (multi-AZ, global database for multi-region)
- **Caching:** ElastiCache Redis cluster mode (sharding, multi-AZ)
- **Storage:** S3 with lifecycle policies (Standard → Glacier)
- **CDN:** CloudFront global distribution
- **API Gateway:** Application Load Balancer + WAF
- **Monitoring:** Datadog (comprehensive observability)

**Cost Breakdown:**
- ECS Fargate: ~$3,000/month (8 vCPU, 16GB RAM avg)
- Aurora: ~$2,500/month (multi-region, read replicas)
- ElastiCache: ~$800/month (cluster mode, multi-AZ)
- S3 + CloudFront: ~$500/month (multi-region, 2TB transfer)
- ALB + WAF: ~$200/month
- Datadog: ~$1,500/month (infrastructure + APM)
- Misc (backups, logging): ~$500/month
- **Total: ~$9,000/month** (within budget)

**Scaling:** Multi-region deployment from day 1. Auto-scaling based on CPU and request metrics. Database read replicas in each region for low latency reads.

---

### Example 3: Demo/POC Mobile Backend (Demo Level)

**Scenario:** Mobile app backend MVP, <100 concurrent users, GCP, minimal cost (<$100/month)

**Key Recommendations:**
- **Compute:** Cloud Run (serverless containers, pay-per-use)
- **Database:** Cloud SQL PostgreSQL db-f1-micro (smallest instance)
- **Storage:** Cloud Storage standard class
- **Authentication:** Firebase Auth (generous free tier)
- **Monitoring:** Basic Cloud Monitoring (free tier)

**Cost Breakdown:**
- Cloud Run: ~$5/month (low traffic, pay-per-request)
- Cloud SQL: ~$30/month (db-f1-micro, minimal storage)
- Cloud Storage: ~$2/month (10GB)
- Firebase Auth: Free (under 50k MAU)
- Monitoring: Free (within limits)
- **Total: ~$37/month** (well under $100 budget)

**Scaling:** This is intentionally minimal for demo. When ready for production (>100 concurrent users), upgrade to db-g1-small, add Redis caching, enable Cloud CDN, and implement proper monitoring.

---

## Platform-Specific Guidance

### AWS Recommendations

**For Small Projects (<1k concurrent users):**
- Lambda + API Gateway (serverless, cost-effective)
- RDS PostgreSQL/MySQL (db.t3.small or t3.medium)
- S3 for storage, CloudFront for CDN
- Cognito for authentication
- CloudWatch for monitoring

**For Medium Projects (1k-10k concurrent users):**
- ECS Fargate or EC2 with Auto Scaling
- RDS Multi-AZ (db.r5.large or similar)
- ElastiCache Redis for caching
- Application Load Balancer
- CloudWatch + AWS X-Ray for observability

**For Large Projects (10k+ concurrent users):**
- ECS/EKS with auto-scaling
- Aurora (better scaling than RDS)
- ElastiCache Redis cluster mode
- CloudFront with Lambda@Edge for edge computing
- Multi-region deployment for global users
- Datadog or New Relic for comprehensive monitoring

---

### Azure Recommendations

**For Small Projects:**
- Azure Functions + API Management
- Azure SQL Database (Basic or S0 tier)
- Azure Blob Storage + Azure CDN
- Azure AD B2C for authentication
- Application Insights for monitoring

**For Medium Projects:**
- Azure App Service or Container Instances
- Azure SQL Database (S3-S6 tier) or PostgreSQL
- Azure Cache for Redis
- Azure Application Gateway
- Application Insights + Log Analytics

**For Large Projects:**
- Azure Kubernetes Service (AKS)
- Azure SQL Database (Premium tier) or Cosmos DB
- Azure Cache for Redis (Premium tier)
- Azure Front Door for global distribution
- Azure Monitor + Application Insights

---

### GCP Recommendations

**For Small Projects:**
- Cloud Run (serverless containers)
- Cloud SQL PostgreSQL (db-f1-micro or db-g1-small)
- Cloud Storage + Cloud CDN
- Firebase Auth or Identity Platform
- Cloud Monitoring (free tier)

**For Medium Projects:**
- Cloud Run or GKE Autopilot
- Cloud SQL (db-n1-standard-1 or similar)
- Memorystore for Redis
- Cloud Load Balancing
- Cloud Monitoring + Cloud Trace

**For Large Projects:**
- Google Kubernetes Engine (GKE)
- Cloud Spanner (global distribution) or Cloud SQL HA
- Memorystore for Redis (high availability)
- Cloud CDN + Cloud Armor
- Operations Suite (full observability)

---

## Scaling Triggers (When to Upgrade)

Use these specific thresholds to determine when to scale up:

### Compute Scaling Triggers

- CPU utilization >70% for >15 minutes
- Memory utilization >80%
- Request queue depth increasing
- Response time p95 >500ms
- Error rate >1%

**Action:** Add more instances (horizontal) or upgrade instance size (vertical)

---

### Database Scaling Triggers

- CPU utilization >70%
- Connection count >80% of max connections
- Disk IOPS saturated
- Storage >80% full
- Replication lag >5 seconds (if using replicas)

**Action:** Upgrade instance size, add read replicas, implement connection pooling, or optimize queries

---

### Caching Triggers

- Database query response time >200ms
- High read-to-write ratio (>80% reads)
- Same data accessed frequently (cache hit rate potential >50%)
- API rate limiting needed

**Action:** Add Redis/Memcached caching layer

---

### CDN Triggers

- Origin server bandwidth >1TB/month
- Global user distribution (users in multiple continents)
- Static asset requests >1M/month
- Origin response time >100ms for static assets

**Action:** Implement CloudFront/CDN

---

## Cost Optimization Tips

### 1. Right-Sizing

- Monitor actual resource usage for 2-4 weeks
- Downsize over-provisioned instances
- Use burstable instances (t3/t4g) for variable workloads
- **Typical savings:** 20-40%

### 2. Reserved Instances / Savings Plans

- Commit to 1 or 3 years for steady-state workloads
- Apply to database, cache, and baseline compute
- **Typical savings:** 30-70% vs. on-demand

### 3. Spot Instances (AWS/Azure)

- Use for fault-tolerant, non-critical workloads
- Batch processing, CI/CD runners, test environments
- **Typical savings:** 70-90% vs. on-demand
- **Risk:** Can be terminated with short notice

### 4. Auto-Scaling

- Scale down during low-traffic periods (nights, weekends)
- Define minimum instances for availability
- **Typical savings:** 20-50% for variable traffic patterns

### 5. Storage Lifecycle Policies

- Move infrequently accessed data to cheaper tiers
- S3 Intelligent-Tiering or manual lifecycle rules
- Archive old logs and backups to Glacier/Archive tier
- **Typical savings:** 50-90% on old data

### 6. Serverless for Variable Traffic

- Pay only for actual usage
- No idle capacity costs
- Best for <10k requests/day or very spiky traffic
- **Break-even point:** Compare Lambda cost vs. EC2 cost at your request volume

---

## Notes

- Ask one question at a time to avoid overwhelming the architect
- Use the architect's actual answers - don't assume or fill in blanks
- If uncertain, ask clarifying questions about scale, traffic, or requirements
- Be practical and cost-conscious - don't over-engineer for day 1
- Consider team expertise - recommend managed services for less experienced teams
- Include specific service names and configurations, not generic advice
- Provide realistic 2026 cost estimates based on cloud provider pricing
- Document all assumptions made during the interview
- Focus on progressive scaling - start simple, scale as needed
- This is a living document - it's okay to start with MVP architecture and evolve

---

## Sources

Research on cloud architecture best practices and cost optimization informed this skill:

- [Top 30 Cloud Computing Interview Questions and Answers (2026) | DataCamp](https://www.datacamp.com/blog/cloud-computing-interview-questions)
- [40 Software Architecture Interview Questions (2026 Edition) | MentorCruise](https://mentorcruise.com/questions/solutions-architect/)
- [Top 50+ Cloud Scalability Interview Questions and Answers (2026) | Web Asha Technologies](https://www.webasha.com/blog/top-50-cloud-scalability-interview-questions-and-answers)
- [Top 20 Cloud Architecture Lead Interview Questions and Answers (2026) | Index.dev](https://www.index.dev/blog/cloud-architecture-lead-interview-questions)
- [40 Cloud Architect Interview Questions & Answers 2026 (AWS, Azure, GCP) | LastRound AI](https://lastroundai.com/blog/cloud-architect-interview-questions)
- [AWS vs. Azure vs. GCP: Executive Comparison and Decision Matrix | BairesDev](https://www.bairesdev.com/blog/aws-vs-azure-vs-gcp/)
- [Well Architecture Framework | Azure, AWS, GCP, OCI | Cloud4C](https://www.cloud4c.com/blogs/why-well-architected-frameworks-matter-in-cloud-adoption)
- [AWS vs Azure vs GCP 2026: Real-World Testing | Tech Insider](https://tech-insider.org/aws-vs-azure-vs-google-cloud-2026/)
- [Cost-Performance Evaluation: AWS, Azure, GCP, OCI | arXiv](https://arxiv.org/html/2412.03037)
- [Cloud Pricing Comparison: AWS vs Azure vs GCP (2026 Guide) | Usage.ai](https://www.usage.ai/blog/cloud-pricing-comparison-aws-azure-gcp)
