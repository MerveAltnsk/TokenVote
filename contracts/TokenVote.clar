;; TokenVote Smart Contract
;; A decentralized voting system for token holders

;; Constants
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-INVALID-TIME (err u402))
(define-constant ERR-VOTING-NOT-STARTED (err u403))
(define-constant ERR-VOTING-ENDED (err u404))
(define-constant ERR-INVALID-OPTION (err u405))
(define-constant ERR-ALREADY-VOTED (err u406))
(define-constant ERR-POLL-NOT-FOUND (err u407))
(define-constant ERR-TOKEN-CHECK-FAILED (err u408))

;; Data variables
(define-data-var poll-count uint u0)

;; Maps
(define-map polls
  uint ;; poll-id
  {
    creator: principal,
    question: (string-ascii 256),
    options: (list 5 (string-ascii 64)),
    start-block: uint,
    end-block: uint,
    votes-cast: uint,
    is-active: bool
  })

(define-map votes
  {poll-id: uint, voter: principal}
  uint ;; option index voted for
)

(define-map vote-counts
  {poll-id: uint, option-index: uint}
  uint ;; number of votes for this option
)

;; Token contract address for governance token
;; This points to the local governance token contract
(define-constant governance-token .governance-token)

;; Helper functions

;; Check if caller owns governance tokens
(define-read-only (is-token-holder (caller principal))
  (let ((balance (unwrap! (contract-call? governance-token get-balance caller) false)))
    (> balance u0)
  )
)

;; Get the current poll count
(define-read-only (get-poll-count)
  (var-get poll-count)
)

;; Get vote count for a specific option in a poll
(define-read-only (get-vote-count (poll-id uint) (option-index uint))
  (default-to u0 (map-get? vote-counts {poll-id: poll-id, option-index: option-index}))
)

;; Public functions

;; Create a new poll (only token holders can create polls)
(define-public (create-poll 
  (question (string-ascii 256)) 
  (options (list 5 (string-ascii 64))) 
  (start-block uint) 
  (end-block uint))
  (let ((caller tx-sender)
        (poll-id (var-get poll-count)))
    ;; Check if caller is a token holder
    (asserts! (is-token-holder caller) ERR-NOT-AUTHORIZED)
    
    ;; Validate time parameters
    (asserts! (> end-block start-block) ERR-INVALID-TIME)
    (asserts! (> start-block block-height) ERR-INVALID-TIME)
    
    ;; Validate options list (must have at least 2 options)
    (asserts! (>= (len options) u2) ERR-INVALID-OPTION)
    
    ;; Create the poll
    (map-set polls poll-id {
      creator: caller,
      question: question,
      options: options,
      start-block: start-block,
      end-block: end-block,
      votes-cast: u0,
      is-active: true
    })
    
    ;; Initialize vote counts for all options
    (map initialize-vote-counts poll-id (enumerate-options options))
    
    ;; Increment poll count
    (var-set poll-count (+ poll-id u1))
    
    (ok poll-id)
  )
)

;; Helper function to initialize vote counts
(define-private (initialize-vote-counts (poll-id uint) (option-indices (list 5 uint)))
  (map set-initial-count option-indices)
)

(define-private (set-initial-count (option-index uint))
  (map-set vote-counts {poll-id: (var-get poll-count), option-index: option-index} u0)
)

(define-private (enumerate-options (options (list 5 (string-ascii 64))))
  (list u0 u1 u2 u3 u4)
)

