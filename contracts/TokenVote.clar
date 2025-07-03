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

;; ============================================================================
;; ADVANCED GOVERNANCE FEATURES
;; ============================================================================

;; Veto Power System
(define-map veto-powers
  principal ;; user with veto power
  { granted-by: principal, expires-at: uint, active: bool }
)

(define-map vetoed-proposals
  uint ;; poll-id
  { vetoed-by: principal, reason: (string-ascii 256), vetoed-at: uint }
)

(define-public (grant-veto-power (user principal) (duration uint))
  (let (
    (sender tx-sender)
    (expires-at (+ block-height duration))
  )
    ;; Only highly reputable users can grant veto power
    (asserts! (>= (get reputation-points (get-user-reputation sender)) u100) ERR-NOT-AUTHORIZED)
    
    (map-set veto-powers user {
      granted-by: sender,
      expires-at: expires-at,
      active: true
    })
    
    (ok true)
  )
)

(define-public (veto-proposal (poll-id uint) (reason (string-ascii 256)))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (veto-power (unwrap! (map-get? veto-powers sender) ERR-NOT-AUTHORIZED))
  )
    ;; Check veto power is active and not expired
    (asserts! (get active veto-power) ERR-NOT-AUTHORIZED)
    (asserts! (> (get expires-at veto-power) block-height) ERR-NOT-AUTHORIZED)
    
    ;; Check poll is still active
    (asserts! (get is-active poll-info) ERR-VOTING-ENDED)
    
    ;; Record veto
    (map-set vetoed-proposals poll-id {
      vetoed-by: sender,
      reason: reason,
      vetoed-at: block-height
    })
    
    ;; Deactivate the poll
    (map-set polls poll-id (merge poll-info { is-active: false }))
    
    (ok true)
  )
)

;; Proposal Amendments
(define-map proposal-amendments
  uint ;; poll-id
  {
    amendments: (list 10 (string-ascii 512)),
    amendment-count: uint,
    last-amended: uint
  }
)

(define-public (amend-proposal (poll-id uint) (amendment (string-ascii 512)))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (current-amendments (default-to 
      { amendments: (list), amendment-count: u0, last-amended: u0 }
      (map-get? proposal-amendments poll-id)
    ))
  )
    ;; Only creator can amend before voting starts
    (asserts! (is-eq sender (get creator poll-info)) ERR-NOT-AUTHORIZED)
    (asserts! (< block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    
    ;; Add amendment
    (let (
      (new-amendments (unwrap! (as-max-len? 
        (append (get amendments current-amendments) amendment) u10) ERR-NOT-AUTHORIZED))
    )
      (map-set proposal-amendments poll-id {
        amendments: new-amendments,
        amendment-count: (+ (get amendment-count current-amendments) u1),
        last-amended: block-height
      })
      
      (ok true)
    )
  )
)

;; Range/Score Voting System
(define-map score-votes
  { poll-id: uint, voter: principal }
  { scores: (list 10 uint), total-score: uint }
)

(define-map score-tallies
  { poll-id: uint, option-index: uint }
  { total-score: uint, vote-count: uint }
)

(define-public (score-vote (poll-id uint) (scores (list 10 uint)))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (total-score (fold + scores u0))
  )
    ;; Validate poll and timing
    (asserts! (get is-active poll-info) ERR-NOT-AUTHORIZED)
    (asserts! (>= block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-info)) ERR-VOTING-ENDED)
    
    ;; Check if already voted
    (asserts! (is-none (map-get? score-votes { poll-id: poll-id, voter: sender })) ERR-ALREADY-VOTED)
    
    ;; Validate scores (0-100 range)
    (asserts! (validate-score-range scores) ERR-INVALID-OPTION)
    
    ;; Record score vote
    (map-set score-votes { poll-id: poll-id, voter: sender } {
      scores: scores,
      total-score: total-score
    })
    
    ;; Update tallies
    (update-score-tallies poll-id scores)
    
    (ok true)
  )
)

(define-private (validate-score-range (scores (list 10 uint)))
  (fold validate-single-score scores true)
)

(define-private (validate-single-score (score uint) (acc bool))
  (and acc (<= score u100))
)

(define-private (update-score-tallies (poll-id uint) (scores (list 10 uint)))
  (let (
    (indices (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9))
  )
    (map update-single-tally 
      (zip indices scores)
      (make-list u10 poll-id)
    )
  )
)

