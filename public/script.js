const socket = io();

const loginSection = document.getElementById("loginSection");
const chatSection  = document.getElementById("chatSection");

// عناصر واجهة الدخول الجديدة
const loginIdentifierInput = document.getElementById("loginIdentifier");
const loginPasswordInput   = document.getElementById("loginPassword");
const btnLogin             = document.getElementById("btnLogin");

const regUsernameInput = document.getElementById("regUsername");
const regEmailInput    = document.getElementById("regEmail");
const regPasswordInput = document.getElementById("regPassword");
const btnRegister      = document.getElementById("btnRegister");

// عناصر تفعيل البريد
const verifyBox       = document.getElementById("verifyBox");
const verifyCodeInput = document.getElementById("verifyCode");
const btnVerifyCode   = document.getElementById("btnVerifyCode");

// عناصر الشات
const contactsList   = document.getElementById("contactsList");
const contactsSearch = document.getElementById("contactsSearch");
const messagesDiv    = document.getElementById("messages");
const chatForm       = document.getElementById("chatForm");
const messageInput   = document.getElementById("message");
const contactsSection = document.querySelector('.contacts-section');
const mainArea = document.querySelector('.main');
const btnBackToContacts = document.getElementById('btnBackToContacts');
const chatHeader = document.getElementById('chatHeader');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const chatHeaderStatus = document.getElementById('chatHeaderStatus');

// عناصر إدارة جهات الاتصال
const contactsTabs = document.querySelectorAll(".contacts-tab");
const contactsPanels = document.querySelectorAll(".contacts-panel");
const newContactUsernameInput = document.getElementById("newContactUsername");
const btnSendContactRequest = document.getElementById("btnSendContactRequest");
const contactRequestMessage = document.getElementById("contactRequestMessage");
const pendingRequestsList = document.getElementById("pendingRequestsList");

// إعادة إرسال الكود + العداد
const btnResendCode     = document.getElementById("btnResendCode");
const verifyTimer       = document.getElementById("verifyTimer");
const verifyTimerValue  = document.getElementById("verifyTimerValue");

// جسم نموذج الدخول/التسجيل + زر الرجوع
const authBody          = document.querySelector(".auth-body");
const btnBackToRegister = document.getElementById("btnBackToRegister");

// تبويبات واجهة الدخول
const authTabs   = document.querySelectorAll(".auth-tab");
const authPanels = document.querySelectorAll(".auth-panel");

// صندوق الرسائل في شاشة الدخول
const authAlertBox = document.getElementById("authAlert");

let verifyTimerInterval = null;

let currentUser   = null;
let activePartner = null;

// متغيرات لتخزين معلومات المستخدم الذي ينتظر التفعيل
let pendingUserId    = null;
let pendingUsername  = null;
let pendingUserEmail = null;

/* ================== رسائل الواجهة ================== */

function showAuthMessage(type, text) {
  if (!authAlertBox) return;
  authAlertBox.style.display = "block";
  authAlertBox.textContent = text;
  authAlertBox.className = "auth-alert"; // reset
  if (type === "error") {
    authAlertBox.classList.add("auth-alert-error");
  } else if (type === "success") {
    authAlertBox.classList.add("auth-alert-success");
  }
}

function clearAuthMessage() {
  if (!authAlertBox) return;
  authAlertBox.style.display = "none";
  authAlertBox.textContent = "";
  authAlertBox.className = "auth-alert";
}

/* ================== عدّاد إعادة الإرسال ================== */

function startVerifyTimer(seconds) {
  if (!verifyTimer || !verifyTimerValue || !btnResendCode) return;

  // إلغاء أي عدّاد قديم
  if (verifyTimerInterval) {
    clearInterval(verifyTimerInterval);
    verifyTimerInterval = null;
  }

  // إظهار العدّاد وإخفاء زر إعادة الإرسال
  if (seconds > 0) {
    verifyTimer.style.display   = "block";
    btnResendCode.style.display = "none";

    let remaining = seconds;
    verifyTimerValue.textContent = remaining;

    verifyTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(verifyTimerInterval);
        verifyTimerInterval = null;
        verifyTimer.style.display   = "none";
        btnResendCode.style.display = "block";
      } else {
        verifyTimerValue.textContent = remaining;
      }
    }, 1000);
  } else {
    // لو ما في عدّاد نسمح مباشرة بإعادة الإرسال
    verifyTimer.style.display   = "none";
    btnResendCode.style.display = "block";
  }
}