;; Vote on a poll option
(define-public (vote (poll-id uint) (option-index uint))
  (let ((caller tx-sender)
        (poll-data (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND)))
    
    ;; Check if poll is active
    (asserts! (get is-active poll-data) ERR-POLL-NOT-FOUND)
    
    ;; Check voting window
    (asserts! (>= block-height (get start-block poll-data)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-data)) ERR-VOTING-ENDED)
    
    ;; Check if caller is a token holder
    (asserts! (is-token-holder caller) ERR-NOT-AUTHORIZED)
    
    ;; Check if option index is valid
    (asserts! (< option-index (len (get options poll-data))) ERR-INVALID-OPTION)
    
    ;; Check if voter has already voted
    (asserts! (is-none (map-get? votes {poll-id: poll-id, voter: caller})) ERR-ALREADY-VOTED)
    
    ;; Record the vote
    (map-set votes {poll-id: poll-id, voter: caller} option-index)
    
    ;; Increment vote count for the chosen option
    (let ((current-count (get-vote-count poll-id option-index)))
      (map-set vote-counts {poll-id: poll-id, option-index: option-index} (+ current-count u1))
    )
    
    ;; Update total votes cast for the poll
    (map-set polls poll-id 
      (merge poll-data {votes-cast: (+ (get votes-cast poll-data) u1)})
    )
    
    (ok true)
  )
)

;; Close a poll (only creator can close)
(define-public (close-poll (poll-id uint))
  (let ((caller tx-sender)
        (poll-data (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND)))
    
    ;; Check if caller is the creator
    (asserts! (is-eq caller (get creator poll-data)) ERR-NOT-AUTHORIZED)
    
    ;; Update poll to inactive
    (map-set polls poll-id (merge poll-data {is-active: false}))
    
    (ok true)
  )
)

;; Read-only functions

;; Get poll information
(define-read-only (get-poll (poll-id uint))
  (map-get? polls poll-id)
)

;; Get user's vote for a specific poll
(define-read-only (get-user-vote (poll-id uint) (voter principal))
  (map-get? votes {poll-id: poll-id, voter: voter})
)

;; Get all vote counts for a poll
(define-read-only (get-poll-results (poll-id uint))
  (let ((poll-data (unwrap! (map-get? polls poll-id) (err u404))))
    (ok {
      poll-id: poll-id,
      question: (get question poll-data),
      options: (get options poll-data),
      total-votes: (get votes-cast poll-data),
      results: (list 
        (get-vote-count poll-id u0)
        (get-vote-count poll-id u1)
        (get-vote-count poll-id u2)
        (get-vote-count poll-id u3)
        (get-vote-count poll-id u4)
      )
    })
  )
)

;; Check if a poll is currently active for voting
(define-read-only (is-poll-active (poll-id uint))
  (match (map-get? polls poll-id)
    poll-data 
    (and 
      (get is-active poll-data)
      (>= block-height (get start-block poll-data))
      (<= block-height (get end-block poll-data))
    )
    false
  )
)

;; ============================================================================
;; ADVANCED FEATURES - Making TokenVote Stand Out
;; ============================================================================

;; Quadratic Voting System
(define-map quadratic-votes
  { poll-id: uint, voter: principal }
  { option: uint, tokens-spent: uint, vote-power: uint }
)

(define-map poll-token-pools
  uint ;; poll-id
  uint ;; total tokens collected
)

;; Square root approximation function
(define-private (sqrt-approx (n uint))
  (if (<= n u1)
    n
    (let ((x (/ n u2)))
      (let ((improved (/ (+ x (/ n x)) u2)))
        (if (< (abs-diff improved x) u2)
          improved
          (sqrt-approx-iter improved n u5)
        )
      )
    )
  )
)

(define-private (sqrt-approx-iter (x uint) (n uint) (iterations uint))
  (if (is-eq iterations u0)
    x
    (let ((improved (/ (+ x (/ n x)) u2)))
      (sqrt-approx-iter improved n (- iterations u1))
    )
  )
)

(define-private (abs-diff (a uint) (b uint))
  (if (> a b) (- a b) (- b a))
)

