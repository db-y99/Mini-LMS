# DATABASE INTEGRATION PLAN
## Y99 Multi-Branch LMS - Supabase Integration Strategy

**Version:** 1.0  
**Date:** 2026-03-29  
**Status:** Planning Phase

---

## 📋 EXECUTIVE SUMMARY

### Mục tiêu
Migrate từ localStorage sang Supabase database với chiến lược 2 giai đoạn:
1. **Phase 1 (Now):** Supabase Cloud (Development & Early Production)
2. **Phase 2 (Year 1+):** Supabase Self-hosted (Scale Production)

### Timeline
- **Week 1-2:** Database schema design & setup
- **Week 3-4:** Database abstraction layer implementation
- **Week 5-6:** Data migration & testing
- **Week 7-8:** Production deployment & monitoring

### Success Criteria
- ✅ Zero data loss during migration
- ✅ < 200ms API response time
- ✅ Support 100+ concurrent users
- ✅ Easy migration path to self-hosted

---

## 🎯 CHIẾN LƯỢC TỔNG QUAN

### Phase 1: Supabase Cloud (0-6 tháng)

**Mục đích:** Rapid development, focus on business logic

**Infrastructure:**
```
Supabase Cloud Free Tier
├── Postgres Database (500MB)
├── Auth (JWT + RLS)
├── Storage (1GB)
├── Realtime subscriptions
└── Auto REST API
```

**Chi phí:** $0/tháng (Free tier)

**Khi nào upgrade:**
- Database > 400MB
- > 50 concurrent users
- > 2GB bandwidth/month

### Phase 2: Supabase Self-hosted (6+ tháng)

**Mục đích:** Cost optimization, full control, scale ready

**Infrastructure:**
```
VPS Server (8GB RAM, 4 vCPU)
├── Supabase Stack (Docker Compose)
│   ├── Postgres 15
│   ├── PostgREST
│   ├── GoTrue (Auth)
│   ├── Storage API
│   ├── Realtime
│   └── Studio (Admin UI)
├── Nginx (Reverse Proxy)
└── Backup & Monitoring
```

**Chi phí:** $40-80/tháng

**Trigger migration khi:**
- Supabase Cloud cost > $100/tháng
- Đạt 40-50 branches
- Cần custom infrastructure

---

## 📊 DATABASE SCHEMA DESIGN

### Core Tables

#### 1. loans (Khoản vay)
```sql
CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Customer info
  customer_id UUID REFERENCES customers(id),
  
  -- Loan details
  loan_amount DECIMAL(15,2) NOT NULL,
  loan_duration INTEGER NOT NULL, -- months
  interest_rate DECIMAL(5,2) NOT NULL,
  collateral_type VARCHAR(50) NOT NULL,
  collateral_value DECIMAL(15,2),
  
  -- Status tracking
  canonical_status VARCHAR(50) NOT NULL,
  legacy_status VARCHAR(50),
  
  -- Workflow
  current_step VARCHAR(100),
  assigned_to UUID REFERENCES users(id),
  branch_id UUID REFERENCES branches(id),
  
  -- Computed fields
  dpd INTEGER DEFAULT 0, -- Days Past Due
  overdue_level VARCHAR(20),
  
  -- Dates
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ,
  due_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  -- Indexes
  CONSTRAINT valid_status CHECK (canonical_status IN (
    'DRAFT', 'SUBMITTED', 'UNDER_ASSESSMENT', 'NEED_ADDITIONAL_INFO',
    'ASSESSMENT_APPROVED', 'CREDIT_APPROVED', 'REQUIRE_DEVICE_LOCK',
    'DEVICE_LOCKED', 'REQUIRE_COLLATERAL_CONFIRMATION', 'COLLATERAL_CONFIRMED',
    'CONTRACT_SENT', 'CONTRACT_SIGNED', 'READY_FOR_DISBURSEMENT',
    'DISBURSEMENT_DRAFTED', 'DISBURSEMENT_APPROVED', 'DISBURSEMENT_PROCESSING',
    'DISBURSEMENT_FAILED', 'DISBURSED', 'IN_REPAYMENT', 'RESTRUCTURED',
    'COLLECTION_IN_PROGRESS', 'SETTLED', 'WRITE_OFF', 'BAD_DEBT',
    'CANCELLED', 'REJECTED'
  ))
);

-- Indexes
CREATE INDEX idx_loans_status ON loans(canonical_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_loans_branch ON loans(branch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_assigned ON loans(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_loans_dpd ON loans(dpd) WHERE dpd > 0 AND deleted_at IS NULL;
CREATE INDEX idx_loans_created ON loans(created_at DESC);

-- Auto update timestamp
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 2. customers (Khách hàng)
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Personal info
  full_name VARCHAR(255) NOT NULL,
  id_number VARCHAR(50) UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  
  -- Contact
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  province VARCHAR(100),
  district VARCHAR(100),
  ward VARCHAR(100),
  
  -- Employment
  occupation VARCHAR(255),
  monthly_income DECIMAL(15,2),
  employer_name VARCHAR(255),
  employer_address TEXT,
  
  -- Credit
  credit_score INTEGER,
  blacklist_status BOOLEAN DEFAULT FALSE,
  blacklist_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_customers_id_number ON customers(id_number);
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_blacklist ON customers(blacklist_status) WHERE blacklist_status = TRUE;
```

