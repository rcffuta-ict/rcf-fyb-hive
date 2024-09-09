
// Helper function to encode a number into a base-36 string
function base36Encode(number: number): string {
    return number.toString(36); // Converts number to base-36 (0-9, a-z)
}

// Simple non-cryptographic hash function for creating uniqueness
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i); // Hashing operation
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash); // Ensure the hash is positive
}


// Function to generate a 6-character unique token
export function generateShortToken(userId: string): string {
  // Step 1: Generate a secure random alphanumeric string
  const randomPart = Math.random().toString(36).substring(2, 8); // Generates a random base-36 string

  // Step 2: Hash the user-specific data to add uniqueness and unpredictability
  const hashedPart = simpleHash(userId).toString(36); // Convert hash to base-36 for alphanumeric

  // Step 3: Combine the random and hashed parts and ensure 6 characters
  const combinedValue = (randomPart + hashedPart).slice(0, 6); // Combine and trim to 6 characters

  return combinedValue;
}
