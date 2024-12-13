// import axios from 'axios';
// // import { logger } from '@/lib/utils/logger';
// // import { config } from '@/config';

// export class LLMClient {
//   private baseUrl: string;
//   private apiKey: string;

//   constructor() {
//     this.baseUrl = config.llm.baseUrl;
//     this.apiKey = config.llm.apiKey;
//   }

//   async classify(prompt: string): Promise<string> {
//     return this.sendRequest('classify', prompt);
//   }

//   async analyze(prompt: string): Promise<string> {
//     return this.sendRequest('analyze', prompt);
//   }

//   private async sendRequest(endpoint: string, prompt: string): Promise<string> {
//     try {
//       const response = await axios.post(`${this.baseUrl}/${endpoint}`, {
//         prompt,
//         max_tokens: 1000,
//         temperature: 0.5,
//       }, {
//         headers: {
//           'Authorization': `Bearer ${this.apiKey}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       return response.data.choices[0].text.trim();
//     } catch (error) {
//       logger.error(`Error in LLM request to ${endpoint}:`, error);
//       throw error;
//     }
//   }
// }

import Replicate from "replicate";

// import { LLMResponseParser } from '@/lib/utils/LLMResponseParser';
// import {LLMResponseParser } from '@/lib/utils'
export class LLMClient {
  private replicate: Replicate;

