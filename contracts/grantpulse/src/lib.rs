#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contract]
pub struct GrantPulseContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Grant {
    pub owner: Address,
    pub grant_id: String,
    pub title: String,
    pub requested_amount: u32,
    pub milestone_count: u32,
    pub completed_milestones: u32,
    pub approvals: u32,
    pub rejections: u32,
    pub status: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Grant(Address, String),
    Review(Address, String, Address),
    GrantCount(Address),
    TotalGrants,
}

#[contractimpl]
impl GrantPulseContract {
    pub fn create_grant(
        env: Env,
        owner: Address,
        grant_id: String,
        title: String,
        requested_amount: u32,
        milestone_count: u32,
    ) -> u32 {
        owner.require_auth();

        let grant_key = DataKey::Grant(owner.clone(), grant_id.clone());
        let count_key = DataKey::GrantCount(owner.clone());
        let mut owner_count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);

        if env.storage().persistent().has(&grant_key) {
            return owner_count;
        }

        let mut total_grants: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalGrants)
            .unwrap_or(0);

        owner_count += 1;
        total_grants += 1;

        let now = env.ledger().timestamp();
        let safe_milestone_count = if milestone_count == 0 {
            1
        } else {
            milestone_count
        };

        let grant = Grant {
            owner,
            grant_id,
            title,
            requested_amount,
            milestone_count: safe_milestone_count,
            completed_milestones: 0,
            approvals: 0,
            rejections: 0,
            status: String::from_str(&env, "Draft"),
            created_at: now,
            updated_at: now,
            active: true,
        };

        env.storage().persistent().set(&grant_key, &grant);
        env.storage().persistent().set(&count_key, &owner_count);
        env.storage()
            .instance()
            .set(&DataKey::TotalGrants, &total_grants);

        owner_count
    }

    pub fn complete_milestone(env: Env, owner: Address, grant_id: String, status: String) -> u32 {
        owner.require_auth();

        let grant_key = DataKey::Grant(owner, grant_id);
        let grant: Option<Grant> = env.storage().persistent().get(&grant_key);

        match grant {
            Some(mut existing) if existing.active => {
                if existing.completed_milestones < existing.milestone_count {
                    existing.completed_milestones += 1;
                    existing.status = if existing.completed_milestones == existing.milestone_count {
                        String::from_str(&env, "Completed")
                    } else {
                        status
                    };
                    existing.updated_at = env.ledger().timestamp();
                    env.storage().persistent().set(&grant_key, &existing);
                }
                existing.completed_milestones
            }
            _ => 0,
        }
    }

    pub fn review_grant(
        env: Env,
        reviewer: Address,
        owner: Address,
        grant_id: String,
        approved: bool,
    ) -> bool {
        reviewer.require_auth();

        if reviewer == owner {
            return false;
        }

        let grant_key = DataKey::Grant(owner.clone(), grant_id.clone());
        let review_key = DataKey::Review(owner, grant_id, reviewer);
        let grant: Option<Grant> = env.storage().persistent().get(&grant_key);

        if env.storage().persistent().has(&review_key) {
            return false;
        }

        match grant {
            Some(mut existing) if existing.active => {
                if approved {
                    existing.approvals += 1;
                } else {
                    existing.rejections += 1;
                }

                existing.updated_at = env.ledger().timestamp();
                env.storage().persistent().set(&grant_key, &existing);
                env.storage().persistent().set(&review_key, &approved);
                true
            }
            _ => false,
        }
    }

    pub fn archive_grant(env: Env, owner: Address, grant_id: String) -> bool {
        owner.require_auth();

        let grant_key = DataKey::Grant(owner, grant_id);
        let grant: Option<Grant> = env.storage().persistent().get(&grant_key);

        match grant {
            Some(mut existing) if existing.active => {
                existing.active = false;
                existing.status = String::from_str(&env, "Archived");
                existing.updated_at = env.ledger().timestamp();
                env.storage().persistent().set(&grant_key, &existing);
                true
            }
            _ => false,
        }
    }

    pub fn get_grant(env: Env, owner: Address, grant_id: String) -> Grant {
        env.storage()
            .persistent()
            .get(&DataKey::Grant(owner.clone(), grant_id.clone()))
            .unwrap_or(Grant {
                owner,
                grant_id,
                title: String::from_str(&env, "Not found"),
                requested_amount: 0,
                milestone_count: 0,
                completed_milestones: 0,
                approvals: 0,
                rejections: 0,
                status: String::from_str(&env, "Missing"),
                created_at: 0,
                updated_at: 0,
                active: false,
            })
    }

    pub fn get_progress(env: Env, owner: Address, grant_id: String) -> u32 {
        let grant: Option<Grant> = env
            .storage()
            .persistent()
            .get(&DataKey::Grant(owner, grant_id));

        match grant {
            Some(existing) if existing.milestone_count > 0 => {
                existing.completed_milestones * 100 / existing.milestone_count
            }
            _ => 0,
        }
    }

    pub fn get_grant_count(env: Env, owner: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::GrantCount(owner))
            .unwrap_or(0)
    }

    pub fn get_total_grants(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalGrants)
            .unwrap_or(0)
    }
}

mod test;