#### 3. loan_documents (Tài liệu)
```sql
CREATE TABLE loan_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Document info
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  
  -- Status
  verification_status VARCHAR(50) DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id)
);

CREATE INDEX idx_documents_loan ON loan_documents(loan_id);
CREATE INDEX idx_documents_type ON loan_documents(document_type);
```

#### 4. loan_events (Event log)
```sql
CREATE TABLE loan_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  description TEXT,
  
  -- Context
  user_id UUID REFERENCES users(id),
  user_role VARCHAR(50),
  branch_id UUID REFERENCES branches(id),
  
  -- Correlation
  correlation_id UUID,
  parent_event_id UUID REFERENCES loan_events(id),
  
  -- Metadata
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_events_loan ON loan_events(loan_id, created_at DESC);
CREATE INDEX idx_events_type ON loan_events(event_type);
CREATE INDEX idx_events_user ON loan_events(user_id);
CREATE INDEX idx_events_correlation ON loan_events(correlation_id);
CREATE INDEX idx_events_created ON loan_events(created_at DESC);
```

#### 5. loan_versions (Version history)
```sql
CREATE TABLE loan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Version info
  version INTEGER NOT NULL,
  version_type VARCHAR(50) NOT NULL, -- 'snapshot', 'manual', 'auto'
  
  -- Snapshot data
  snapshot_data JSONB NOT NULL,
  
  -- Validity period
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  
  -- Metadata
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(loan_id, version)
);

CREATE INDEX idx_versions_loan ON loan_versions(loan_id, version DESC);
CREATE INDEX idx_versions_effective ON loan_versions(loan_id, effective_from, effective_to);
```

#### 6. users (Người dùng)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Auth (synced with Supabase Auth)
  auth_id UUID UNIQUE, -- Supabase auth.users.id
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  
  -- Profile
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  avatar_url TEXT,
  
  -- Role & Branch
  role VARCHAR(50) NOT NULL,
  branch_id UUID REFERENCES branches(id),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_role CHECK (role IN (
    'admin', 'cskh', 'ca', 'sec', 'bm', 'acc', 'co', 'legal', 'it'
  ))
);

CREATE INDEX idx_users_role ON users(role) WHERE is_active = TRUE;
CREATE INDEX idx_users_branch ON users(branch_id) WHERE is_active = TRUE;
CREATE INDEX idx_users_auth ON users(auth_id);
```

#### 7. branches (Chi nhánh)
```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Branch info
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  
  -- Contact
  phone VARCHAR(20),
  email VARCHAR(255),
  
  -- Manager
  manager_id UUID REFERENCES users(id),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_active ON branches(is_active);
CREATE INDEX idx_branches_province ON branches(province);
```

#### 8. payments (Thanh toán)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_type VARCHAR(50) NOT NULL, -- 'disbursement', 'repayment', 'penalty'
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(50),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Transaction
  transaction_id VARCHAR(255),
  transaction_date TIMESTAMPTZ,
  
  -- Bank details
  bank_name VARCHAR(255),
  account_number VARCHAR(100),
  account_name VARCHAR(255),
  
  -- Metadata
  notes TEXT,
  processed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(transaction_date DESC);
```