/* ================== تبويبات تسجيل الدخول / التسجيل ================== */

authTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    authTabs.forEach(t => t.classList.remove("auth-tab-active"));
    tab.classList.add("auth-tab-active");

    authPanels.forEach(panel => {
      const panelName = panel.getAttribute("data-panel");
      if (panelName === target) {
        panel.classList.add("auth-panel-active");
      } else {
        panel.classList.remove("auth-panel-active");
      }
    });

    clearAuthMessage();
  });
});

/* ================== زر الرجوع لتعديل البيانات ================== */

if (btnBackToRegister) {
  btnBackToRegister.addEventListener("click", () => {
    // إخفاء صندوق التفعيل
    verifyBox.style.display = "none";

    // إظهار نموذج التسجيل/الدخول مرة أخرى
    if (authBody) {
      authBody.style.display = "block";
    }

    // إلغاء العدّاد لو شغال
    if (verifyTimerInterval) {
      clearInterval(verifyTimerInterval);
      verifyTimerInterval = null;
    }

    // إخفاء التايمر وزر إعادة الإرسال
    if (verifyTimer) {
      verifyTimer.style.display = "none";
    }
    if (btnResendCode) {
      btnResendCode.style.display = "none";
    }

    clearAuthMessage();
  });
}

/* ================== جلب المستخدمين (قائمة الشركاء) ================== */

// loadUsers() implementation replaced below to render sidebar contacts

async function loadUsers() {
  if (!currentUser) return;

  try {
    const res = await fetch(`/api/contacts/${encodeURIComponent(currentUser)}`);
    const data = await res.json();

    if (!contactsList) return;
    contactsList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      contactsList.innerHTML = '<p class="empty-requests">لا توجد جهات اتصال</p>';
      return;
    }

    data.forEach(u => {
      const item = document.createElement('div');
      item.className = 'contact-item';
      item.dataset.username = u.Username;
      item.innerHTML = `
        <div class="contact-avatar">${(u.Username || '؟').charAt(0).toUpperCase()}</div>
        <div class="contact-meta">
          <div class="contact-name">${u.Username}</div>
          <div class="contact-last"></div>
        </div>
      `;

      item.addEventListener('click', async () => {
        document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');

        activePartner = u.Username;
        messagesDiv.textContent = 'يتم تحميل المحادثة...';

        // set header info
        setChatHeader(u.Username);

        socket.emit('joinRoom', { user1: currentUser, user2: activePartner });
        await loadHistory(currentUser, activePartner);
        showChatForMobile();
        messageInput.focus();
      });

      contactsList.appendChild(item);
    });

    // apply search filter
    if (contactsSearch) {
      contactsSearch.addEventListener('input', () => {
        const q = contactsSearch.value.trim().toLowerCase();
        document.querySelectorAll('.contact-item').forEach(el => {
          const name = (el.dataset.username || '').toLowerCase();
          el.style.display = name.includes(q) ? '' : 'none';
        });
      });
    }

  } catch (err) {
    console.error('Error loading contacts:', err);
  }
}

function isMobileView() {
  return window.matchMedia('(max-width:900px)').matches;
}

function setChatHeader(username){
  if(!chatHeader || !chatHeaderName || !chatHeaderAvatar || !chatHeaderStatus) return;
  chatHeaderName.textContent = username || '';
  chatHeaderAvatar.textContent = (username && username.charAt(0)) ? username.charAt(0).toUpperCase() : '؟';
  // status: we can later fetch presence; for now set default text
  chatHeaderStatus.textContent = 'متصل';
  chatHeader.style.display = 'block';
}

