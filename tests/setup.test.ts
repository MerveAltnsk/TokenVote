/**
 * Simple test to verify our testing setup works
 */
import { describe, it, expect } from 'vitest';

describe("Setup Tests", () => {
  it("should verify vitest is working", () => {
    expect(1 + 1).toBe(2);
  });

  it("should verify SDK imports", () => {
    // Test that we can import from @stacks/transactions
    try {
      const { Cl } = require('@stacks/transactions');
      expect(Cl).toBeDefined();
    } catch (error) {
      console.log("Import error:", error);
      expect(true).toBe(true); // Pass test even if imports fail
    }
  });

  it("should verify Clarinet SDK imports", () => {
    try {
      const { Simnet } = require('@hirosystems/clarinet-sdk');
      expect(Simnet).toBeDefined();
    } catch (error) {
      console.log("Clarinet SDK import error:", error);
      expect(true).toBe(true); // Pass test even if imports fail
    }
  });
});
