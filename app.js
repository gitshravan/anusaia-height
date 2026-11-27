/* Anusaia Height website. Data lives in config.js (window.SITE). */
(function () {
  "use strict";
  var S = window.SITE, $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Floor bands on the tower picture, in % of the picture (top, bottom), level 1 = first floor above the stilt */
  var BANDS = { 7: [3.4, 21.0], 6: [21.0, 32.2], 5: [32.2, 43.7], 4: [43.7, 55.2], 3: [55.2, 66.7], 2: [66.7, 77.6], 1: [77.6, 89.9] };
  var TX0 = 37.1, TW = 20.0; // the tower's left edge and width, %

  function typeLine(ids) {
    return ids.map(function (t) { var T = S.types[t]; return T.config + " (" + T.name + ")"; }).join("  ·  ");
  }

  /* ---------- the sky: real clouds filmed in real time (Pexels 11519739, 50 fps), slow by nature ---------- */
  var skyV = document.querySelector("video.sky"), SKY_RATE = 1;
  if (skyV) { var setRate = function () { skyV.playbackRate = SKY_RATE; }; setRate(); skyV.addEventListener("loadedmetadata", setRate); skyV.addEventListener("play", setRate); }

  /* ---------- the tower ---------- */
  var floorsEl = $("floors"), hero = $("tower"), stage = $("stage"), current = 4;
  Object.keys(BANDS).sort(function (a, b) { return b - a; }).forEach(function (lv) {
    var b = BANDS[lv], h = b[1] - b[0];
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "floor"; btn.dataset.level = lv;
    btn.style.top = b[0] + "%"; btn.style.height = h + "%";
    btn.setAttribute("aria-label", "Level " + lv + ": " + typeLine(S.floors[lv] || []) + ". Step inside");
    var lit = document.createElement("span"); lit.className = "lit";
    lit.style.left = (-TX0 / TW * 100) + "%"; lit.style.width = (100 / TW * 100) + "%";
    lit.style.top = (-b[0] / h * 100) + "%"; lit.style.height = (100 / h * 100) + "%"; lit.style.backgroundSize = "100% 100%";
    btn.style.overflow = "visible";
    var clip = document.createElement("span"); clip.style.cssText = "position:absolute;inset:0;overflow:hidden;border-radius:4px"; clip.appendChild(lit);
    var tag = document.createElement("span"); tag.className = "tag"; tag.textContent = "LEVEL " + lv;
    btn.appendChild(clip); btn.appendChild(tag);
    btn.addEventListener("mouseenter", function () { setLevel(+lv); });
    btn.addEventListener("focus", function () { setLevel(+lv); });
    btn.addEventListener("click", function () { if (typeof stopDemo === "function") stopDemo(); setLevel(+lv); enter(+lv); });
    floorsEl.appendChild(btn);
  });

  function setLevel(lv) {
    current = lv;
    $("lvlNum").textContent = lv;
    $("lvlUnits").textContent = typeLine(S.floors[lv] || []);
    var sl = $("lvlSlider"); sl.value = lv; sl.setAttribute("aria-valuetext", "Level " + lv);
    [].forEach.call(floorsEl.children, function (f) { f.classList.toggle("on", +f.dataset.level === lv); });
  }
  $("lvlSlider").addEventListener("input", function (e) { setLevel(+e.target.value); });
  $("lvlSlider").addEventListener("keydown", function (e) { if (e.key === "Enter") enter(current); });
  $("enterBtn").addEventListener("click", function () { enter(current); });
  $("nightBtn").addEventListener("click", function (e) {
    var on = hero.classList.toggle("night"); e.currentTarget.setAttribute("aria-pressed", on); e.currentTarget.textContent = on ? "Day view" : "Night view";
  });
  setLevel(4);

  /* touch screens have no hover: walk the light up the floors until the visitor touches one */
  var touch = window.matchMedia && window.matchMedia("(hover: none), (max-width: 900px)").matches, demo = null;
  function stopDemo() { if (demo) { clearInterval(demo); demo = null; } hero.classList.add("touched"); }
  if (touch && !reduce) {
    var seq = [2, 3, 4, 5, 6, 7, 6, 5, 4, 3], si = 0;
    demo = setInterval(function () { setLevel(seq[si++ % seq.length]); }, 1700);
    ["touchstart", "pointerdown", "wheel"].forEach(function (ev) { hero.addEventListener(ev, stopDemo, { once: true, passive: true }); });
    $("lvlSlider").addEventListener("input", stopDemo);
    setTimeout(function () { if (demo) { clearInterval(demo); demo = null; setLevel(4); } }, 16000); // stop walking after a while; the hint stays until a touch
  }

  /* ---------- inside: the 360 rooms ---------- */
  var viewer = null, curType = null, curRoom = null, lastFocus = null;
  function enter(lv, typeId) {
    var types = S.floors[lv] || Object.keys(S.types);
    typeId = typeId || types[0];
    lastFocus = document.activeElement;
    var b = BANDS[lv] || [40, 60];
    if (reduce) return openInside(types, typeId);
    stage.style.transformOrigin = "47.1% " + ((b[0] + b[1]) / 2) + "%";
    hero.classList.add("flying");
    stage.style.transform = "scale(5.5)"; stage.style.filter = "blur(2px)";
    setTimeout(function () { openInside(types, typeId); }, 1000);
  }
  function resetTower() {
    hero.classList.remove("flying"); stage.style.transform = ""; stage.style.filter = "";
  }
  function openInside(types, typeId) {
    var box = $("inside"); box.hidden = false; document.body.style.overflow = "hidden";
    var ts = $("typeSwitch"); ts.innerHTML = "";
    if (types.length > 1) types.forEach(function (t) {
      var bt = document.createElement("button"); bt.type = "button"; bt.setAttribute("role", "tab");
      bt.textContent = S.types[t].config + " · " + S.types[t].name; bt.dataset.type = t;
      bt.addEventListener("click", function () { showType(t); }); ts.appendChild(bt);
    });
    showType(typeId);
    setTimeout(resetTower, 200);
    $("backBtn").focus();
  }
  function showType(t) {
    curType = t; var T = S.types[t];
    [].forEach.call($("typeSwitch").children, function (b) { b.setAttribute("aria-selected", b.dataset.type === t); });
    $("insideType").textContent = T.config + " · " + T.name;
    var rt = $("roomTabs"); rt.innerHTML = "";
    T.rooms.forEach(function (r) {
      var bt = document.createElement("button"); bt.type = "button"; bt.setAttribute("role", "tab"); bt.textContent = r[1]; bt.dataset.room = r[0];
      bt.addEventListener("click", function () { showRoom(r[0]); }); rt.appendChild(bt);
    });
    var scenes = {};
    T.rooms.forEach(function (r) {
      scenes[r[0]] = { type: "equirectangular", panorama: "assets/rooms/" + r[0] + ".jpg", hfov: 105, minHfov: 50, maxHfov: 120, yaw: 0, pitch: -2 };
    });
    if (viewer) { viewer.destroy(); viewer = null; }
    if (!window.pannellum) { $("roomTitle").textContent = "Loading…"; return setTimeout(function () { showType(t); }, 300); }
    viewer = window.pannellum.viewer("pano", {
      default: { firstScene: T.rooms[0][0], autoLoad: true, sceneFadeDuration: 600, showControls: true, showFullscreenCtrl: true, compass: false,
                 autoRotate: reduce ? 0 : -2, autoRotateInactivityDelay: 4000, keyboardZoom: true, mouseZoom: true, friction: 0.15 },
      scenes: scenes
    });
    viewer.on("scenechange", function (id) { markRoom(id); });
    markRoom(T.rooms[0][0]);
  }
  function showRoom(id) { if (viewer && id !== curRoom) viewer.loadScene(id); markRoom(id); }
  function markRoom(id) {
    curRoom = id; var T = S.types[curType];
    var r = T.rooms.filter(function (x) { return x[0] === id; })[0];
    $("roomTitle").textContent = r ? r[1] : "";
    [].forEach.call($("roomTabs").children, function (b) { b.setAttribute("aria-selected", b.dataset.room === id); });
  }
  function closeInside() {
    if (viewer) { viewer.destroy(); viewer = null; }
    $("inside").hidden = true; document.body.style.overflow = ""; resetTower();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("backBtn").addEventListener("click", closeInside);
  $("insideReg").addEventListener("click", function () {
    var t = curType; closeInside(); var sel = $("interestSel"); if (sel && t) sel.value = t;
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !$("inside").hidden) closeInside(); });

  /* ---------- residence cards ---------- */
  var cards = $("typeCards");
  Object.keys(S.types).forEach(function (t) {
    var T = S.types[t], floors = Object.keys(S.floors).filter(function (f) { return S.floors[f].indexOf(t) >= 0; });
    var c = document.createElement("article"); c.className = "card";
    c.innerHTML = '<img loading="lazy" width="320" height="240" alt="">' +
      '<div class="body"><p class="kicker"></p><h3></h3><p></p><button class="btn btn-gold small" type="button">Explore in 360°</button></div>';
    var img = c.querySelector("img"); img.src = "assets/rooms/" + T.rooms[0][0] + "-thumb.jpg"; img.alt = T.config + " " + T.name + ", " + T.rooms[0][1];
    c.querySelector(".kicker").textContent = T.config; c.querySelector("h3").textContent = T.name;
    c.querySelector("p:not(.kicker)").textContent = T.rooms.map(function (r) { return r[1]; }).join(" · ") + (floors.length ? "  —  Level " + (floors.length > 1 ? floors[0] + "–" + floors[floors.length - 1] : floors[0]) : "");
    c.querySelector("button").addEventListener("click", function () {
      var lv = floors.length ? +floors[0] : 1; lastFocus = this;
      openInside(S.floors[lv] || [t], t);
    });
    cards.appendChild(c);
  });

  /* ---------- facts, location ---------- */
  if (S.priceFrom) { $("priceVal").textContent = S.priceFrom; $("priceNote").textContent = "starting, " + (S.priceNote || ""); }
  else $("priceFact").style.display = "none";
  $("siteAddr").textContent = S.address;
  var nl = $("nearby");
  S.nearby.forEach(function (n) { var li = document.createElement("li"); li.innerHTML = "<span></span><b></b>"; li.firstChild.textContent = n[0]; li.lastChild.textContent = n[1] + " min"; nl.appendChild(li); });
  $("mapLink").href = "https://www.google.com/maps/search/?api=1&query=" + S.lat + "," + S.lon;
  $("dirBtn").href = "https://www.google.com/maps/dir/?api=1&destination=" + S.lat + "," + S.lon;

  /* ---------- contact (empty fields stay as blank space until filled in config.js) ---------- */
  var tel = (S.phone || "").replace(/[^\d+]/g, ""), wa = (S.whatsapp || "").replace(/\D/g, "");
  if (S.phone) { $("cPhone").textContent = S.phone; $("cPhone").href = "tel:" + tel; }
  if (wa) { $("cWa").textContent = "+" + wa.replace(/^91(\d{5})(\d{5})$/, "91 $1 $2"); $("cWa").href = "https://wa.me/" + wa; }
  if (S.email) { $("cEmail").textContent = S.email; $("cEmail").href = "mailto:" + S.email; }
  $("cOffice").textContent = S.officeAddress || ""; $("cHours").textContent = S.officeHours || "";
  $("devName").textContent = S.developer; $("rera").textContent = S.reraNumber || "";
  var fl = $("floatBtns");
  if (wa) fl.insertAdjacentHTML("beforeend", '<a class="wa" target="_blank" rel="noopener" aria-label="Chat on WhatsApp" href="https://wa.me/' + wa + '?text=' + encodeURIComponent("Hi, I am interested in " + S.name + ".") + '"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7a11.6 11.6 0 0 1-4.6-4.1c-.3-.5-1-1.5-1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.4.6-.3.3c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z"/></svg></a>');
  if (S.phone) fl.insertAdjacentHTML("beforeend", '<a class="ph" aria-label="Call us" href="tel:' + tel + '"><svg viewBox="0 0 24 24" fill="#16120b"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></svg></a>');

  /* ---------- enquiry form ---------- */
  var sel = $("interestSel");
  Object.keys(S.types).forEach(function (t) { var o = document.createElement("option"); o.value = t; o.textContent = S.types[t].config + " · " + S.types[t].name; sel.appendChild(o); });
  sel.insertAdjacentHTML("beforeend", '<option value="any">Not sure yet</option>');
  $("enquiry").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, msg = $("formMsg"), d = { name: f.name.value.trim(), phone: f.phone.value.trim(), interest: sel.options[sel.selectedIndex].text, message: f.message.value.trim(), project: S.name };
    msg.className = "form-msg";
    if (!d.name || !/^[0-9+\s-]{8,}$/.test(d.phone)) { msg.textContent = "Please enter your name and a valid phone number."; msg.classList.add("err"); return; }
    var text = "Hi, I am " + d.name + " (" + d.phone + "). I am interested in " + S.name + ": " + d.interest + "." + (d.message ? " " + d.message : "");
    function done() { msg.textContent = "Thank you, " + d.name.split(" ")[0] + ". Our team will call you shortly."; msg.classList.add("ok"); f.reset(); }
    if (S.formEndpoint) {
      fetch(S.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
        .then(function (r) { if (!r.ok) throw 0; done(); })
        .catch(function () { msg.textContent = "Sorry, that did not go through. Please try again."; msg.classList.add("err"); });
    } else if (wa) { window.open("https://wa.me/" + wa + "?text=" + encodeURIComponent(text), "_blank", "noopener"); done(); }
    else if (S.email) { location.href = "mailto:" + S.email + "?subject=" + encodeURIComponent("Enquiry: " + S.name) + "&body=" + encodeURIComponent(text); done(); }
    else if (tel) {
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) { location.href = "sms:" + tel + (/iPhone|iPad|iPod/i.test(navigator.userAgent) ? "&" : "?") + "body=" + encodeURIComponent(text); done(); }
      else { msg.innerHTML = ""; msg.append("Thank you! Please call us on ", Object.assign(document.createElement("a"), { href: "tel:" + tel, textContent: S.phone }), " and we will help you right away."); msg.classList.add("ok"); }
    }
    else { msg.textContent = "Enquiries open soon. Please check back shortly."; msg.classList.add("err"); }
  });

  /* ---------- share links: #floor-3 opens level 3 inside, #type-B opens that residence ---------- */
  function fromHash() {
    var m = /^#floor-(\d)$/.exec(location.hash), t = /^#type-([A-Z])$/.exec(location.hash);
    if (m && S.floors[m[1]]) { setLevel(+m[1]); openInside(S.floors[m[1]], S.floors[m[1]][0]); }
    else if (t && S.types[t[1]]) { var lv = Object.keys(S.floors).filter(function (f) { return S.floors[f].indexOf(t[1]) >= 0; })[0] || 1; openInside(S.floors[lv] || [t[1]], t[1]); }
  }
  window.addEventListener("load", fromHash);

  /* ---------- header turns solid after the tower ---------- */
  var top = $("top");
  function onScroll() { top.classList.toggle("solid", window.scrollY > window.innerHeight * 0.6); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
