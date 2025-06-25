import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test poll creation by token holder",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create a poll
    let block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'create-poll', [
        types.ascii("What is the best programming language?"),
        types.list([
          types.ascii("Clarity"),
          types.ascii("TypeScript"),
          types.ascii("Python")
        ]),
        types.uint(chain.blockHeight + 10), // start in 10 blocks
        types.uint(chain.blockHeight + 100) // end in 100 blocks
      ], wallet1.address)
    ]);
    
    // Should succeed if wallet1 is a token holder
    block.receipts[0].result.expectOk().expectUint(0);
    
    // Check poll was created
    let pollResult = chain.callReadOnlyFn('tokenvote', 'get-poll', [types.uint(0)], wallet1.address);
    let poll = pollResult.result.expectSome().expectTuple();
    
    assertEquals(poll['creator'], wallet1.address);
    assertEquals(poll['question'], "What is the best programming language?");
  },
});

Clarinet.test({
  name: "Test voting on a poll",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create a poll that starts immediately
    let block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'create-poll', [
        types.ascii("Test poll"),
        types.list([
          types.ascii("Option A"),
          types.ascii("Option B")
        ]),
        types.uint(chain.blockHeight + 1),
        types.uint(chain.blockHeight + 50)
      ], wallet1.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Mine a block to reach start time
    chain.mineEmptyBlock(2);
    
    // Vote on the poll
    block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'vote', [
        types.uint(0), // poll id
        types.uint(0)  // option index
      ], wallet2.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Check vote was recorded
    let voteResult = chain.callReadOnlyFn('tokenvote', 'get-user-vote', [
      types.uint(0),
      types.principal(wallet2.address)
    ], wallet2.address);
    
    voteResult.result.expectSome().expectUint(0);
  },
});

Clarinet.test({
  name: "Test preventing double voting",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Create and start a poll
    let block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'create-poll', [
        types.ascii("Test poll"),
        types.list([
          types.ascii("Option A"),
          types.ascii("Option B")
        ]),
        types.uint(chain.blockHeight + 1),
        types.uint(chain.blockHeight + 50)
      ], wallet1.address)
    ]);
    
    chain.mineEmptyBlock(2);
    
    // First vote should succeed
    block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'vote', [
        types.uint(0),
        types.uint(0)
      ], wallet2.address)
    ]);
    
    block.receipts[0].result.expectOk();
    
    // Second vote should fail
    block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'vote', [
        types.uint(0),
        types.uint(1)
      ], wallet2.address)
    ]);
    
    block.receipts[0].result.expectErr().expectUint(406); // ERR-ALREADY-VOTED
  },
});

Clarinet.test({
  name: "Test poll results",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    const wallet3 = accounts.get('wallet_3')!;
    
    // Create a poll
    let block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'create-poll', [
        types.ascii("Test poll"),
        types.list([
          types.ascii("Option A"),
          types.ascii("Option B"),
          types.ascii("Option C")
        ]),
        types.uint(chain.blockHeight + 1),
        types.uint(chain.blockHeight + 50)
      ], wallet1.address)
    ]);
    
    chain.mineEmptyBlock(2);
    
    // Cast votes
    block = chain.mineBlock([
      Tx.contractCall('tokenvote', 'vote', [types.uint(0), types.uint(0)], wallet1.address),
      Tx.contractCall('tokenvote', 'vote', [types.uint(0), types.uint(0)], wallet2.address),
      Tx.contractCall('tokenvote', 'vote', [types.uint(0), types.uint(1)], wallet3.address)
    ]);
    
    // Check results
    let resultsResult = chain.callReadOnlyFn('tokenvote', 'get-poll-results', [
      types.uint(0)
    ], wallet1.address);
    
    let results = resultsResult.result.expectOk().expectTuple();
    assertEquals(results['total-votes'], types.uint(3));
    
    let voteCounts = results['results'].expectList();
    assertEquals(voteCounts[0], types.uint(2)); // Option A: 2 votes
    assertEquals(voteCounts[1], types.uint(1)); // Option B: 1 vote
    assertEquals(voteCounts[2], types.uint(0)); // Option C: 0 votes
  },
});
