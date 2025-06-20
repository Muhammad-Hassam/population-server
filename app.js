// const express = require("express");
// const cors = require("cors");
// const puppeteer = require("puppeteer");

// const app = express();
// const PORT = 8000;

// app.use(
//   cors({
//     origin: "/*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     // allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());

// app.get("/population", (req, res) => {
//   async function fetchPopulationWithPuppeteer() {
//     try {
//       const browser = await puppeteer.launch({ headless: "new" });
//       const page = await browser.newPage();
//       await page.goto(
//         "https://www.worldometers.info/world-population/pakistan-population/",
//         {
//           waitUntil: "networkidle2",
//         }
//       );

//       // Wait for the real-time population counter to appear
//       await page.waitForSelector('span.rts-counter[rel="pakistan-population"]');

//       // Extract the population value
//       const population = await page.evaluate(() => {
//         const counter = document.querySelector(
//           'span.rts-counter[rel="pakistan-population"]'
//         );
//         return Array.from(counter.children)
//           .map((el) => el.textContent)
//           .join("");
//       });

//       console.log(
//         `🇵🇰 Pakistan Real-Time Population: ${population} — ${new Date().toLocaleTimeString()}`
//       );

//       await browser.close();

//       res.send({ data: population });
//     } catch (err) {
//       console.error("Error fetching population:", err.message);
//     }
//   }

//   setInterval(fetchPopulationWithPuppeteer, 10000);
// });

// app.get("/", (req, res) => {
//   res.send({ msg: "hi" });
// });

// app.listen(PORT, () => console.log("Server running on port " + PORT));

// const express = require("express");
// const cors = require("cors");
// const puppeteer = require("puppeteer");

// const app = express();
// const PORT = 8000;

// let latestPopulation = "Fetching..."; // store the latest population

// app.use(
//   cors({
//     origin: "*", // fixed wildcard
//     methods: ["GET", "POST", "PUT", "DELETE"]
//   })
// );
// app.use(express.json());

// async function fetchPopulationWithPuppeteer() {
//   try {
//     const browser = await puppeteer.launch({ headless: "new" });
//     const page = await browser.newPage();
//     await page.goto(
//       "https://www.worldometers.info/world-population/pakistan-population/",
//       { waitUntil: "networkidle2" }
//     );

//     await page.waitForSelector('span.rts-counter[rel="pakistan-population"]');

//     const population = await page.evaluate(() => {
//       const counter = document.querySelector(
//         'span.rts-counter[rel="pakistan-population"]'
//       );
//       return Array.from(counter.children)
//         .map((el) => el.textContent)
//         .join("");
//     });

//     latestPopulation = population;

//     console.log(
//       `🇵🇰 Pakistan Real-Time Population: ${population} — ${new Date().toLocaleTimeString()}`
//     );

//     await browser.close();
//   } catch (err) {
//     console.error("Error fetching population:", err.message);
//   }
// }

// // call it every 10 seconds
// setInterval(fetchPopulationWithPuppeteer, 10000);
// // call once immediately at startup
// fetchPopulationWithPuppeteer();

// app.get("/population", (req, res) => {
//   res.send({ data: latestPopulation });
// });

// app.get("/", (req, res) => {
//   res.send({ msg: "hi" });
// });

// app.listen(PORT, () => console.log("Server running on port " + PORT));

const express = require("express");
const cors = require("cors");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const app = express();
const PORT = process.env.PORT || 8000;

let latestPopulation = "Fetching...";

app.use(cors());
app.use(express.json());

async function fetchPopulationWithPuppeteer() {
  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.AWS_LAMBDA_FUNCTION_VERSION // if running in serverless (Vercel)
        ? await chromium.executablePath
        : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // local Mac path
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(
      "https://www.worldometers.info/world-population/pakistan-population/",
      { waitUntil: "networkidle2" }
    );

    await page.waitForSelector('span.rts-counter[rel="pakistan-population"]');

    const population = await page.evaluate(() => {
      const counter = document.querySelector(
        'span.rts-counter[rel="pakistan-population"]'
      );
      return Array.from(counter.children)
        .map((el) => el.textContent)
        .join("");
    });

    latestPopulation = population;
    console.log(`🇵🇰 Population: ${population}`);
    await browser.close();
  } catch (err) {
    console.error("Error fetching population:", err.message);
  }
}

setInterval(fetchPopulationWithPuppeteer, 10000);
fetchPopulationWithPuppeteer();

app.get("/population", (req, res) => {
  res.send({ data: latestPopulation });
});

app.get("/", (req, res) => {
  res.send({ msg: "hi" });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