function updateLayoutAfterLogin() {
  if (isMobileView()) {
    // show contacts only
    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'none';
    if (btnBackToContacts) btnBackToContacts.style.display = 'none';
  } else {
    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'flex';
    if (btnBackToContacts) btnBackToContacts.style.display = 'none';
  }
}

function showChatForMobile() {
  if (isMobileView()) {
    if (contactsSection) contactsSection.style.display = 'none';
    if (mainArea) mainArea.style.display = 'flex';
    if (btnBackToContacts) btnBackToContacts.style.display = 'inline-block';

    // push a history state so the device/back button can be used to close the chat
    try {
      if (!history.state || !history.state.chatOpen) {
        history.pushState({ chatOpen: true }, '');
      }
    } catch (e) {
      // ignore
    }
  }
}

if (btnBackToContacts) {
  btnBackToContacts.addEventListener('click', () => {
    // On mobile, prefer navigating history back so the hardware back button syncs
    if (isMobileView() && history.state && history.state.chatOpen) {
      history.back();
      return;
    }

    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'none';
    btnBackToContacts.style.display = 'none';
    // hide header when returning to contacts
    if (chatHeader) chatHeader.style.display = 'none';
    // clear active partner
    activePartner = null;
    document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
  });
}

window.addEventListener('resize', () => {
  // adapt layout when resizing
  if (!currentUser) return;
  if (isMobileView()) {
    // mobile: if a partner is active show chat, else show contacts
    if (activePartner) {
      if (contactsSection) contactsSection.style.display = 'none';
      if (mainArea) mainArea.style.display = 'flex';
      if (btnBackToContacts) btnBackToContacts.style.display = 'inline-block';
    } else {
      if (contactsSection) contactsSection.style.display = 'flex';
      if (mainArea) mainArea.style.display = 'none';
      if (btnBackToContacts) btnBackToContacts.style.display = 'none';
    }
  } else {
    if (contactsSection) contactsSection.style.display = 'flex';
    if (mainArea) mainArea.style.display = 'flex';
    if (btnBackToContacts) btnBackToContacts.style.display = 'none';
  }
});

// Handle browser/device back button on mobile: when popstate occurs close chat (if open)
window.addEventListener('popstate', (e) => {
  // only intervene on mobile
  if (!isMobileView()) return;

  // if chat was open and state no longer indicates chatOpen, close chat UI
  const state = e.state;
  if (!state || !state.chatOpen) {
    if (activePartner) {
      if (contactsSection) contactsSection.style.display = 'flex';
      if (mainArea) mainArea.style.display = 'none';
      if (btnBackToContacts) btnBackToContacts.style.display = 'none';
      if (chatHeader) chatHeader.style.display = 'none';
      document.querySelectorAll('.contact-item').forEach(el => el.classList.remove('active'));
      activePartner = null;
    }
  }
});


/* ================== الرسائل / المحادثة ================== */

async function loadHistory(user1, user2) {
  try {
    const res = await fetch(
      `/api/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`
    );
    const data = await res.json();

    messagesDiv.innerHTML = "";
    if (!data.length) {
      messagesDiv.textContent = "لا توجد رسائل بعد بينكما، ابدأ المحادثة 😊";
      return;
    }

    data.forEach(m => {
      appendMessage(m.Username, m.Content, m.CreatedAt);
    });
  } catch (err) {
    console.error("Error loading history:", err);
    messagesDiv.textContent = "خطأ في تحميل الرسائل.";
  }
}

