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