(define-private (update-single-tally (index-score { index: uint, score: uint }) (poll-id uint))
  (let (
    (option-index (get index index-score))
    (score (get score index-score))
    (current-tally (default-to { total-score: u0, vote-count: u0 }
      (map-get? score-tallies { poll-id: poll-id, option-index: option-index })))
  )
    (map-set score-tallies { poll-id: poll-id, option-index: option-index } {
      total-score: (+ (get total-score current-tally) score),
      vote-count: (+ (get vote-count current-tally) u1)
    })
  )
)

(define-private (zip (list-a (list 10 uint)) (list-b (list 10 uint)))
  (map make-pair list-a list-b)
)

(define-private (make-pair (a uint) (b uint))
  { index: a, score: b }
)

(define-private (make-list (n uint) (item uint))
  (list item item item item item item item item item item)
)

;; Ranked Choice Voting System
(define-map ranked-votes
  { poll-id: uint, voter: principal }
  { rankings: (list 10 uint), valid: bool }
)

(define-map ranked-tallies
  { poll-id: uint, round: uint }
  { 
    option-counts: (list 10 uint),
    eliminated: (list 10 bool),
    total-votes: uint
  }
)

(define-public (ranked-vote (poll-id uint) (rankings (list 10 uint)))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
  )
    ;; Validate poll and timing
    (asserts! (get is-active poll-info) ERR-NOT-AUTHORIZED)
    (asserts! (>= block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-info)) ERR-VOTING-ENDED)
    
    ;; Check if already voted
    (asserts! (is-none (map-get? ranked-votes { poll-id: poll-id, voter: sender })) ERR-ALREADY-VOTED)
    
    ;; Validate rankings
    (asserts! (validate-rankings rankings (len (get options poll-info))) ERR-INVALID-OPTION)
    
    ;; Record ranked vote
    (map-set ranked-votes { poll-id: poll-id, voter: sender } {
      rankings: rankings,
      valid: true
    })
    
    (ok true)
  )
)

(define-private (validate-rankings (rankings (list 10 uint)) (option-count uint))
  ;; Check that rankings are valid (1 to option-count, no duplicates)
  (and 
    (>= (len rankings) option-count)
    (validate-ranking-range rankings option-count)
  )
)

(define-private (validate-ranking-range (rankings (list 10 uint)) (option-count uint))
  (fold validate-single-ranking rankings true)
)

(define-private (validate-single-ranking (ranking uint) (acc bool))
  (and acc (or (is-eq ranking u0) (<= ranking u10)))
)

;; Staking for Voting System
(define-map voting-stakes
  { poll-id: uint, voter: principal }
  { 
    stake-amount: uint,
    predicted-outcome: uint,
    withdrawn: bool,
    reward-claimed: bool
  }
)

(define-map stake-pools
  uint ;; poll-id
  { 
    total-staked: uint,
    outcome-stakes: (list 10 uint),
    reward-pool: uint
  }
)

(define-public (stake-and-vote (poll-id uint) (stake-amount uint) (predicted-outcome uint))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
    (current-pool (default-to 
      { total-staked: u0, outcome-stakes: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0), reward-pool: u0 }
      (map-get? stake-pools poll-id)
    ))
  )
    ;; Validate poll and timing
    (asserts! (get is-active poll-info) ERR-NOT-AUTHORIZED)
    (asserts! (>= block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-info)) ERR-VOTING-ENDED)
    
    ;; Validate stake amount and outcome
    (asserts! (> stake-amount u0) ERR-NOT-AUTHORIZED)
    (asserts! (< predicted-outcome (len (get options poll-info))) ERR-INVALID-OPTION)
    
    ;; Check if already staked
    (asserts! (is-none (map-get? voting-stakes { poll-id: poll-id, voter: sender })) ERR-ALREADY-VOTED)
    
    ;; Transfer stake to contract
    (try! (stx-transfer? stake-amount sender (as-contract tx-sender)))
    
    ;; Record stake
    (map-set voting-stakes { poll-id: poll-id, voter: sender } {
      stake-amount: stake-amount,
      predicted-outcome: predicted-outcome,
      withdrawn: false,
      reward-claimed: false
    })
    
    ;; Update stake pool
    (map-set stake-pools poll-id {
      total-staked: (+ (get total-staked current-pool) stake-amount),
      outcome-stakes: (update-outcome-stakes (get outcome-stakes current-pool) predicted-outcome stake-amount),
      reward-pool: (+ (get reward-pool current-pool) (/ stake-amount u10))
    })
    
    (ok true)
  )
)

(define-private (update-outcome-stakes (stakes (list 10 uint)) (outcome uint) (amount uint))
  (map update-stake-at-index stakes (enumerate-list u10) outcome amount)
)

