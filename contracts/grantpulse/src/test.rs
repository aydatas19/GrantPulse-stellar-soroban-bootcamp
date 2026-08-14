#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_contract(env: &Env) -> GrantPulseContractClient<'_> {
    let contract_id = env.register(GrantPulseContract, ());
    GrantPulseContractClient::new(env, &contract_id)
}

#[test]
fn test_grant_pulse_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let client = setup_contract(&env);

    let owner = Address::generate(&env);
    let reviewer = Address::generate(&env);
    let second_reviewer = Address::generate(&env);
    let grant_id = String::from_str(&env, "grant-001");
    let title = String::from_str(&env, "Stellar Learning Kit");

    assert_eq!(client.get_grant_count(&owner), 0);
    assert_eq!(client.get_total_grants(), 0);
    assert_eq!(client.get_progress(&owner, &grant_id), 0);

    let missing = client.get_grant(&owner, &grant_id);
    assert_eq!(missing.title, String::from_str(&env, "Not found"));
    assert_eq!(missing.status, String::from_str(&env, "Missing"));
    assert!(!missing.active);

    assert_eq!(client.create_grant(&owner, &grant_id, &title, &2500, &3), 1);
    assert_eq!(client.get_grant_count(&owner), 1);
    assert_eq!(client.get_total_grants(), 1);

    let grant = client.get_grant(&owner, &grant_id);
    assert_eq!(grant.owner, owner);
    assert_eq!(grant.grant_id, grant_id);
    assert_eq!(grant.title, title);
    assert_eq!(grant.requested_amount, 2500);
    assert_eq!(grant.milestone_count, 3);
    assert_eq!(grant.completed_milestones, 0);
    assert_eq!(grant.status, String::from_str(&env, "Draft"));
    assert!(grant.active);

    assert_eq!(
        client.create_grant(
            &owner,
            &String::from_str(&env, "grant-001"),
            &String::from_str(&env, "Duplicate"),
            &900,
            &1
        ),
        1
    );
    assert_eq!(client.get_total_grants(), 1);

    assert_eq!(
        client.complete_milestone(
            &owner,
            &String::from_str(&env, "grant-001"),
            &String::from_str(&env, "Prototype ready")
        ),
        1
    );
    assert_eq!(
        client.get_progress(&owner, &String::from_str(&env, "grant-001")),
        33
    );

    assert_eq!(
        client.complete_milestone(
            &owner,
            &String::from_str(&env, "grant-001"),
            &String::from_str(&env, "Public demo")
        ),
        2
    );
    assert_eq!(
        client.complete_milestone(
            &owner,
            &String::from_str(&env, "grant-001"),
            &String::from_str(&env, "Final report")
        ),
        3
    );
    assert_eq!(
        client.get_progress(&owner, &String::from_str(&env, "grant-001")),
        100
    );

    let completed = client.get_grant(&owner, &String::from_str(&env, "grant-001"));
    assert_eq!(completed.status, String::from_str(&env, "Completed"));
    assert_eq!(completed.completed_milestones, 3);

    assert!(!client.review_grant(&owner, &owner, &String::from_str(&env, "grant-001"), &true));
    assert!(client.review_grant(
        &reviewer,
        &owner,
        &String::from_str(&env, "grant-001"),
        &true
    ));
    assert!(!client.review_grant(
        &reviewer,
        &owner,
        &String::from_str(&env, "grant-001"),
        &true
    ));
    assert!(client.review_grant(
        &second_reviewer,
        &owner,
        &String::from_str(&env, "grant-001"),
        &false
    ));

    let reviewed = client.get_grant(&owner, &String::from_str(&env, "grant-001"));
    assert_eq!(reviewed.approvals, 1);
    assert_eq!(reviewed.rejections, 1);

    assert!(client.archive_grant(&owner, &String::from_str(&env, "grant-001")));
    let archived = client.get_grant(&owner, &String::from_str(&env, "grant-001"));
    assert_eq!(archived.status, String::from_str(&env, "Archived"));
    assert!(!archived.active);
}

#[test]
fn test_zero_milestone_grant_defaults_to_one_milestone() {
    let env = Env::default();
    env.mock_all_auths();

    let client = setup_contract(&env);
    let owner = Address::generate(&env);
    let grant_id = String::from_str(&env, "zero-milestone");
    let title = String::from_str(&env, "Zero Milestone Safety");

    assert_eq!(client.create_grant(&owner, &grant_id, &title, &500, &0), 1);

    let grant = client.get_grant(&owner, &grant_id);
    assert_eq!(grant.milestone_count, 1);
    assert_eq!(client.get_progress(&owner, &grant_id), 0);

    assert_eq!(
        client.complete_milestone(&owner, &grant_id, &String::from_str(&env, "Done")),
        1
    );
    assert_eq!(client.get_progress(&owner, &grant_id), 100);
}

#[test]
fn test_duplicate_grant_does_not_increment_counts() {
    let env = Env::default();
    env.mock_all_auths();

    let client = setup_contract(&env);
    let owner = Address::generate(&env);
    let grant_id = String::from_str(&env, "duplicate-check");

    assert_eq!(
        client.create_grant(
            &owner,
            &grant_id,
            &String::from_str(&env, "Original Grant"),
            &800,
            &2
        ),
        1
    );
    assert_eq!(
        client.create_grant(
            &owner,
            &grant_id,
            &String::from_str(&env, "Duplicate Grant"),
            &100,
            &1
        ),
        1
    );

    let grant = client.get_grant(&owner, &grant_id);
    assert_eq!(grant.title, String::from_str(&env, "Original Grant"));
    assert_eq!(grant.requested_amount, 800);
    assert_eq!(client.get_grant_count(&owner), 1);
    assert_eq!(client.get_total_grants(), 1);
}

#[test]
fn test_archived_grant_rejects_progress_and_reviews() {
    let env = Env::default();
    env.mock_all_auths();

    let client = setup_contract(&env);
    let owner = Address::generate(&env);
    let reviewer = Address::generate(&env);
    let grant_id = String::from_str(&env, "archive-check");

    assert_eq!(
        client.create_grant(
            &owner,
            &grant_id,
            &String::from_str(&env, "Archive Safety"),
            &1200,
            &3
        ),
        1
    );
    assert!(client.archive_grant(&owner, &grant_id));

    assert_eq!(
        client.complete_milestone(
            &owner,
            &grant_id,
            &String::from_str(&env, "Should not update")
        ),
        0
    );
    assert!(!client.review_grant(&reviewer, &owner, &grant_id, &true));

    let grant = client.get_grant(&owner, &grant_id);
    assert_eq!(grant.completed_milestones, 0);
    assert_eq!(grant.approvals, 0);
    assert_eq!(grant.status, String::from_str(&env, "Archived"));
}