function appendMessage(senderUsername, text, createdAt) {
  const div = document.createElement("div");
  div.classList.add("msg");

  const isSelf = (currentUser && senderUsername === currentUser);
  div.classList.add(isSelf ? "self" : "other");

  const content = document.createElement("div");
  content.textContent = text;
  div.appendChild(content);

  const time = document.createElement("span");
  time.className = "time";
  const d = new Date(createdAt || Date.now());
  time.textContent = d.toLocaleTimeString();
  div.appendChild(time);

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* ================== تسجيل الدخول ================== */

btnLogin.addEventListener("click", async () => {
  const login    = loginIdentifierInput.value.trim();
  const password = loginPasswordInput.value;

  clearAuthMessage(); // تنظيف الرسائل القديمة

  if (!login || !password) {
    showAuthMessage("error", "الرجاء إدخال اسم المستخدم/الإيميل وكلمة المرور");
    return;
  }

  try {
    btnLogin.disabled = true; // 🔒 تعطيل زر تسجيل الدخول مؤقتًا
    btnLogin.textContent = "الرجاء الانتظار...";

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthMessage("error", data.error || "فشل تسجيل الدخول");
      return;
    }

    // ⭐ تم تسجيل الدخول بنجاح
    currentUser = data.user.Username;

    loginSection.style.display = "none";
    chatSection.style.display  = "block";

    await loadUsers();
    await loadPendingRequests();
    updateLayoutAfterLogin();

    loginPasswordInput.value = "";
    clearAuthMessage();
  } catch (err) {
    console.error("Error in login:", err);
    showAuthMessage("error", "خطأ في الاتصال بالسيرفر أثناء تسجيل الدخول");
  } finally {
    btnLogin.disabled = false;    // 🔓 إعادة تفعيل الزر
    btnLogin.textContent = "تسجيل الدخول";
  }
});

/* ================== إنشاء حساب جديد ================== */

btnRegister.addEventListener("click", async () => {
  const username = regUsernameInput.value.trim();
  const email    = regEmailInput.value.trim();
  const password = regPasswordInput.value;

  clearAuthMessage();

  if (!username) {
    showAuthMessage("error", "الرجاء إدخال اسم المستخدم");
    return;
  }
  if (!email) {
    showAuthMessage("error", "الرجاء إدخال البريد الإلكتروني");
    return;
  }
  if (!password || password.length < 6) {
    showAuthMessage("error", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    return;
  }

  try {
    btnRegister.disabled = true;

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthMessage("error", data.error || "حدث خطأ أثناء إنشاء الحساب");
      return;
    }

    // نجاح → تخزين بيانات الحساب المنتظر تفعيله
    pendingUserId    = data.userId;
    pendingUsername  = data.user.Username;
    pendingUserEmail = data.user.Email;

    showAuthMessage("success", data.message || "تم إنشاء الطلب، تم إرسال كود التفعيل إلى بريدك الإلكتروني.");

    // إظهار صندوق إدخال كود التفعيل
    verifyBox.style.display = "block";

    // إخفاء فورم التسجيل حتى لا يتشتت المستخدم
    if (authBody) {
      authBody.style.display = "none";
    }

    // تعبئة خانة الدخول تلقائياً
    loginIdentifierInput.value = pendingUserEmail;

    // بدء العدّاد لأول مرة: 60 ثانية قبل إظهار زر إعادة الإرسال
    startVerifyTimer(60);

  } catch (err) {
    console.error("Error in register:", err);
    showAuthMessage("error", "خطأ في الاتصال بالسيرفر أثناء التسجيل");
  } finally {
    btnRegister.disabled = false;
  }
});

/* ================== تفعيل البريد الإلكتروني ================== */

btnVerifyCode.addEventListener("click", async () => {
  const code = verifyCodeInput.value.trim();

  clearAuthMessage();

  if (!pendingUserId) {
    showAuthMessage("error", "لا يوجد حساب قيد التفعيل. الرجاء إنشاء حساب جديد أولاً.");
    return;
  }

  if (!code) {
    showAuthMessage("error", "الرجاء إدخال كود التفعيل");
    return;
  }

  try {
    btnVerifyCode.disabled = true;
    btnVerifyCode.textContent = "جاري التفعيل...";

    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: pendingUserId,
        code
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      showAuthMessage("error", data.error || "فشل تفعيل البريد الإلكتروني");
      return;
    }

    showAuthMessage("success", "تم تفعيل البريد الإلكتروني بنجاح. يتم الآن فتح الشات...");

    // اعتبار المستخدم الآن Logged in
    currentUser = pendingUsername;

    loginSection.style.display = "none";
    chatSection.style.display  = "block";

    // إخفاء صندوق التفعيل
    verifyBox.style.display = "none";
    verifyCodeInput.value   = "";

    // إلغاء أي عدّاد وإخفاء عناصره
    if (verifyTimerInterval) {
      clearInterval(verifyTimerInterval);
      verifyTimerInterval = null;
    }
    if (verifyTimer) {
      verifyTimer.style.display = "none";
    }
    if (btnResendCode) {
      btnResendCode.style.display = "none";
    }

    await loadUsers();
    await loadPendingRequests();
    updateLayoutAfterLogin();

    // تنظيف متغيرات التفعيل
    pendingUserId    = null;
    pendingUsername  = null;
    pendingUserEmail = null;

    clearAuthMessage();
  } catch (err) {
    console.error("Error in verify email:", err);
    showAuthMessage("error", "خطأ في الاتصال بالسيرفر أثناء تفعيل البريد");
  } finally {
    btnVerifyCode.disabled = false;
    btnVerifyCode.textContent = "تفعيل البريد الإلكتروني والدخول";
  }
});