(define-private (update-stake-at-index (current-stake uint) (index uint) (target-outcome uint) (amount uint))
  (if (is-eq index target-outcome)
    (+ current-stake amount)
    current-stake
  )
)

(define-private (enumerate-list (n uint))
  (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9)
)

;; Prediction Markets System
(define-map prediction-markets
  uint ;; poll-id
  {
    market-active: bool,
    outcome-odds: (list 10 uint),
    total-bets: uint,
    outcome-pools: (list 10 uint)
  }
)

(define-map prediction-bets
  { poll-id: uint, bettor: principal }
  {
    outcome: uint,
    bet-amount: uint,
    odds-at-bet: uint,
    settled: bool
  }
)

(define-public (create-prediction-market (poll-id uint) (initial-odds (list 10 uint)))
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
  )
    ;; Only poll creator can create prediction market
    (asserts! (is-eq sender (get creator poll-info)) ERR-NOT-AUTHORIZED)
    
    ;; Validate odds sum to 100
    (asserts! (is-eq (fold + initial-odds u0) u100) ERR-INVALID-OPTION)
    
    (map-set prediction-markets poll-id {
      market-active: true,
      outcome-odds: initial-odds,
      total-bets: u0,
      outcome-pools: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0)
    })
    
    (ok true)
  )
)

(define-public (place-prediction-bet (poll-id uint) (outcome uint) (bet-amount uint))
  (let (
    (sender tx-sender)
    (market (unwrap! (map-get? prediction-markets poll-id) ERR-POLL-NOT-FOUND))
    (current-odds (unwrap! (element-at (get outcome-odds market) outcome) ERR-INVALID-OPTION))
  )
    ;; Validate market is active
    (asserts! (get market-active market) ERR-NOT-AUTHORIZED)
    (asserts! (> bet-amount u0) ERR-NOT-AUTHORIZED)
    
    ;; Check if already bet
    (asserts! (is-none (map-get? prediction-bets { poll-id: poll-id, bettor: sender })) ERR-ALREADY-VOTED)
    
    ;; Transfer bet to contract
    (try! (stx-transfer? bet-amount sender (as-contract tx-sender)))
    
    ;; Record bet
    (map-set prediction-bets { poll-id: poll-id, bettor: sender } {
      outcome: outcome,
      bet-amount: bet-amount,
      odds-at-bet: current-odds,
      settled: false
    })
    
    ;; Update market
    (map-set prediction-markets poll-id {
      market-active: (get market-active market),
      outcome-odds: (get outcome-odds market),
      total-bets: (+ (get total-bets market) bet-amount),
      outcome-pools: (update-outcome-pools (get outcome-pools market) outcome bet-amount)
    })
    
    (ok true)
  )
)

(define-private (update-outcome-pools (pools (list 10 uint)) (outcome uint) (amount uint))
  (map update-pool-at-index pools (enumerate-list u10) outcome amount)
)

(define-private (update-pool-at-index (current-pool uint) (index uint) (target-outcome uint) (amount uint))
  (if (is-eq index target-outcome)
    (+ current-pool amount)
    current-pool
  )
)

;; Futarchy Implementation
(define-map futarchy-proposals
  uint ;; poll-id
  {
    value-question: (string-ascii 256),
    belief-question: (string-ascii 256),
    value-votes: (list 10 uint),
    belief-bets: (list 10 uint),
    implementation-threshold: uint,
    active: bool
  }
)

(define-map futarchy-participants
  { poll-id: uint, participant: principal }
  {
    value-vote: uint,
    belief-bet: uint,
    belief-outcome: uint,
    settled: bool
  }
)

(define-public (create-futarchy-proposal 
  (poll-id uint) 
  (value-question (string-ascii 256))
  (belief-question (string-ascii 256))
  (implementation-threshold uint)
)
  (let (
    (sender tx-sender)
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
  )
    ;; Only poll creator can create futarchy proposal
    (asserts! (is-eq sender (get creator poll-info)) ERR-NOT-AUTHORIZED)
    
    (map-set futarchy-proposals poll-id {
      value-question: value-question,
      belief-question: belief-question,
      value-votes: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0),
      belief-bets: (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0),
      implementation-threshold: implementation-threshold,
      active: true
    })
    
    (ok true)
  )
)