;; Quadratic voting function
(define-public (quadratic-vote (poll-id uint) (option-index uint) (tokens-to-spend uint))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (vote-power (sqrt-approx tokens-to-spend))
    (current-pool (default-to u0 (map-get? poll-token-pools poll-id)))
  )
    ;; Validate poll is active and voting period
    (asserts! (get is-active poll-info) ERR-NOT-AUTHORIZED)
    (asserts! (>= block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-info)) ERR-VOTING-ENDED)
    (asserts! (< option-index (len (get options poll-info))) ERR-INVALID-OPTION)
    (asserts! (> tokens-to-spend u0) ERR-NOT-AUTHORIZED)
    
    ;; Check if user already voted quadratically
    (asserts! (is-none (map-get? quadratic-votes { poll-id: poll-id, voter: sender })) ERR-ALREADY-VOTED)
    
    ;; Record quadratic vote
    (map-set quadratic-votes 
      { poll-id: poll-id, voter: sender }
      { option: option-index, tokens-spent: tokens-to-spend, vote-power: vote-power }
    )
    
    ;; Add to token pool
    (map-set poll-token-pools poll-id (+ current-pool tokens-to-spend))
    
    (ok vote-power)
  )
)

;; Delegation System
(define-map vote-delegations
  principal ;; delegator
  principal ;; delegate
)

(define-map delegation-power
  principal ;; delegate
  uint ;; total delegated power
)

(define-public (delegate-voting-power (delegate principal))
  (let (
    (current-delegate (map-get? vote-delegations tx-sender))
    (delegate-power (default-to u0 (map-get? delegation-power delegate)))
  )
    ;; Remove old delegation if exists
    (match current-delegate
      old-delegate 
      (map-set delegation-power old-delegate 
        (- (default-to u0 (map-get? delegation-power old-delegate)) u1))
      true
    )
    
    ;; Set new delegation
    (map-set vote-delegations tx-sender delegate)
    (map-set delegation-power delegate (+ delegate-power u1))
    
    (ok true)
  )
)

(define-public (revoke-delegation)
  (match (map-get? vote-delegations tx-sender)
    delegate 
    (begin
      (map-delete vote-delegations tx-sender)
      (map-set delegation-power delegate 
        (- (default-to u0 (map-get? delegation-power delegate)) u1))
      (ok true)
    )
    (err ERR-NOT-AUTHORIZED)
  )
)

;; Reputation System
(define-map user-reputation
  principal
  { votes-cast: uint, polls-created: uint, accuracy-score: uint, reputation-points: uint }
)

(define-private (update-reputation (user principal) (action (string-ascii 10)))
  (let (
    (current-rep (default-to 
      { votes-cast: u0, polls-created: u0, accuracy-score: u100, reputation-points: u0 }
      (map-get? user-reputation user)
    ))
  )
    (if (is-eq action "vote")
      (map-set user-reputation user
        (merge current-rep { 
          votes-cast: (+ (get votes-cast current-rep) u1),
          reputation-points: (+ (get reputation-points current-rep) u1)
        })
      )
      (if (is-eq action "create")
        (map-set user-reputation user
          (merge current-rep { 
            polls-created: (+ (get polls-created current-rep) u1),
            reputation-points: (+ (get reputation-points current-rep) u5)
          })
        )
        false
      )
    )
  )
)

(define-read-only (get-user-reputation (user principal))
  (default-to 
    { votes-cast: u0, polls-created: u0, accuracy-score: u100, reputation-points: u0 }
    (map-get? user-reputation user)
  )
)

;; Poll Categories and Tags
(define-map poll-metadata
  uint ;; poll-id
  {
    category: (string-ascii 20),
    tags: (list 5 (string-ascii 15)),
    funding-goal: uint,
    current-funding: uint
  }
)

(define-public (set-poll-metadata 
  (poll-id uint) 
  (category (string-ascii 20))
  (tags (list 5 (string-ascii 15)))
  (funding-goal uint)
)
  (let (
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
  )
    ;; Only creator can set metadata
    (asserts! (is-eq tx-sender (get creator poll-info)) ERR-NOT-AUTHORIZED)
    
    (map-set poll-metadata poll-id {
      category: category,
      tags: tags,
      funding-goal: funding-goal,
      current-funding: u0
    })
    
    (ok true)
  )
)

