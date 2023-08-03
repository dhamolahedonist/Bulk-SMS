const Hapi = require("@hapi/hapi");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

function convertToInternationalFormat(number) {
  const phoneNumber = number.replace(/\D/g, "");

  if (phoneNumber.startsWith("0")) {
    return `234${phoneNumber.slice(1)}`;
  } else if (phoneNumber.startsWith("234")) {
    return phoneNumber;
  } else {
    return `234${phoneNumber}`;
  }
}

async function translateText(text, source_language, destination_language) {
  const apiKey = process.env.OPENAI_KEY;
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
    const translation = response.data.choices[0].message.content.trim();
    return translation;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
}

const server = Hapi.server({
  port: 3000,
  host: "localhost",
  routes: {
    // Enable payload parsing for incoming requests
    payload: {
      parse: true,
      allow: ["application/json"],
    },
  },
});

server.route({
  method: "POST",
  path: "/",
  handler: async (request, h) => {
    const { phone_number, text, source_language, target_language } =
      request.payload;

    const convertedPhoneNumbers = phone_number.map(
      convertToInternationalFormat
    );

    try {
      const translation = await translateText(
        text,
        source_language,
        target_language
      );

      const request = require("request");
      convertedPhoneNumbers.forEach((convertedPhoneNumber) => {
        const data = {
          to: convertedPhoneNumber,
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
      });

      return { translation };
    } catch (error) {
      console.error("Error translating text", error);
      return h.response({ error: "Translation failed" }).code(500);
    }
  },
});

const init = async () => {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
