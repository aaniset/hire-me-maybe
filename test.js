// # from collections import Counter
// # def getMaximumMex(arr,x):
// #     count = Counter([num % x for num in arr])

// #     for i in range(len(arr)):
// #         if count[i % x] == 0:
// #             return i
// #         count[i % x] -= 1

// #     return len(arr)

// main
// ...
// open (os. environ ['OUTPUT_PATH'], 'w')
// n = int(input(). strip ())
// function_mapper = {
// "delay _max": delay_max,
// "delay _min": delay_min,
// "delay_sum": delay_sum,
// for - in range(n) :
// row = input .rstrip).split
// decorated_ func = timeit (function_mapper[rowLoJ
// args = row[1:-1]
// for i in range (len(args)):
// argslil = int(args[i])
// fptr write(str(decorated_func(*args, delay=int(row[-1]))) + "\n")
// error = 5

function extractJsonFromString(inputString) {
  // Regular expression to match content between triple backticks
  const jsonRegex = /```([\s\S]*?)```/;

  // Extract the content between triple backticks
  const match = inputString.match(jsonRegex);

  if (match && match) {
    let jsonString = match.trim();

    // Remove single-line comments
    jsonString = jsonString.replace(/\/\/.*$/gm, "");

    // Remove multi-line comments
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//g, "");

    try {
      // Parse the cleaned JSON string
      const jsonObject = JSON.parse(jsonString);
      return jsonObject;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  } else {
    console.error("No JSON found between triple backticks");
    return null;
  }
}

const test = ` Here is the JSON object based on the provided email:

```[
  {
    id: "191393127c7cd5ea",
    isJobRelated: true,
    jobData: {
      jobId: "",
      position: "", // Unable to extract position from the email
      company: "Coinbase",
      status: "applied",
      nextStep: "Await notification of next steps",
      applicationDate: "", // Unable to extract application date from the email
      keyDetails: [
        "Application received at Coinbase",
        "Next steps to be communicated shortly",
      ],
    },
  }
]```

Note: The position field is left empty as it is not explicitly mentioned in the email. The application date is also left empty as it is not provided in the email.`;