  constructor() {
    // Initialize Replicate with the API token from environment variable
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      throw new Error("REPLICATE_API_TOKEN environment variable is not set");
    }
    this.replicate = new Replicate({
      auth: apiToken,
    });
  }

  async classify(prompt: string): Promise<any> {
    return this.sendRequest(prompt);
  }

  async classifyWithEmail(prompt: string): Promise<any> {
    return this.sendRequestWithEmail(prompt);
  }
  async classifyWithSeubject(prompt: string): Promise<any> {
    return this.sendRequestWithSubject(prompt);
  }

  async analyze(prompt: string): Promise<string> {
    return this.sendRequest(prompt);
  }

  private async sendRequest(prompt: string): Promise<any> {
    try {
      const input = {
        top_p: 0.9,
        prompt: prompt,
        min_tokens: 0,
        max_new_tokens: 7000,
        temperature: 0.6,
        prompt_template:
          "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        presence_penalty: 1.15,
      };

      // Use the stream method to get the output from the Llama 3 8B model
      let fullOutput = "";
      for await (const event of this.replicate.stream(
        "meta/meta-llama-3-70b-instruct",
        {
          input,
        }
      )) {
        fullOutput += event;
      }
      return this.extractArrayFromBackticks(fullOutput.trim());
    } catch (error) {
      console.error(`Error in LLM request for :`, error);
      throw error;
    }
  }

  private async sendRequestWithSubject(prompt: string): Promise<any> {
    try {
      const input = {
        top_p: 0.9,
        prompt: prompt,
        min_tokens: 0,
        max_new_tokens: 7000,
        temperature: 0.6,
        prompt_template:
          "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        presence_penalty: 1.15,
      };

      // Use the stream method to get the output from the Llama 3 8B model
      let fullOutput = "";
      for await (const event of this.replicate.stream(
        "meta/meta-llama-3-70b-instruct",
        {
          input,
        }
      )) {
        fullOutput += event;
      }
      return this.extractArrayFromBackticks(fullOutput.trim());
    } catch (error) {
      console.error(`Error in LLM request for :`, error);
      throw error;
    }
  }

  private async sendRequestWithEmail(prompt: string): Promise<any> {
    try {
      const input = {
        top_p: 0.9,
        prompt: prompt,
        min_tokens: 0,
        max_new_tokens: 7000,
        temperature: 0.6,
        prompt_template:
          "<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\nYou are a helpful assistant<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n{prompt}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n",
        presence_penalty: 1.15,
      };

      // Use the stream method to get the output from the Llama 3 8B model
      let fullOutput = "";
      for await (const event of this.replicate.stream(
        "meta/meta-llama-3-70b-instruct",
        {
          input,
        }
      )) {
        fullOutput += event;
      }
      return this.extractJsonFromBackticks(fullOutput.trim());
    } catch (error) {
      console.error(`Error in LLM request for :`, error);
      throw error;
    }
  }

  private extractJsonFromString(input: string): any {
    try {
      // The rest of the function remains the same
      // Regular expression to match JSON objects or arrays
      const jsonRegex =
        /(\[|\{)(?:[^{}\[\]]|\{(?:[^{}\[\]]|\{[^{}\[\]]*\})*\}|\[(?:[^{}\[\]]|\[.*?\])*\])*(\]|\})/g;

      // Find all matches
      const matches = input.match(jsonRegex);

      if (matches && matches.length > 0) {
        // Try to parse each match
        for (const match of matches) {
          try {
            const parsed = JSON.parse(match);
            // If parsing succeeds, return the result
            return parsed;
          } catch (parseError) {
            // If parsing fails, continue to the next match
            console.warn("Failed to parse a potential JSON match:", parseError);
          }
        }
        // If all parses fail, throw an error
        throw new Error("Found potential JSON structures, but none were valid");
      } else {
        throw new Error(
          "No valid JSON object or array found in the input string"
        );
      }
    } catch (error) {
      console.log(`Error extracting JSON: input: ${input}`, error);
      return null;
    }
  }
  // private extractJsonFromBackticks = (input: string): any | null => {
  //   // Match the content between the triple backticks
  //   const match = input.match(/```([^`]*)```/);

  //   if (match && match[1]) {
  //     try {
  //       // Parse the JSON content
  //       return JSON.parse(match[1].trim());
  //     } catch (error) {
  //       console.error(`Failed to parse JSON: ${input}`, error);
  //       return null;
  //     }
  //   }

  //   return null;
  // };
  private extractArrayFromBackticks(response: string): any[] | null {
    // Regular expression to match content within triple backticks, allowing for language specifiersor language specifiers
    const regex = /```(?:json)?\s*([\s\S]*?)```/g;

    let match;
    while ((match = regex.exec(response)) !== null) {
      const content = match[1].trim();

      // Remove any potential comments
      const contentWithoutComments = content.replace(/\/\/.*$/gm, "").trim();

      try {
        // Attempt to parse the content as JSON
        const parsedContent = JSON.parse(contentWithoutComments);

        // Check if the parsed content is an array
        if (Array.isArray(parsedContent)) {
          return parsedContent;
        }
      } catch (error) {
        // If parsing fails, continue to the next match
        console.warn("Failed to parse content, trying next match:", error);
      }
    }

    // If no valid array is found, try a more lenient approach
    const lenientRegex = /\[([\s\S]*?)\]/g;
    while ((match = lenientRegex.exec(response)) !== null) {
      const content = match[0].trim();

      try {
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          return parsedContent;
        }
      } catch (error) {
        // If parsing fails, continue to the next match
        console.warn(
          "Failed to parse content in lenient mode, trying next match:",
          error
        );
      }
    }

    // Return null if no valid array is found
    return null;
  }
  private extractJsonFromBackticks = (input: string): any | null => {
    // Match the content between the triple backticks
    // const match = input.match(/```([^`]*)```/);

    // if (match && match[1]) {
    //   try {
    //     // Parse the JSON content using JSON5
    //     return JSON5.parse(match[1].trim());
    //   } catch (error) {
    //     console.error(`Failed to parse JSON: ${input}`, error);
    //     return null;
    //   }
    // }

    // return null;
    // Regular expression to match content between triple backticks
    const jsonRegex = /```([\s\S]*?)```/;

    // Extract the content between triple backticks
    const match = input.match(jsonRegex);

    if (match && match[1]) {
      let jsonString = match[1].trim();

      // Remove single-line comments
      jsonString = jsonString.replace(/\/\/.*$/gm, "");

      // Remove multi-line comments
      jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, "");

      try {
        // Evaluate the cleaned string as JavaScript code
        const jsonObject = eval(`(${jsonString})`);
        return jsonObject;
      } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
      }
    } else {
      console.error("No JSON found between triple backticks");
      return null;
    }
  };
  private parseResponse(llmResponse: string): any {
    const parsed = this.extractJsonFromString(llmResponse);
    if (parsed === null) {
      throw new Error("Failed to extract valid JSON from LLM response");
    }
    return parsed;
  }
}
