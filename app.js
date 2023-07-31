const Hapi = require("@hapi/hapi");
const axios = require("axios");

async function translateText(text, source_language, target_language) {
  const prompt = `Translate the following '${source_language}' text to '${target_language}': ${text}`;

  const requestBody = {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that translates text.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 150,
    n: 1,
    stop: null,
    temperature: 0.5,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer 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", // Replace with your OpenAI API key
        },
      }
    );

    const translation = response.data.choices[0].message.content.trim();

    return translation;
  } catch (error) {
    console.error("Error translating text:", error);
    return null;
  }
}

// Example usage:
// translateText("Hello, how are you?", "English", "Yoruba")
//   .then((translation) => console.log("Translation:", translation))
//   .catch((error) => console.error("Error:", error));

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
      const request = require("request");
      const data = {
        to: phoneNumber,
        from: "Kokash",
        sms: translation,
        type: "plain",
        channel: "generic",
        api_key:
          "TLj9NQXiXBhDClQRiuTyyrQTCAg8njktU15X1SboTaPuWMohgkuuUFDNjEhIF9",
      };
      const options = {
        method: "POST",
        url: "https://termii.com/api/sms/send",
        headers: {
          "Content-Type": ["application/json", "application/json"],
        },
        body: JSON.stringify(data),
      };
      console.log(data);
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

const init = async () => {
  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();
