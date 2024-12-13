// class LLMResponseParser {
//   static parseResponse(llmResponse: string): any {
//     const parsed = extractJsonFromString(llmResponse);
//     if (parsed === null) {
//       throw new Error("Failed to extract valid JSON from LLM response");
//     }
//     return parsed;
//   }
// }
// function extractJsonFromString(input: string): any {
//   try {
//     // Regular expression to match JSON objects or arrays
//     const jsonRegex =
//       /(\[|\{)(?:[^{}\[\]]|\{(?:[^{}\[\]]|\{[^{}\[\]]*\})*\}|\[(?:[^{}\[\]]|\[.*?\])*\])*(\]|\})/g;

//     // Find all matches
//     const matches = input.match(jsonRegex);

//     if (matches && matches.length > 0) {
//       // Try to parse each match
//       for (const match of matches) {
//         try {
//           const parsed = JSON.parse(match);
//           // If parsing succeeds, return the result
//           return parsed;
//         } catch (parseError) {
//           // If parsing fails, continue to the next match
//           console.warn("Failed to parse a potential JSON match:", parseError);
//         }
//       }
//       // If all parses fail, throw an error
//       throw new Error("Found potential JSON structures, but none were valid");
//     } else {
//       throw new Error(
//         "No valid JSON object or array found in the input string"
//       );
//     }
//   } catch (error) {
//     console.error("Error extracting JSON:", error);
//     return null;
//   }
// }

// // Test function
// function testExtractJsonFromString() {
//   const testCases = [
//     // Single object
//     `{"isJobRelated":false,"jobData":{"jobId":"","position":"","company":"","status":"","nextStep":"","applicationDate":"","keyDetails":[]}}`,

//     // Array of objects
//     `[{"isJobRelated":true,"jobData":{"jobId":"123","position":"Software Engineer","company":"TechCorp","status":"Applied","nextStep":"Wait for response","applicationDate":"2023-08-15","keyDetails":["Remote position","Requires 3+ years experience"]}},
//       {"isJobRelated":false,"jobData":{"jobId":"","position":"","company":"","status":"","nextStep":"","applicationDate":"","keyDetails":[]}}]`,

//     // Object embedded in text
//     `The LLM analyzed the email and produced the following result: {"isJobRelated":true,"jobData":{"jobId":"456","position":"Data Scientist","company":"DataCo","status":"Interview Scheduled","nextStep":"Prepare for interview","applicationDate":"2023-08-20","keyDetails":["AI focus","Competitive salary"]}} Please process this information accordingly.`,

//     // Array embedded in text
//     `Multiple emails were analyzed with the following results: [{"isJobRelated":true,"jobData":{"jobId":"789","position":"Product Manager","company":"ProductInc","status":"Offer Received","nextStep":"Review offer","applicationDate":"2023-08-25","keyDetails":["Leadership role","Stock options"]}},
//       {"isJobRelated":false,"jobData":{"jobId":"","position":"","company":"","status":"","nextStep":"","applicationDate":"","keyDetails":[]}}] Please handle each result appropriately.`,
      
//   ];

//   testCases.forEach((testCase, index) => {
//     console.log(`\nTest Case ${index + 1}:`);
//     const result = extractJsonFromString(testCase);
//     console.log(JSON.stringify(result, null, 2));
//   });
// }

// // Run the test
// testExtractJsonFromString();
