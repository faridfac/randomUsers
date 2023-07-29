const express = require("express");
const fetch = require("node-fetch");
const cheerio = require("cheerio");
const crypto = require("crypto");
const uuid = require("uuid");

const app = express();
const port = 3000;

function generateSHA1(string) {
  const sha1Hash = crypto.createHash("sha1").update(string).digest("hex");
  return sha1Hash;
}

function getUUID() {
  return uuid.v4();
}

function getPhone() {
  const prefixes = [
    "0811",
    "0812",
    "0813",
    "0821",
    "0822",
    "0823",
    "0851",
    "0852",
    "0853",
    "0815",
    "0816",
    "0855",
    "0856",
    "0857",
    "0858",
    "0817",
    "0818",
    "0819",
    "0859",
    "0877",
    "0878",
    "0831",
    "0832",
    "0833",
    "0838",
  ];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNumber = Math.floor(100000000 + Math.random() * 900000000);

  return randomPrefix + randomNumber;
}

async function getUsersData() {
  try {
    const response = await fetch(
      "https://www.fakexy.com/fake-address-generator-id"
    );
    const text = await response.text();

    if (!text.includes("Indonesia address")) {
      return res.status(500).json({ message: "Error fetching data" });
    }

    const $ = cheerio.load(text);

    const getUserData = (label) => {
      const el = $(`td:contains('${label}')`);
      return el.next().text().trim();
    };

    const name = getUserData("Full Name");
    const split = name.split(" ");
    const firstname = split[0];
    const lastname = split[1];
    const username = `${firstname.toLowerCase()}${lastname.toLowerCase()}${Math.floor(
      Math.random() * (999 - 10) + 10
    )}`;
    const email = `${username}@gmail.com`;
    const sha1 = generateSHA1(username);
    const phone = getPhone();
    const userUUID = getUUID();

    const obj = {
      gender: getUserData("Gender"),
      name: {
        first: firstname,
        last: lastname,
      },
      location: {
        street: getUserData("Street"),
        city: getUserData("City"),
        state: getUserData("State"),
        postcode: getUserData("Zip/Postal Code"),
        country: getUserData("Country"),
        latitude: getUserData("Latitude"),
        longitude: getUserData("Longitude"),
      },
      email: email,
      phone: phone,
      dob: getUserData("Birthday"),
      login: {
        uuid: userUUID,
        username: username,
        sha1: sha1,
      },
    };

    return obj;
  } catch (err) {
    throw err;
  }
}

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", async (req, res) => {
  try {
    const user = await getUsersData();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