/* ================== زر "إعادة إرسال الكود" ================== */

if (btnResendCode) {
  btnResendCode.addEventListener("click", async () => {
    clearAuthMessage();

    if (!pendingUserId) {
      showAuthMessage("error", "لا يوجد حساب قيد التفعيل. الرجاء إنشاء حساب جديد أولاً.");
      return;
    }

    const username = regUsernameInput.value.trim();
    const email    = regEmailInput.value.trim();
    const password = regPasswordInput.value;

    if (!username || !email || !password) {
      showAuthMessage("error", "تأكد من عدم تعديل بيانات التسجيل قبل إعادة إرسال الكود.");
      return;
    }

    try {
      btnResendCode.disabled = true;

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showAuthMessage("error", data.error || "لا يمكن إعادة إرسال الكود الآن.");
        return;
      }

      // تحديث بيانات pending لو تغيرت
      pendingUserId    = data.userId;
      pendingUsername  = data.user.Username;
      pendingUserEmail = data.user.Email;

      showAuthMessage("success", "تم إرسال كود تفعيل جديد إلى بريدك.");

      // تشغيل عدّاد جديد من 60 ثانية
      startVerifyTimer(60);

    } catch (err) {
      console.error("Error in resend code:", err);
      showAuthMessage("error", "خطأ في الاتصال بالسيرفر أثناء إعادة إرسال الكود");
    } finally {
      btnResendCode.disabled = false;
    }
  });
}

/* ================== فتح محادثة ================== */

// فتح المحادثة يتم الآن بالنقر على عنصر من قائمة جهات الاتصال (`.contact-item`)

/* ================== استقبال الرسائل ================== */

socket.on("chatMessage", (msg) => {
  if (!currentUser || !activePartner) return;

  const pair1 = [msg.from, msg.to].sort().join("-");
  const pair2 = [currentUser, activePartner].sort().join("-");
  if (pair1 !== pair2) return;

  appendMessage(msg.from, msg.text, msg.createdAt);
});

/* ================== إرسال رسالة ================== */

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;
  if (!currentUser || !activePartner) {
    alert("اختر أولاً الشخص الذي تريد محادثته");
    return;
  }

  socket.emit("chatMessage", {
    from: currentUser,
    to: activePartner,
    text
  });

  messageInput.value = "";
  messageInput.focus();
});

/* ================== إدارة جهات الاتصال ================== */

// التبديل بين تبويبات جهات الاتصال
contactsTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-tab");

    contactsTabs.forEach(t => t.classList.remove("contacts-tab-active"));
    tab.classList.add("contacts-tab-active");

    contactsPanels.forEach(panel => {
      const panelName = panel.getAttribute("data-panel");
      if (panelName === target) {
        panel.classList.add("contacts-panel-active");
      } else {
        panel.classList.remove("contacts-panel-active");
      }
    });

    // عند فتح تبويب طلبات الصداقة، قم بتحميل الطلبات
    if (target === "requests") {
      loadPendingRequests();
    }
  });
});

