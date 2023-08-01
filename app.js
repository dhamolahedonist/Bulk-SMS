const Hapi = require("@hapi/hapi");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

// async function translateText(text, source_language, target_language) {
//   const prompt = `Translate the following '${source_language}' text to '${target_language}': ${text}`;

//   const requestBody = {
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant that translates text.",
//       },
//       { role: "user", content: prompt },
//     ],
//     max_tokens: 150,
//     n: 1,
//     stop: null,
//     temperature: 0.5,
//   };

//   try {
//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       requestBody,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization:
//             "Bearer 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", // Replace with your OpenAI API key
//         },
//       }
//     );

//     const translation = response.data.choices[0].message.content.trim();

//     return translation;
//   } catch (error) {
//     console.error("Error translating text:", error);
//     return null;
//   }
// }

// translateText("Hello, how are you?", "English", "Yoruba")
//   .then((translation) => console.log("Translation:", translation))
//   .catch((error) => console.error("Error:", error));

// async function translateText(text) {
//   const apiKey = "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"; // Replace with your API key
//   const apiUrl = "https://api.openai.com/v1/chat/completions";
//   const data = {
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant that translates text.",
//       },
//       {
//         role: "user",
//         content: `Translate the following 'English' text to 'Yoruba': ${text}`,
//       },
//     ],
//     max_tokens: 150,
//     n: 1,
//     stop: null,
//     temperature: 0.5,
//   };

//   // Make the request with a delay of 2 seconds
//   await new Promise((resolve) => setTimeout(resolve, 2000));
//   return axios.post(apiUrl, data, {
//     headers: {
//       Authorization: `Bearer ${apiKey}`,
//       "Content-Type": "application/json",
//     },
//   });
// }

// async function translateText(text) {
//   const apiKey = "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"; // Replace with your API key
//   const apiUrl = "https://api.openai.com/v1/chat/completions";
//   const data = {
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant that translates text.",
//       },
//       {
//         role: "user",
//         content: `Translate the following 'English' text to 'Yoruba': ${text}`,
//       },
//     ],
//     max_tokens: 150,
//     n: 1,
//     stop: null,
//     temperature: 0.5,
//   };

//   try {
//     // Make the request with a delay of 2 seconds
//     await new Promise((resolve) => setTimeout(resolve, 2000));
//     const response = await axios.post(apiUrl, data, {
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//         "Content-Type": "application/json",
//       },
//     });
//     console.log(response.data);
//     const translation = response.data.choices[0].message.content.trim();
//     return translation;
//   } catch (error) {
//     console.error("Error:", error.message);
//     throw error;
//   }
// }

async function translateText(text, source_language, destination_language) {
  const apiKey = process.env.OPENAI_KEY; // Replace with your API key
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const data = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that translates text.",
      },
      {
        role: "user",
        content: `Translate the following '${source_language}' text to '${destination_language}': ${text}`,
      },
    ],
    max_tokens: 150,
    n: 1,
    stop: null,
    temperature: 0.5,
  };

  try {
    // Make the request with a delay of 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const response = await axios.post(apiUrl, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    console.log(response.data);
    const translation = response.data.choices[0].message.content.trim();
    return translation;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

// // Example usage:
// translateText("Hello, how are you?", "English", "Yoruba")
//   .then((translation) => {
//     console.log("Translation:", translation);
//   })
//   .catch((error) => {
//     // Handle errors
//     console.error(error);
//   });

// // Example usage:
// translateText("Hello, how are you?")
//   .then((response) => {
//     console.log(response);
//     // Do something with the response if needed
//   })
//   .catch((error) => {
//     console.error(error);
//     // Handle errors
//   });

const server = Hapi.server({
  port: 3000,
  host: "localhost",
  routes: {
    // Enable payload parsing for incoming requests
    payload: {
      parse: true,
      allow: ["application/json"], // Allow JSON content type
    },
  },
});

server.route({
  method: "POST",
  path: "/",
  handler: async (request, h) => {
    const { phoneNumber, text, source_language, target_language } =
      request.payload;
    try {
      const translation = await translateText(
        text,
        source_language,
        target_language
      );
      console.log(translation);
      const request = require("request");
      const data = {
        to: phoneNumber,
        from: "kokash",
        sms: translation,
        type: "plain",
        channel: "generic",
        api_key: process.env.TERMII_KEY,
      };
      const options = {
        method: "POST",
        url: "https://termii.com/api/sms/send",
        headers: {
          "Content-Type": ["application/json", "application/json"],
        },
        body: JSON.stringify(data),
      };

      request(options, function (error, response) {
        if (error) throw new Error(error);
        console.log(response.body);
      });
      return { translation };
    } catch (error) {
      console.error("Error translating text", error);
      return h.response({ error: "Translation failed" }).code(500);
    }
  },
});

// server.route({
//   method: "POST",
//   path: "/",
//   handler: async (request, h) => {
//     const { text, source_language, target_language } = request.payload;
//     try {
//       const translation = await translateText(
//         text,
//         source_language,
//         target_language
//       );

//       // Ensure that the translation is not null or empty
//       if (!translation) {
//         throw new Error("Translation is null or empty.");
//       }

//       console.log("Translation:", translation);

//       const data = {
//         to: "2348163244139",
//         from: "Kokash",
//         sms: translation, // Use the translated text here
//         type: "plain",
//         channel: "generic",
//         api_key:
//           "TLj9NQXiXBhDClQRiuTyyrQTCAg8njktU15X1SboTaPuWMohgkuuUFDNjEhIF9",
//       };

//       const options = {
//         method: "POST",
//         url: "https://termii.com/api/sms/send",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(data),
//       };

//       console.log(data);

//       request(options, function (error, response) {
//         if (error) throw new Error(error);
//         console.log(response.body);
//       });

//       return { translation };
//     } catch (error) {
//       console.error("Error translating text", error);
//       return h.response({ error: "Translation failed" }).code(500);
//     }
//   },
// });
const init = async () => {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