(define-public (futarchy-participate (poll-id uint) (value-vote uint) (belief-bet uint) (belief-outcome uint))
  (let (
    (sender tx-sender)
    (proposal (unwrap! (map-get? futarchy-proposals poll-id) ERR-POLL-NOT-FOUND))
    (poll-info (unwrap! (map-get? polls poll-id) ERR-POLL-NOT-FOUND))
  )
    ;; Validate proposal is active and timing
    (asserts! (get active proposal) ERR-NOT-AUTHORIZED)
    (asserts! (>= block-height (get start-block poll-info)) ERR-VOTING-NOT-STARTED)
    (asserts! (<= block-height (get end-block poll-info)) ERR-VOTING-ENDED)
    
    ;; Validate inputs
    (asserts! (> belief-bet u0) ERR-NOT-AUTHORIZED)
    (asserts! (< value-vote u10) ERR-INVALID-OPTION)
    (asserts! (< belief-outcome u10) ERR-INVALID-OPTION)
    
    ;; Check if already participated
    (asserts! (is-none (map-get? futarchy-participants { poll-id: poll-id, participant: sender })) ERR-ALREADY-VOTED)
    
    ;; Transfer bet to contract
    (try! (stx-transfer? belief-bet sender (as-contract tx-sender)))
    
    ;; Record participation
    (map-set futarchy-participants { poll-id: poll-id, participant: sender } {
      value-vote: value-vote,
      belief-bet: belief-bet,
      belief-outcome: belief-outcome,
      settled: false
    })
    
    ;; Update proposal tallies
    (map-set futarchy-proposals poll-id {
      value-question: (get value-question proposal),
      belief-question: (get belief-question proposal),
      value-votes: (update-list-at-index (get value-votes proposal) value-vote u1),
      belief-bets: (update-list-at-index (get belief-bets proposal) belief-outcome belief-bet),
      implementation-threshold: (get implementation-threshold proposal),
      active: (get active proposal)
    })
    
    (ok true)
  )
)

(define-private (update-list-at-index (lst (list 10 uint)) (index uint) (value uint))
  (map update-element-at-index lst (enumerate-list u10) index value)
)

(define-private (update-element-at-index (element uint) (current-index uint) (target-index uint) (value uint))
  (if (is-eq current-index target-index)
    (+ element value)
    element
  )
)

;; Read-only functions for new features
(define-read-only (get-proposal-amendments (poll-id uint))
  (map-get? proposal-amendments poll-id)
)

(define-read-only (get-veto-status (poll-id uint))
  (map-get? vetoed-proposals poll-id)
)

(define-read-only (get-score-results (poll-id uint))
  (let (
    (indices (list u0 u1 u2 u3 u4 u5 u6 u7 u8 u9))
  )
    (map get-score-tally indices (make-list u10 poll-id))
  )
)

(define-private (get-score-tally (index uint) (poll-id uint))
  (default-to { total-score: u0, vote-count: u0 }
    (map-get? score-tallies { poll-id: poll-id, option-index: index }))
)

(define-read-only (get-staking-info (poll-id uint))
  (map-get? stake-pools poll-id)
)

(define-read-only (get-prediction-market (poll-id uint))
  (map-get? prediction-markets poll-id)
)

(define-read-only (get-futarchy-proposal (poll-id uint))
  (map-get? futarchy-proposals poll-id)
)

(define-read-only (get-user-stake (poll-id uint) (user principal))
  (map-get? voting-stakes { poll-id: poll-id, voter: user })
)

(define-read-only (get-user-prediction-bet (poll-id uint) (user principal))
  (map-get? prediction-bets { poll-id: poll-id, bettor: user })
)

(define-read-only (get-user-futarchy-participation (poll-id uint) (user principal))
  (map-get? futarchy-participants { poll-id: poll-id, participant: user })
)

;; Helper function to get element at index
(define-private (element-at (lst (list 10 uint)) (index uint))
  (if (is-eq index u0) (some (unwrap! (get 0 lst) none))
    (if (is-eq index u1) (some (unwrap! (get 1 lst) none))
      (if (is-eq index u2) (some (unwrap! (get 2 lst) none))
        (if (is-eq index u3) (some (unwrap! (get 3 lst) none))
          (if (is-eq index u4) (some (unwrap! (get 4 lst) none))
            (if (is-eq index u5) (some (unwrap! (get 5 lst) none))
              (if (is-eq index u6) (some (unwrap! (get 6 lst) none))
                (if (is-eq index u7) (some (unwrap! (get 7 lst) none))
                  (if (is-eq index u8) (some (unwrap! (get 8 lst) none))
                    (if (is-eq index u9) (some (unwrap! (get 9 lst) none))
                      none
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
)