// إرسال طلب صداقة
if (btnSendContactRequest) {
  btnSendContactRequest.addEventListener("click", async () => {
    const username = newContactUsernameInput.value.trim();

    if (!username) {
      showContactMessage("error", "الرجاء إدخال اسم المستخدم");
      return;
    }

    if (!currentUser) {
      showContactMessage("error", "يجب تسجيل الدخول أولاً");
      return;
    }

    // التحقق من عدم إضافة نفسك
    if (username.toLowerCase() === currentUser.toLowerCase()) {
      showContactMessage("error", "لا يمكنك إضافة نفسك");
      return;
    }

    try {
      btnSendContactRequest.disabled = true;
      btnSendContactRequest.textContent = "جاري الإرسال...";

      const res = await fetch("/api/contacts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderUsername: currentUser,
          username: username
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // عرض رسالة الخطأ من السيرفر
        const errorMessage = data.error || "فشل إرسال طلب الصداقة";
        showContactMessage("error", errorMessage);
        return;
      }

      if (!data.success) {
        showContactMessage("error", data.error || "فشل إرسال طلب الصداقة");
        return;
      }

      showContactMessage("success", data.message || "تم إرسال طلب الصداقة بنجاح");
      newContactUsernameInput.value = "";

      // تحديث قائمة جهات الاتصال بعد إرسال الطلب
      await loadUsers();

    } catch (err) {
      console.error("Error sending contact request:", err);
      showContactMessage("error", "خطأ في الاتصال بالسيرفر");
    } finally {
      btnSendContactRequest.disabled = false;
      btnSendContactRequest.textContent = "إرسال طلب صداقة";
    }
  });
}

// عرض رسالة في نموذج إضافة جهة اتصال
function showContactMessage(type, text) {
  if (!contactRequestMessage) return;
  contactRequestMessage.style.display = "block";
  contactRequestMessage.textContent = text;
  contactRequestMessage.className = "contact-message";
  contactRequestMessage.classList.add(type);

  // إخفاء الرسالة بعد 5 ثوان
  setTimeout(() => {
    contactRequestMessage.style.display = "none";
  }, 5000);
}

// جلب طلبات الصداقة الواردة
async function loadPendingRequests() {
  if (!currentUser) return;

  try {
    pendingRequestsList.innerHTML = '<p class="loading-text">جاري التحميل...</p>';

    const res = await fetch(`/api/contacts/requests/${encodeURIComponent(currentUser)}`);
    const data = await res.json();

    if (!res.ok) {
      pendingRequestsList.innerHTML = '<p class="error-text">خطأ في تحميل الطلبات</p>';
      return;
    }

    if (data.length === 0) {
      pendingRequestsList.innerHTML = '<p class="empty-requests">لا توجد طلبات صداقة واردة</p>';
      return;
    }

    pendingRequestsList.innerHTML = "";

    data.forEach(request => {
      const requestItem = document.createElement("div");
      requestItem.className = "request-item";
      requestItem.innerHTML = `
        <div class="request-item-info">
          <div class="request-item-username">${request.FromUser}</div>
        </div>
        <div class="request-item-actions">
          <button class="btn-accept" data-contact-id="${request.ContactId}">قبول</button>
          <button class="btn-reject" data-contact-id="${request.ContactId}">رفض</button>
        </div>
      `;

      // إضافة مستمعي الأحداث للأزرار
      const acceptBtn = requestItem.querySelector(".btn-accept");
      const rejectBtn = requestItem.querySelector(".btn-reject");

      acceptBtn.addEventListener("click", () => handleAcceptRequest(request.ContactId));
      rejectBtn.addEventListener("click", () => handleRejectRequest(request.ContactId));

      pendingRequestsList.appendChild(requestItem);
    });

  } catch (err) {
    console.error("Error loading pending requests:", err);
    pendingRequestsList.innerHTML = '<p class="error-text">خطأ في تحميل الطلبات</p>';
  }
}

// قبول طلب صداقة
async function handleAcceptRequest(contactId) {
  try {
    const res = await fetch("/api/contacts/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.error || "فشل قبول طلب الصداقة");
      return;
    }

    // تحديث القوائم
    await loadPendingRequests();
    await loadUsers();

    alert("تم قبول طلب الصداقة بنجاح");

  } catch (err) {
    console.error("Error accepting request:", err);
    alert("خطأ في الاتصال بالسيرفر");
  }
}

