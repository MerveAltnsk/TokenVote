;; Enhanced TokenVote Contract - Advanced Features
;; Add these functions to make your project more innovative

;; QUADRATIC VOTING - Vote strength = sqrt(tokens spent)
(define-public (quadratic-vote (poll-id uint) (option-index uint) (tokens-to-spend uint))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (vote-power (sqrti tokens-to-spend))
  )
    ;; Transfer tokens to contract as "cost" of voting
    (try! (stx-transfer? tokens-to-spend sender (as-contract tx-sender)))
    
    ;; Record vote with calculated power
    (map-set votes { poll-id: poll-id, voter: sender } 
      { option: option-index, power: vote-power, tokens-spent: tokens-to-spend })
    
    (ok vote-power)
  )
)

;; DELEGATION SYSTEM - Allow users to delegate voting power
(define-map delegations
  principal ;; delegator
  principal ;; delegate
)

(define-public (delegate-vote (delegate principal))
  (begin
    (map-set delegations tx-sender delegate)
    (ok true)
  )
)

;; REPUTATION-BASED VOTING - Vote power based on participation history
(define-map user-reputation
  principal
  { votes-cast: uint, polls-created: uint, accuracy-score: uint }
)

(define-private (calculate-reputation-power (user principal))
  (let (
    (rep (default-to { votes-cast: u0, polls-created: u0, accuracy-score: u0 } 
                     (map-get? user-reputation user)))
  )
    (+ u1 (/ (+ (get votes-cast rep) (* (get polls-created rep) u2)) u10))
  )
)

;; TIME-WEIGHTED VOTING - Earlier votes have more power
(define-private (calculate-time-weight (poll-id uint))
  (let (
    (poll-info (unwrap-panic (map-get? polls poll-id)))
    (start-time (get start-time poll-info))
    (end-time (get end-time poll-info))
    (current-time block-height)
    (total-duration (- end-time start-time))
    (remaining-time (- end-time current-time))
  )
    (if (> remaining-time u0)
      (+ u1 (/ (* remaining-time u100) total-duration))
      u1
    )
  )
)

;; MULTI-SIGNATURE POLL CREATION - Require multiple approvals
(define-map poll-approvals
  uint ;; poll-id
  (list 10 principal) ;; approvers
)

(define-constant REQUIRED-APPROVALS u3)

(define-public (approve-poll (poll-id uint))
  (let (
    (current-approvals (default-to (list) (map-get? poll-approvals poll-id)))
  )
    (if (< (len current-approvals) REQUIRED-APPROVALS)
      (begin
        (map-set poll-approvals poll-id (unwrap! (as-max-len? (append current-approvals tx-sender) u10) ERR-NOT-AUTHORIZED))
        (ok true)
      )
      (err ERR-NOT-AUTHORIZED)
    )
  )
)

;; POLL CATEGORIES AND TAGS
(define-map poll-categories
  uint ;; poll-id
  { category: (string-ascii 20), tags: (list 5 (string-ascii 15)) }
)

;; ENCRYPTED VOTING (using commit-reveal scheme)
(define-map vote-commits
  { poll-id: uint, voter: principal }
  { commit-hash: (buff 32), revealed: bool }
)

(define-public (commit-vote (poll-id uint) (commit-hash (buff 32)))
  (begin
    (map-set vote-commits { poll-id: poll-id, voter: tx-sender }
      { commit-hash: commit-hash, revealed: false })
    (ok true)
  )
)

;; POLL FUNDING - Users can fund polls with rewards
(define-map poll-rewards
  uint ;; poll-id
  uint ;; reward-amount
)

(define-public (fund-poll (poll-id uint) (amount uint))
  (let (
    (current-reward (default-to u0 (map-get? poll-rewards poll-id)))
  )
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set poll-rewards poll-id (+ current-reward amount))
    (ok true)
  )
)
