;; Simple Governance Token for Testing TokenVote
;; This is a basic fungible token implementation for demonstration purposes

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-fungible-token governance-token)

(define-data-var token-name (string-ascii 32) "Governance Token")
(define-data-var token-symbol (string-ascii 10) "GOV")
(define-data-var token-uri (optional (string-utf8 256)) none)

;; SIP-010 functions

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (ft-transfer? governance-token amount sender recipient)
  )
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance governance-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply governance-token))
)

(define-read-only (get-token-uri)
  (ok (var-get token-uri))
)

;; Admin functions

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? governance-token amount recipient)
  )
)

;; Initialize some tokens for testing
(ft-mint? governance-token u1000000 contract-owner)
(ft-mint? governance-token u100000 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
(ft-mint? governance-token u100000 'ST2CY5V39NHDPWSXLSN6XREA7RCAPH0KTHQGX3HNCW)
(ft-mint? governance-token u100000 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC)
