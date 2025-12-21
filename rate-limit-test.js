const API_URL = "http://localhost:3000/api/v1/auth/login"; // Endpoint dengan limit ketat (20 req)

async function testRateLimit() {
  console.log("🚀 Starting Rate Limit Test...");

  for (let i = 1; i <= 25; i++) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123"
        })
      });

      const status = response.status;
      const rateLimitRemaining = response.headers.get("ratelimit-remaining");

      if (status === 429) {
        console.log(`❌ Request ${i}: [429] Too Many Requests (Rate limit hit!)`);
      } else {
        console.log(`✅ Request ${i}: [${status}] OK (Remaining: ${rateLimitRemaining})`);
      }
    } catch (error) {
      console.error(`💥 Request ${i}: Failed to connect. Is the server running?`, error);
      break;
    }
  }

  console.log("\n🏁 Test Finished.");
}

testRateLimit();