;; Poll Funding System
(define-public (fund-poll (poll-id uint) (amount uint))
  (let (
    (poll-exists (is-some (map-get? polls poll-id)))
    (current-metadata (default-to 
      { category: "", tags: (list), funding-goal: u0, current-funding: u0 }
      (map-get? poll-metadata poll-id)
    ))
  )
    (asserts! poll-exists ERR-POLL-NOT-FOUND)
    (asserts! (> amount u0) ERR-NOT-AUTHORIZED)
    
    ;; Transfer STX to contract
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    
    ;; Update funding
    (map-set poll-metadata poll-id
      (merge current-metadata {
        current-funding: (+ (get current-funding current-metadata) amount)
      })
    )
    
    (ok true)
  )
)

;; Time-weighted voting
(define-private (calculate-time-weight (poll-id uint))
  (let (
    (poll-info (unwrap! (map-get? polls poll-id) (err u0)))
    (start-block (get start-block poll-info))
    (end-block (get end-block poll-info))
    (current-block block-height)
    (total-duration (- end-block start-block))
    (elapsed-time (- current-block start-block))
  )
    (if (and (>= current-block start-block) (<= current-block end-block))
      (ok (+ u50 (/ (* (- total-duration elapsed-time) u50) total-duration)))
      (err u0)
    )
  )
)

;; Enhanced voting with time weights and reputation
(define-public (enhanced-vote (poll-id uint) (option-index uint))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (user-rep (get-user-reputation sender))
    (time-weight (unwrap! (calculate-time-weight poll-id) ERR-VOTING-ENDED))
    (base-power u1)
    (rep-bonus (/ (get reputation-points user-rep) u10))
    (delegation-bonus (default-to u0 (map-get? delegation-power sender)))
    (total-power (+ base-power rep-bonus delegation-bonus))
    (weighted-power (/ (* total-power time-weight) u100))
  )
    ;; Standard voting validations
    (asserts! (get is-active poll-info) ERR-NOT-AUTHORIZED)
    (asserts! (>= block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-info)) ERR-VOTING-ENDED)
    (asserts! (< option-index (len (get options poll-info))) ERR-INVALID-OPTION)
    (asserts! (is-none (map-get? votes { poll-id: poll-id, voter: sender })) ERR-ALREADY-VOTED)
    
    ;; Record enhanced vote
    (map-set votes { poll-id: poll-id, voter: sender } option-index)
    
    ;; Update reputation
    (update-reputation sender "vote")
    
    (ok weighted-power)
  )
)

;; Get enhanced poll results including quadratic votes
(define-read-only (get-enhanced-poll-results (poll-id uint))
  (match (map-get? polls poll-id)
    poll-data
    (let (
      (options-count (len (get options poll-data)))
      (regular-results (unwrap! (get-poll-results poll-id) (err ERR-POLL-NOT-FOUND)))
    )
      (ok {
        regular-results: regular-results,
        total-funding: (default-to u0 (map-get? poll-token-pools poll-id)),
        metadata: (map-get? poll-metadata poll-id)
      })
    )
    (err ERR-POLL-NOT-FOUND)
  )
)

;; Read-only functions for frontend
(define-read-only (get-poll-metadata (poll-id uint))
  (map-get? poll-metadata poll-id)
)

(define-read-only (get-user-delegation (user principal))
  (map-get? vote-delegations user)
)

(define-read-only (get-delegation-power (delegate principal))
  (default-to u0 (map-get? delegation-power delegate))
)

(define-read-only (get-quadratic-vote (poll-id uint) (voter principal))
  (map-get? quadratic-votes { poll-id: poll-id, voter: voter })
)