#### 9. audit_logs (Audit trail)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  user_id UUID REFERENCES users(id),
  user_role VARCHAR(50),
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

### Helper Functions

```sql
-- Auto update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate DPD (Days Past Due)
CREATE OR REPLACE FUNCTION calculate_dpd(loan_id UUID)
RETURNS INTEGER AS $$
DECLARE
  due_date DATE;
  dpd INTEGER;
BEGIN
  SELECT l.due_date INTO due_date
  FROM loans l
  WHERE l.id = loan_id;
  
  IF due_date IS NULL THEN
    RETURN 0;
  END IF;
  
  dpd := GREATEST(0, CURRENT_DATE - due_date);
  RETURN dpd;
END;
$$ LANGUAGE plpgsql;
```

---

## 🏗️ ARCHITECTURE DESIGN

### Database Abstraction Layer

```
Application Layer
       ↓
Module APIs (LoanModule, WorkflowModule, etc.)
       ↓
Repository Layer (Interface)
       ↓
    ┌──────┴──────┐
    ↓             ↓
Supabase      Postgres
Repository    Repository
(Cloud)       (Self-hosted)
```

### Repository Pattern

```typescript
// src/infrastructure/database/IRepository.ts
export interface ILoanRepository {
  findById(id: string): Promise<Loan | null>;
  findAll(filter?: LoanFilter): Promise<Loan[]>;
  create(loan: CreateLoanDTO): Promise<Loan>;
  update(id: string, data: UpdateLoanDTO): Promise<Loan>;
  delete(id: string): Promise<void>;
}

// src/infrastructure/database/supabase/SupabaseLoanRepository.ts
export class SupabaseLoanRepository implements ILoanRepository {
  // Supabase implementation
}

// src/infrastructure/database/postgres/PostgresLoanRepository.ts
export class PostgresLoanRepository implements ILoanRepository {
  // Direct Postgres implementation (future)
}
```

---

## 📅 IMPLEMENTATION TIMELINE

### Week 1-2: Setup & Schema

**Tasks:**
1. ✅ Create Supabase project
2. ✅ Design database schema
3. ✅ Create migration scripts
4. ✅ Setup Row Level Security (RLS)
5. ✅ Create database functions & triggers

**Deliverables:**
- Supabase project configured
- Schema migration files
- RLS policies documented

### Week 3-4: Abstraction Layer

**Tasks:**
1. ✅ Create repository interfaces
2. ✅ Implement Supabase repositories
3. ✅ Update modules to use repositories
4. ✅ Add connection pooling
5. ✅ Implement caching layer

**Deliverables:**
- Repository layer complete
- All modules using repositories
- Unit tests for repositories

### Week 5-6: Data Migration

**Tasks:**
1. ✅ Create migration scripts (localStorage → Supabase)
2. ✅ Test migration with sample data
3. ✅ Implement rollback mechanism
4. ✅ Performance testing
5. ✅ Load testing (100+ concurrent users)

**Deliverables:**
- Migration scripts tested
- Performance benchmarks
- Rollback procedures documented

### Week 7-8: Production Deployment

**Tasks:**
1. ✅ Deploy to staging
2. ✅ User acceptance testing
3. ✅ Production deployment
4. ✅ Monitor & optimize
5. ✅ Documentation update

**Deliverables:**
- Production deployment complete
- Monitoring dashboards
- Updated documentation

---

## 🔒 SECURITY & COMPLIANCE

### Row Level Security (RLS)

```sql
-- Users can only see loans in their branch
CREATE POLICY branch_isolation ON loans
  FOR SELECT
  USING (
    branch_id IN (
      SELECT branch_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Admin can see all
CREATE POLICY admin_all_access ON loans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Users can only update assigned loans
CREATE POLICY assigned_update ON loans
  FOR UPDATE
  USING (
    assigned_to IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );
```

### Data Encryption

- ✅ TLS/SSL for all connections
- ✅ Encrypted at rest (Supabase default)
- ✅ Sensitive fields encrypted (ID numbers, bank accounts)
- ✅ Audit logs for all data access

### Backup Strategy

**Supabase Cloud:**
- Automatic daily backups (7 days retention)
- Point-in-time recovery (PITR)

