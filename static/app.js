// Chef Gordon Ramsay (Code Edition) Frontend Logic

document.addEventListener("DOMContentLoaded", () => {
  const sessionInput = document.getElementById("sessionInput");
  const btnNewSession = document.getElementById("btnNewSession");
  const displaySessionId = document.getElementById("displaySessionId");
  const msgCountEl = document.getElementById("msgCount");
  const chatFeed = document.getElementById("chatFeed");
  const chatForm = document.getElementById("chatForm");
  const messageInput = document.getElementById("messageInput");
  const btnSend = document.getElementById("btnSend");
  const charCount = document.getElementById("charCount");
  const btnClearHistory = document.getElementById("btnClearHistory");

  const gaugeFill = document.getElementById("gaugeFill");
  const riskBadge = document.getElementById("riskBadge");
  const sandwichAlert = document.getElementById("sandwichAlert");

  let messageCounter = 0;

  // Sync session input
  function updateSession(newId) {
    sessionInput.value = newId;
    displaySessionId.textContent = newId;
    messageCounter = 0;
    msgCountEl.textContent = messageCounter;
  }

  btnNewSession.addEventListener("click", () => {
    const randomSession = "session_" + Math.random().toString(36).substring(2, 9);
    updateSession(randomSession);
  });

  sessionInput.addEventListener("input", (e) => {
    displaySessionId.textContent = e.target.value.trim() || "unnamed_session";
  });

  // Auto-resize textarea & character counter
  messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + "px";
    charCount.textContent = `${messageInput.value.length} chars`;
  });

  // Enter to send (Shift+Enter for newline)
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  // Quick Trial Buttons
  document.querySelectorAll(".trial-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      if (prompt) {
        messageInput.value = prompt;
        messageInput.dispatchEvent(new Event("input"));
        chatForm.dispatchEvent(new Event("submit"));
      }
    });
  });

  // Clear Feed
  btnClearHistory.addEventListener("click", () => {
    chatFeed.innerHTML = "";
    messageCounter = 0;
    msgCountEl.textContent = messageCounter;
    updateGauge(0.0);
  });

  // Update Idiot Sandwich Meter
  function updateGauge(risk) {
    const percentage = Math.min(Math.max(risk * 100, 0), 100);
    gaugeFill.style.width = `${percentage}%`;

    riskBadge.className = "risk-badge";
    if (risk >= 0.7) {
      riskBadge.classList.add("danger");
      riskBadge.textContent = `ALERT (${risk.toFixed(2)})`;
      sandwichAlert.classList.remove("hidden");
    } else if (risk >= 0.2) {
      riskBadge.classList.add("warning");
      riskBadge.textContent = `SLOPPY (${risk.toFixed(2)})`;
      sandwichAlert.classList.add("hidden");
    } else {
      riskBadge.classList.add("safe");
      riskBadge.textContent = `SAFE (${risk.toFixed(2)})`;
      sandwichAlert.classList.add("hidden");
    }
  }

  // Append User Bubble
  function appendUserMessage(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper user-wrapper";
    wrapper.innerHTML = `
      <div class="message-avatar user-avatar">💻</div>
      <div class="message-bubble user-bubble">
        <div class="message-header">
          <span class="author-name">YOU (JUNIOR DEV)</span>
        </div>
        <div class="message-content">
          <p>${escapeHtml(text)}</p>
        </div>
      </div>
    `;
    chatFeed.appendChild(wrapper);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    messageCounter++;
    msgCountEl.textContent = messageCounter;
  }

  // Append Bot Bubble with structured JSON Inspector
  function appendBotMessage(data) {
    const risk = data.character_break_risk ?? 0.0;
    const isAlert = risk >= 0.7;
    const riskLabel = isAlert 
      ? `RISK: ${risk.toFixed(2)} | JAILBREAK DEFENSE TRIGGERED` 
      : `RISK: ${risk.toFixed(2)} | IN-CHARACTER`;

    const pillClass = isAlert ? "pill-alert" : "pill-zero";
    const rawJson = JSON.stringify(data, null, 2);

    const wrapper = document.createElement("div");
    wrapper.className = "message-wrapper bot-wrapper";
    wrapper.innerHTML = `
      <div class="message-avatar chef-avatar">👨‍🍳</div>
      <div class="message-bubble bot-bubble">
        <div class="message-header">
          <span class="author-name">CHEF GORDON RAMSAY</span>
          <span class="risk-pill ${pillClass}">${riskLabel}</span>
        </div>
        <div class="message-content">
          <p>${escapeHtml(data.bot_reply)}</p>
        </div>
        <div class="message-footer">
          <button class="btn-json-inspect" onclick="toggleJson(this)">
            <span>{ } View Raw Parsed JSON</span>
          </button>
        </div>
        <pre class="json-drawer">${escapeHtml(rawJson)}</pre>
      </div>
    `;
    chatFeed.appendChild(wrapper);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    messageCounter++;
    msgCountEl.textContent = messageCounter;

    updateGauge(risk);
  }

  // Append Loading / Screaming Indicator
  function appendTypingIndicator() {
    const id = "typing-" + Date.now();
    const wrapper = document.createElement("div");
    wrapper.id = id;
    wrapper.className = "message-wrapper bot-wrapper";
    wrapper.innerHTML = `
      <div class="message-avatar chef-avatar">👨‍🍳</div>
      <div class="typing-bubble">
        <span>Chef Ramsay is reviewing your algorithm</span>
        <span class="flame-dot">🔥</span>
        <span class="flame-dot">🔥</span>
        <span class="flame-dot">🔥</span>
      </div>
    `;
    chatFeed.appendChild(wrapper);
    chatFeed.scrollTop = chatFeed.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // Handle Chat Submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    const sessionId = sessionInput.value.trim() || "kitchen_session_1";

    appendUserMessage(text);
    messageInput.value = "";
    messageInput.style.height = "auto";
    charCount.textContent = "0 chars";
    btnSend.disabled = true;

    const typingId = appendTypingIndicator();

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });

      removeTypingIndicator(typingId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Network error" }));
        throw new Error(errorData.detail || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      appendBotMessage(data);
    } catch (err) {
      removeTypingIndicator(typingId);
      appendBotMessage({
        bot_reply: `BLOODY HELL! The kitchen server choked: "${err.message}". Try again or check the logs!`,
        character_break_risk: 0.5,
      });
    } finally {
      btnSend.disabled = false;
      messageInput.focus();
    }
  });

  // Global toggle for JSON drawer
  window.toggleJson = function (btn) {
    const drawer = btn.closest(".message-bubble").querySelector(".json-drawer");
    if (drawer) {
      drawer.classList.toggle("open");
      btn.textContent = drawer.classList.contains("open") 
        ? "{ } Hide Raw Parsed JSON" 
        : "{ } View Raw Parsed JSON";
    }
  };

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