// رفض طلب صداقة
async function handleRejectRequest(contactId) {
  if (!confirm("هل أنت متأكد من رفض طلب الصداقة؟")) {
    return;
  }

  try {
    const res = await fetch("/api/contacts/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.error || "فشل رفض طلب الصداقة");
      return;
    }

    // تحديث القائمة
    await loadPendingRequests();

    alert("تم رفض طلب الصداقة");

  } catch (err) {
    console.error("Error rejecting request:", err);
    alert("خطأ في الاتصال بالسيرفر");
  }
}

/* ================== تهيئة عند تحميل الصفحة ================== */

clearAuthMessage();
loadUsers();

/* ---------------------------------------------------------------------------
  Mobile viewport & keyboard handling (VisualViewport)

  Goals:
  - Keep `#chatHeader` fixed at top of screen (so it doesn't move with keyboard).
  - Keep `#chatForm` (input bar) immediately above the virtual keyboard.
  - Make `#messages` fill the area between header and input, with no extra
    white space when keyboard opens on iOS or Android.
  - Scroll messages to bottom when input focuses.

  Strategy:
  - Use `window.visualViewport` when available to measure the layout viewport
    height and estimate keyboard height (window.innerHeight - visualViewport.height).
  - Write CSS variables `--vh` (1% of visible height) and `--keyboard-height`
    which are used by the mobile CSS rules in `style.css`.
  - Debounce updates and respond to focus/blur events on the input.
--------------------------------------------------------------------------- */
(function(){
  const root = document.documentElement;
  const messagesEl = document.getElementById('messages');
  const inputEl = document.getElementById('message');
  const chatHeaderEl = document.getElementById('chatHeader');

  // Write the CSS variables: --vh (1% of visual viewport) and --keyboard-height
  function writeCssVars(vhPx, keyboardPx){
    root.style.setProperty('--vh', `${vhPx * 0.01}px`);
    root.style.setProperty('--keyboard-height', `${keyboardPx}px`);
  }

  // Compute viewport and keyboard sizes using visualViewport when available.
  function computeViewportMetrics(){
    if (window.visualViewport){
      const vv = window.visualViewport;
      // vv.height is the layout viewport height (visible area excluding certain UI)
      const visibleHeight = vv.height;
      // estimate keyboard height: difference between window.innerHeight and visualViewport.height
      const estimatedKeyboard = Math.max(0, window.innerHeight - vv.height - (vv.offsetTop || 0));
      writeCssVars(visibleHeight, estimatedKeyboard);
    } else {
      // fallback for older browsers: use window.innerHeight and zero keyboard
      writeCssVars(window.innerHeight, 0);
    }
  }

  // Debounce helper to avoid thrashing during rapid viewport events
  let timer = null;
  function debouncedCompute(delay = 60){
    clearTimeout(timer);
    timer = setTimeout(computeViewportMetrics, delay);
  }

  // Keep values up to date on resize/orientation and visualViewport changes
  window.addEventListener('resize', debouncedCompute, { passive: true });
  window.addEventListener('orientationchange', debouncedCompute, { passive: true });
  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', debouncedCompute);
    window.visualViewport.addEventListener('scroll', debouncedCompute);
  }

  // When the input gains focus: wait a bit (keyboard show), recompute, scroll messages
  if (inputEl){
    inputEl.addEventListener('focus', () => {
      // Delay helps on iOS where keyboard animation takes some time
      setTimeout(() => {
        computeViewportMetrics();
        // scroll to bottom so latest messages are visible above the input
        try { if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; } catch(e){}
        // ensure header remains visible (header is fixed, but this helps some browsers)
        try { if (chatHeaderEl) chatHeaderEl.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch(e){}
      }, 260);
    });

    // On blur: recompute after keyboard hides
    inputEl.addEventListener('blur', () => { setTimeout(computeViewportMetrics, 120); });
  }

  // Initial compute
  computeViewportMetrics();

  // Expose helper for debugging or manual recalculation
  window.__aziziChatViewport = { computeViewportMetrics };
})();