**Self-hosted:**
- Daily full backups (30 days retention)
- Hourly incremental backups (7 days retention)
- Off-site backup storage
- Automated restore testing

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Optimization

1. **Indexes:** All foreign keys, status fields, date fields
2. **Partitioning:** Partition `loan_events` by month
3. **Materialized Views:** Dashboard statistics
4. **Connection Pooling:** PgBouncer (100 connections)
5. **Query Optimization:** EXPLAIN ANALYZE all queries

### Caching Strategy

```
Redis Cache Layer
├── Loan list (5 min TTL)
├── User sessions (24 hour TTL)
├── Dashboard stats (15 min TTL)
└── Branch data (1 hour TTL)
```

### Expected Performance

| Metric | Target | Actual |
|--------|--------|--------|
| API Response Time | < 200ms | TBD |
| Database Query Time | < 50ms | TBD |
| Concurrent Users | 100+ | TBD |
| Throughput | 1000 req/min | TBD |

---

## 🚀 MIGRATION STRATEGY

### Phase 1: Parallel Run (Week 5)

```
localStorage (Read/Write) ← Current
     ↓ (sync)
Supabase (Write only) ← Testing
```

### Phase 2: Gradual Cutover (Week 6)

```
localStorage (Read only) ← Fallback
     ↑ (if error)
Supabase (Read/Write) ← Primary
```

### Phase 3: Full Migration (Week 7)

```
Supabase (Read/Write) ← Only source
localStorage (Disabled)
```

### Rollback Plan

If issues occur:
1. Switch reads back to localStorage
2. Stop writes to Supabase
3. Investigate & fix issues
4. Resume migration

---

## 📊 MONITORING & ALERTING

### Metrics to Track

1. **Database:**
   - Connection pool usage
   - Query performance
   - Slow queries (> 100ms)
   - Deadlocks

2. **Application:**
   - API response times
   - Error rates
   - Cache hit rates
   - Active users

3. **Infrastructure:**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network bandwidth

### Alerts

- ⚠️ Response time > 500ms
- 🚨 Error rate > 1%
- 🚨 Database connections > 80%
- ⚠️ Disk usage > 80%

---

## 💰 COST ESTIMATION

### Supabase Cloud

| Tier | Storage | Bandwidth | Users | Cost/month |
|------|---------|-----------|-------|------------|
| Free | 500MB | 2GB | 50K MAU | $0 |
| Pro | 8GB | 250GB | Unlimited | $25 |
| Team | 100GB | 250GB | Unlimited | $599 |

### Supabase Self-hosted

| Component | Specs | Cost/month |
|-----------|-------|------------|
| VPS | 8GB RAM, 4 vCPU | $40-80 |
| Backup Storage | 100GB | $5-10 |
| Monitoring | Grafana Cloud | $0-20 |
| **Total** | | **$45-110** |

### Break-even Analysis

- Supabase Cloud Pro: $25/month
- Self-hosted: $60/month (average)
- Break-even: When need > 8GB storage or > 250GB bandwidth

**Recommendation:** Start with Cloud Free → Cloud Pro → Self-hosted

---

## ✅ SUCCESS CRITERIA

### Technical

- ✅ All data migrated successfully (0% loss)
- ✅ API response time < 200ms (p95)
- ✅ Support 100+ concurrent users
- ✅ 99.9% uptime
- ✅ All tests passing

### Business

- ✅ No disruption to users
- ✅ Improved performance vs localStorage
- ✅ Ready to scale to 50+ branches
- ✅ Cost-effective solution

### Documentation

- ✅ Database schema documented
- ✅ API documentation updated
- ✅ Migration guide complete
- ✅ Troubleshooting guide

---

## 📚 NEXT STEPS

1. **Review & Approve** this plan
2. **Create Supabase project** (5 minutes)
3. **Start Week 1 tasks** (Schema design)
4. **Daily standups** to track progress
5. **Weekly demos** to stakeholders

---

## 📞 CONTACTS

**Technical Lead:** [Your Name]  
**Database Admin:** [DBA Name]  
**DevOps:** [DevOps Name]

**Supabase Support:** support@supabase.io  
**Documentation:** https://supabase.com/docs

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-29  
**Next Review:** Weekly during implementation
