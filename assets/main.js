(function () {
  "use strict";

  // Mobile navigation
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.setAttribute("data-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    var mq = window.matchMedia("(max-width: 960px)");
    var sync = function () { if (!mq.matches) { nav.removeAttribute("data-open"); toggle.setAttribute("aria-expanded", "false"); } else if (!nav.hasAttribute("data-open")) { setOpen(false); } };
    sync();
    if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
    toggle.addEventListener("click", function () { setOpen(nav.getAttribute("data-open") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.getAttribute("data-open") === "true") { setOpen(false); toggle.focus(); } });
    nav.addEventListener("click", function (e) { if (e.target.closest("a") && mq.matches) setOpen(false); });
  }

  // Copyright year
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = String(new Date().getFullYear());

  // Copy-to-clipboard buttons
  function copyText(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1600); };
    var fallback = function () {
      var target = btn.getAttribute("data-select") && document.getElementById(btn.getAttribute("data-select"));
      if (target) { var r = document.createRange(); r.selectNodeContents(target); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Selected — press Ctrl/Cmd+C"; }
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    } catch (e) { fallback(); }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-copy]");
    if (b) { e.preventDefault(); copyText(b.getAttribute("data-copy"), b); }
  });

  // Enquiry form
  var form = document.getElementById("enquiry-form");
  if (!form) return;

  var EMAIL = form.getAttribute("data-to");
  var serviceSel = document.getElementById("service");

  // Preselect a service from a link such as contact.html#courier
  var preset = (location.hash || "").replace("#", "");
  if (preset && serviceSel.querySelector('option[value="' + preset + '"]')) {
    serviceSel.value = preset;
  }

  var fields = {
    name: { el: document.getElementById("full-name"), check: function (v) { return v.trim().length >= 2 ? "" : "Enter your full name."; } },
    email: { el: document.getElementById("email"), check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address, for example name@example.com."; } },
    service: { el: serviceSel, check: function (v) { return v ? "" : "Choose the service you are enquiring about."; } },
    message: { el: document.getElementById("message"), check: function (v) { return v.trim().length >= 15 ? "" : "Add a few details about your request (at least 15 characters)."; } }
  };

  function validate(key) {
    var f = fields[key];
    var msg = f.check(f.el.value);
    var err = document.getElementById(f.el.id + "-error");
    f.el.setAttribute("aria-invalid", msg ? "true" : "false");
    err.textContent = msg;
    err.hidden = !msg;
    return !msg;
  }
  Object.keys(fields).forEach(function (k) {
    fields[k].el.addEventListener("blur", function () { if (fields[k].el.value) validate(k); });
    fields[k].el.addEventListener("input", function () { if (fields[k].el.getAttribute("aria-invalid") === "true") validate(k); });
  });

  var status = document.getElementById("form-status");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true, firstBad = null;
    Object.keys(fields).forEach(function (k) { if (!validate(k)) { ok = false; if (!firstBad) firstBad = fields[k].el; } });
    if (!ok) { firstBad.focus(); return; }

    var serviceLabel = serviceSel.options[serviceSel.selectedIndex].text;
    var name = fields.name.el.value.trim();
    var subject = "Service enquiry: " + serviceLabel + " — " + name;
    var body =
      "Full name: " + name + "\n" +
      "Email address: " + fields.email.el.value.trim() + "\n" +
      "Service: " + serviceLabel + "\n\n" +
      "Enquiry:\n" + fields.message.el.value.trim() + "\n";
    var mailto = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    document.getElementById("status-subject").textContent = subject;
    document.getElementById("status-body").textContent = body;
    document.getElementById("open-mail").setAttribute("href", mailto);
    document.getElementById("copy-enquiry").setAttribute("data-copy", "To: " + EMAIL + "\nSubject: " + subject + "\n\n" + body);
    status.hidden = false;
    status.focus();
  });
})();
