# StellForge Database Schema

## Overview
PostgreSQL database schema for StellForge GameFi + DeFi platform.

## Tables

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(56) UNIQUE NOT NULL,
    username VARCHAR(50),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    kyc_status VARCHAR(20) DEFAULT 'none',
    risk_score DECIMAL(3,2) DEFAULT 0.00,
    total_xlf_earned BIGINT DEFAULT 0,
    referral_code VARCHAR(20) UNIQUE,
    referred_by_id INTEGER REFERENCES users(id)
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_referral_code ON users(referral_code);
```

### WalletRisk
```sql
CREATE TABLE wallet_risk (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    ip_address INET,
    device_fingerprint VARCHAR(255),
    wallet_age_days INTEGER,
    transaction_count INTEGER,
    social_verified BOOLEAN DEFAULT false,
    flagged BOOLEAN DEFAULT false,
    flag_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallet_risk_user ON wallet_risk(user_id);
CREATE INDEX idx_wallet_risk_ip ON wallet_risk(ip_address);
```

### Referrals
```sql
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES users(id),
    child_id INTEGER REFERENCES users(id),
    depth INTEGER NOT NULL,
    bonus_earned BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(parent_id, child_id)
);

CREATE INDEX idx_referrals_parent ON referrals(parent_id);
CREATE INDEX idx_referrals_child ON referrals(child_id);
```

### Airdrops
```sql
CREATE TABLE airdrops (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER REFERENCES users(id),
    token_address VARCHAR(56) NOT NULL,
    token_symbol VARCHAR(12) NOT NULL,
    total_budget BIGINT NOT NULL,
    per_user_claim BIGINT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_airdrops_creator ON airdrops(creator_id);
CREATE INDEX idx_airdrops_status ON airdrops(status);
```

### Tasks
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    airdrop_id INTEGER REFERENCES airdrops(id),
    task_type VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    reward_amount BIGINT NOT NULL,
    verification_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tasks_airdrop ON tasks(airdrop_id);
```

### TaskCompletions
```sql
CREATE TABLE task_completions (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id),
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'pending',
    proof_hash VARCHAR(64),
    reward_claimed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    verified_at TIMESTAMP,
    UNIQUE(task_id, user_id)
);

CREATE INDEX idx_task_completions_user ON task_completions(user_id);
CREATE INDEX idx_task_completions_task ON task_completions(task_id);
```

### StakingPools
```sql
CREATE TABLE staking_pools (
    id SERIAL PRIMARY KEY,
    pool_address VARCHAR(56) UNIQUE NOT NULL,
    token_address VARCHAR(56) NOT NULL,
    token_symbol VARCHAR(12) NOT NULL,
    apy DECIMAL(5,2),
    lock_period_days INTEGER,
    total_staked BIGINT DEFAULT 0,
    total_rewards_distributed BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staking_pools_token ON staking_pools(token_address);
```

### Stakes
```sql
CREATE TABLE stakes (
    id SERIAL PRIMARY KEY,
    pool_id INTEGER REFERENCES staking_pools(id),
    user_id INTEGER REFERENCES users(id),
    amount BIGINT NOT NULL,
    rewards_accrued BIGINT DEFAULT 0,
    staked_at TIMESTAMP DEFAULT NOW(),
    unlock_at TIMESTAMP,
    unstaked_at TIMESTAMP
);

CREATE INDEX idx_stakes_user ON stakes(user_id);
CREATE INDEX idx_stakes_pool ON stakes(pool_id);
```

### DailyQuests
```sql
CREATE TABLE daily_quests (
    id SERIAL PRIMARY KEY,
    quest_name VARCHAR(100) NOT NULL,
    description TEXT,
    reward_xlf BIGINT NOT NULL,
    quest_date DATE NOT NULL,
    max_completions INTEGER DEFAULT 1000,
    current_completions INTEGER DEFAULT 0
);

CREATE INDEX idx_daily_quests_date ON daily_quests(quest_date);
```

### QuestCompletions
```sql
CREATE TABLE quest_completions (
    id SERIAL PRIMARY KEY,
    quest_id INTEGER REFERENCES daily_quests(id),
    user_id INTEGER REFERENCES users(id),
    completed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(quest_id, user_id)
);

CREATE INDEX idx_quest_completions_user ON quest_completions(user_id);
```

### SpinEntries
```sql
CREATE TABLE spin_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    reward_type VARCHAR(20),
    reward_amount BIGINT,
    block_hash VARCHAR(64),
    spun_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_spin_entries_user ON spin_entries(user_id);
```

### Leaderboards
```sql
CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(50) NOT NULL,
    score BIGINT NOT NULL,
    rank INTEGER,
    period VARCHAR(20) DEFAULT 'weekly',
    period_start DATE,
    period_end DATE,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, category, period, period_start)
);

CREATE INDEX idx_leaderboards_category_rank ON leaderboards(category, rank);
CREATE INDEX idx_leaderboards_period ON leaderboards(period, period_start);
```

### EventLog
```sql
CREATE TABLE event_log (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    user_id INTEGER REFERENCES users(id),
    contract_address VARCHAR(56),
    transaction_hash VARCHAR(64),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_event_log_type ON event_log(event_type);
CREATE INDEX idx_event_log_user ON event_log(user_id);
CREATE INDEX idx_event_log_created ON event_log(created_at);
```
