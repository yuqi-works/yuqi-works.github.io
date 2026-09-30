/* Static renderer for yuqi.works/quote — no framework, uses QuoteCore (same pricing code as the app).
   Handles several instances on one page: the homepage embeds the automotive builder in the dark top half
   and the real-estate builder in the light bottom half; the standalone /quote/ pages use one full instance. */
(() => {
  const BASE = "/quote";
  let C = null;
  const ICONS = {
    up: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    mail: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    minus: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
    plus: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  };

  const cls = (...values) => values.filter(Boolean).join(" ");
  const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const href = (path) => `${BASE}${path}`;

  /** One configurator + quote panel, mounted into #cfg.mount. Own state, own click handling. */
  function createInstance(cfg) {
    const mount = document.getElementById(cfg.mount);
    if (!mount) return null;

    const uid = String(cfg.mount).replace(/[^A-Za-z0-9_-]/g, "") || "q";
    const embed = !!cfg.embed;
    const isProperty = cfg.category === "property";
    let locale = cfg.locale === "zh" ? "zh" : "en";
    let zh = locale === "zh";
    let t = C.getCopy(locale);
    let money = zh ? C.moneyZh : C.moneyEn;
    let copied = false;
    let input = isProperty
      ? { shootType: "property", vehicles: 1, photos: 20, video: "none", extras: [], propertySize: "small" }
      : { shootType: "listing", vehicles: 1, photos: 15, video: "none", extras: [], propertySize: "small" };

    const domId = (name) => `${name}-${uid}`;
    const carPhotoConfig = (shootType, vehicles) => C.getCarPhotoConfig(shootType, vehicles);
    const photoConfig = () => (isProperty ? C.getPropertyPhotoConfig(input.propertySize) : carPhotoConfig(input.shootType, input.vehicles));
    const photoChoices = () => (isProperty ? C.getPropertyPhotoChoices(input.propertySize) : C.getCarPhotoChoices(input.shootType, input.vehicles));
    const quote = () => (zh ? C.calculateQuoteZh(input) : C.calculateQuote(input));
    const videoOptions = () => (isProperty ? t.videosProperty : t.videosAuto);
    const extraOptions = () => (isProperty ? t.extrasProperty : t.extrasAuto);

    function inquiryText() {
      const q = quote();
      const sizeDetail = (t.sizes.find((size) => size.value === input.propertySize) || t.sizes[0]).detail;
      const sep = zh ? "：" : ": ";
      return [
        `YUQI WORKS — ${isProperty ? t.inquiry.titleProperty : t.inquiry.titleAuto}${zh ? "询价" : " photography inquiry"}`,
        `${t.inquiry.package}${sep}${q.packageName}`,
        `${t.inquiry.shoot}${sep}${q.shootLabel}`,
        isProperty ? `${t.inquiry.propertySize}${sep}${sizeDetail}` : `${t.inquiry.vehicles}${sep}${input.vehicles}`,
        t.inquiry.photosLine(isProperty, q.deliveredPhotos),
        `${t.inquiry.video}${sep}${q.videoLabel}`,
        `${t.inquiry.extras}${sep}${q.extraLabels.length ? q.extraLabels.join(zh ? "、" : ", ") : t.inquiry.none}`,
        t.inquiry.estimateLine(money(q.total)),
        t.inquiry.blank,
        isProperty ? t.inquiry.locationPromptProperty : t.inquiry.locationPromptAuto,
        t.inquiry.blank,
        t.inquiry.contactPrompt,
      ].join("\n");
    }

    const mailto = () => {
      const subject = isProperty ? t.inquiry.subjectProperty : t.inquiry.subjectAuto;
      return `mailto:yuqiworks@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(inquiryText())}`;
    };

    function shootCards() {
      return t.shoots.map((option, index) => `
      <label class="${cls("shoot-card", input.shootType === option.value && "selected")}" data-shoot="${option.value}" role="radio" aria-checked="${input.shootType === option.value}">
        <span class="shoot-top"><span>${esc(option.tag)}</span><span class="radio-indicator" aria-hidden="true"></span></span>
        <strong>${esc(option.title)}</strong>
        <span class="shoot-desc">${esc(option.description)}</span>
        <span class="starting">${esc(t.from.replace("{price}", option.starting))}</span>
      </label>`).join("");
    }

    function sizeCards() {
      return t.sizes.map((size) => `
      <label class="${cls("size-choice", input.propertySize === size.value && "selected")}" data-size="${size.value}" role="radio" aria-checked="${input.propertySize === size.value}">
        <strong>${esc(size.title)}</strong><small>${esc(size.detail)}</small>
      </label>`).join("");
    }

    const isP = (value) => String(input.photos) === String(value);

    function photoBlock() {
      const config = photoConfig();
      const note = isProperty
        ? t.scope.photosNoteBulk(String(config.included), money(config.extraPrice * 10))
        : t.scope.photosNoteExtra(String(config.included), money(config.extraPrice));
      return `
      <div class="scope-block">
        <span id="${domId("photo-label")}" class="input-label">${esc(t.scope.photosLabel)}</span>
        <p>${esc(note)}</p>
        <div class="photo-choices" role="radiogroup" aria-labelledby="${domId("photo-label")}">
          ${photoChoices().map((count) => `<button type="button" class="${cls("photo-choice", isP(count) && "selected")}" data-photos="${count}" role="radio" aria-checked="${isP(count)}">${count}</button>`).join("")}
        </div>
      </div>`;
    }

    function videoList() {
      return videoOptions().map((option) => `
      <label class="${cls("video-option", input.video === option.value && "selected")}" data-video="${option.value}" role="radio" aria-checked="${input.video === option.value}">
        <span class="video-radio" aria-hidden="true"></span>
        <span class="video-copy"><strong>${esc(option.title)}</strong><small>${esc(option.description)}</small></span>
        <span class="option-price">${esc(option.price)}</span>
      </label>`).join("");
    }

    function extraList() {
      return extraOptions().map((option) => `
      <label class="${cls("extra-option", input.extras.includes(option.value) && "selected")}" data-extra="${option.value}" role="checkbox" aria-checked="${input.extras.includes(option.value)}">
        <span class="extra-check" aria-hidden="true">${input.extras.includes(option.value) ? ICONS.check : ""}</span>
        <span class="video-copy"><strong>${esc(option.title)}</strong><small>${esc(option.detail)}</small></span>
        <span class="option-price">${esc(option.price)}</span>
      </label>`).join("");
    }

    /* configurator + live quote panel — same markup in both modes (the site styles it via CSS variables) */
    function calculatorMarkup() {
      const q = quote();
      return `
        <div class="workspace">
          <section class="configurator" aria-label="${esc(t.aria.configurator)}">
            <div class="section-heading"><span>${esc(isProperty ? t.sections.briefProperty[0] : t.sections.brief[0])}</span><h2>${esc(isProperty ? t.sections.briefProperty[1] : t.sections.brief[1])}</h2></div>
            ${isProperty
              ? `<div class="size-choices property-size-grid" role="radiogroup" aria-label="${esc(t.aria.sizeGroup)}">${sizeCards()}</div>`
              : `<div class="shoot-grid" role="radiogroup" aria-label="${esc(t.aria.shootGroup)}">${shootCards()}</div>`}
            <div class="section-divider"></div>
            <div class="section-heading"><span>${esc(t.sections.scope[0])}</span><h2>${esc(t.sections.scope[1])}</h2></div>
            <div class="scope-grid${isProperty ? " property-scope" : ""}">
              ${isProperty ? "" : `
              <div class="scope-block">
                <span id="${domId("vehicle-label")}" class="input-label">${esc(t.scope.vehiclesLabel)}</span>
                <p>${esc(t.scope.vehiclesNote)}</p>
                <div class="stepper" role="group" aria-labelledby="${domId("vehicle-label")}">
                  <button type="button" class="stepper-btn" data-vehicles="-1" ${input.vehicles <= 1 ? "disabled" : ""} aria-label="${esc(t.scope.removeVehicle)}">${ICONS.minus}</button>
                  <output aria-live="polite">${input.vehicles}</output>
                  <button type="button" class="stepper-btn" data-vehicles="1" ${input.vehicles >= 6 ? "disabled" : ""} aria-label="${esc(t.scope.addVehicle)}">${ICONS.plus}</button>
                </div>
              </div>`}
              ${photoBlock()}
            </div>
            <p class="scope-note">${esc(isProperty ? t.scope.noteProperty : t.scope.noteAuto)}</p>
            <div class="section-divider"></div>
            <div class="section-heading"><span>${esc(t.sections.motion[0])}</span><h2>${esc(t.sections.motion[1])}</h2></div>
            <div class="video-list" role="radiogroup" aria-label="${esc(t.aria.videoGroup || "")}">${videoList()}</div>
            <div class="section-divider"></div>
            <div class="section-heading"><span>${esc(t.sections.extras[0])}</span><h2>${esc(t.sections.extras[1])}</h2></div>
            <div class="extra-list">${extraList()}</div>
          </section>
          <aside class="quote-column" id="${domId("estimate")}" aria-label="${esc(t.aria.estimate)}">
            <div class="quote-panel">
              <div class="image-panel">
                <img src="${href(isProperty ? "/portfolio/re_03.jpg" : "/portfolio/68.jpg")}" alt="${esc(isProperty ? t.panel.imageAltProperty : t.panel.imageAltAuto)}">
                <span>${esc(t.panel.imageCaption)}</span>
              </div>
              <div class="quote-content">
                <div class="quote-eyebrow"><span>${esc(t.panel.packageTag)}</span><span class="quote-number">YW / 001</span></div>
                <h2>${esc(q.packageName)}</h2>
                <p class="quote-description">${esc(q.description)}</p>
                <div class="price-box"><span>${esc(t.panel.estimateTag)}</span><strong aria-live="polite">${money(q.total)}</strong><small>${esc(t.panel.currencyNote)}</small></div>
                <div class="quote-subhead">${esc(t.panel.breakdownTag)}</div>
                <div class="line-items">${q.lines.map((line) => `<div class="line-item"><span>${esc(line.label)}</span><strong>${money(line.amount)}</strong></div>`).join("")}</div>
                <div class="total-row"><span>${esc(t.panel.totalLabel)}</span><strong>${money(q.total)}</strong></div>
                <p class="tax-note">${esc(t.panel.taxNote)}</p>
                <div class="quote-subhead delivery-heading">${esc(t.panel.deliverTag)}</div>
                <ul class="deliverables">${q.deliverables.map((item) => `<li>${ICONS.check}${esc(item)}</li>`).join("")}</ul>
                <div class="quote-actions">
                  <a class="email-button" href="${mailto()}">${ICONS.mail} ${esc(t.panel.requestQuote)}</a>
                  <button type="button" class="copy-button" data-copy="${uid}">${ICONS.copy}<span>${esc(copied ? t.panel.copied : t.panel.copyInquiry)}</span></button>
                </div>
                <p class="fine-print">${esc(isProperty ? t.panel.finePrintProperty : t.panel.finePrintAuto)}</p>
              </div>
            </div>
            <div class="contact-line">${esc(t.contact.prompt)} <a href="mailto:yuqiworks@gmail.com">${esc(t.contact.cta)} ${ICONS.up}</a></div>
          </aside>
        </div>
        ${embed ? "" : `
        <div class="mobile-summary">
          <div><span>${esc(q.packageName)} · ${q.deliveredPhotos} ${esc(t.mobile.photosSuffix)}</span><strong>${money(q.total)} CAD</strong><small>${esc(t.mobile.beforeTax)}</small></div>
          <a href="#${domId("estimate")}">${esc(t.mobile.viewQuote)}</a>
        </div>`}`;
    }

    /* the standalone /quote/ pages wrap the calculator in the site chrome */
    function shellMarkup() {
      return `
      <header class="site-header">
        <a class="brand" href="https://yuqi.works/" aria-label="YUQI WORKS portfolio">YUQI<span>·</span>WORKS</a>
        <div class="header-right">
          <a class="lang-switch" href="${href(isProperty ? t.header.langHrefProperty : t.header.langHrefAuto)}" hreflang="${zh ? "en" : "zh-CN"}">${esc(t.header.langSwitch)}</a>
          <span class="header-divider"></span>
          <span class="header-location">${esc(t.header.location)}</span>
          <span class="header-divider"></span>
          <a href="https://yuqi.works/">${esc(t.header.portfolio)} ${ICONS.up}</a>
        </div>
      </header>
      <div class="page-shell">
        <nav class="service-switch" aria-label="${esc(t.aria.serviceNav)}">
          <a href="${href(zh ? "/zh" : "/")}" class="${isProperty ? "" : "active"}"${isProperty ? "" : ' aria-current="page"'}>${esc(t.nav.automotive)}</a>
          <a href="${href(zh ? "/zh/real-estate" : "/real-estate")}" class="${isProperty ? "active" : ""}"${isProperty ? ' aria-current="page"' : ""}>${esc(t.nav.property)}</a>
        </nav>
        <div class="intro">
          <div class="eyebrow"><span class="eyebrow-line"></span> ${esc(t.intro.eyebrow)}</div>
          <h1>${esc(isProperty ? t.intro.h1Property[0] : t.intro.h1Auto[0])}<br><em>${esc(isProperty ? t.intro.h1Property[1] : t.intro.h1Auto[1])}</em></h1>
          <p>${esc(isProperty ? t.intro.property : t.intro.auto)}</p>
        </div>
        ${calculatorMarkup()}
        <footer>
          <span>${esc(t.footer.copyright)}</span>
          <span>${esc(t.footer.disciplines)}</span>
          <a href="https://www.instagram.com/yuqiwang_w/" target="_blank" rel="noopener noreferrer">${esc(t.footer.instagram)} ${ICONS.up}</a>
        </footer>
      </div>`;
    }

    function render() {
      mount.innerHTML = `
      <main lang="${zh ? "zh-CN" : "en"}" class="${cls("qw-calc", embed && "qw-embed", isProperty ? "theme-property" : "theme-automotive", zh && "locale-zh")}">
        ${embed ? calculatorMarkup() : shellMarkup()}
      </main>`;
    }

    function selectShootType(value) {
      input.shootType = value;
      input.photos = carPhotoConfig(value, input.vehicles).included;
      render();
    }

    function selectVehicle(delta) {
      const next = Math.min(6, Math.max(1, input.vehicles + delta));
      if (next === input.vehicles) return;
      const before = carPhotoConfig(input.shootType, input.vehicles).included;
      const after = carPhotoConfig(input.shootType, next).included;
      input.photos = after + Math.max(0, input.photos - before);
      input.vehicles = next;
      render();
    }

    /** Embedded mode: hand the configuration to the site's Request-a-Quote form instead of opening mail. */
    function sendToForm() {
      const form = document.getElementById("quote-form");
      const message = document.getElementById("qf-msg");
      if (!form || !message) return false;
      message.value = inquiryText();
      const type = document.getElementById("qf-type");
      if (type) type.value = isProperty ? "Real Estate" : "Automotive";
      const status = document.getElementById("qf-status");
      if (status) status.textContent = zh ? "报价已填入下面的表单，补上联系方式就能发送。" : "Your quote is filled into the form below — add your details and send.";
      form.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        const name = document.getElementById("qf-name");
        if (name) name.focus({ preventScroll: true });
      }, 450);
      return true;
    }

    mount.addEventListener("click", async (event) => {
      const mail = event.target.closest(".email-button");
      if (mail && embed) {
        event.preventDefault();
        if (!sendToForm()) window.location.href = mailto();
        return;
      }
      const shoot = event.target.closest("[data-shoot]");
      if (shoot) return selectShootType(shoot.dataset.shoot);
      const size = event.target.closest("[data-size]");
      if (size) { input.propertySize = size.dataset.size; input.photos = C.getPropertyPhotoConfig(input.propertySize).included; return render(); }
      const photo = event.target.closest("[data-photos]");
      if (photo) { input.photos = Number(photo.dataset.photos); return render(); }
      const step = event.target.closest("[data-vehicles]");
      if (step) return selectVehicle(Number(step.dataset.vehicles));
      const video = event.target.closest("[data-video]");
      if (video) { input.video = video.dataset.video; return render(); }
      const extra = event.target.closest("[data-extra]");
      if (extra) {
        const value = extra.dataset.extra;
        input.extras = input.extras.includes(value) ? input.extras.filter((item) => item !== value) : [...input.extras, value];
        return render();
      }
      if (event.target.closest("[data-copy]")) {
        try {
          await navigator.clipboard.writeText(inquiryText());
          copied = true;
          render();
          window.setTimeout(() => { copied = false; render(); }, 2400);
        } catch { window.location.href = mailto(); }
      }
    });

    render();
    return {
      setLocale(next) {
        locale = next === "zh" ? "zh" : "en";
        zh = locale === "zh";
        t = C.getCopy(locale);
        money = zh ? C.moneyZh : C.moneyEn;
        copied = false;
        render();
      },
    };
  }

  const instances = [];

  function boot() {
    C = window.QuoteCore;
    if (!C) return;
    const configs = Array.isArray(window.QUOTE_INSTANCES) && window.QUOTE_INSTANCES.length
      ? window.QUOTE_INSTANCES
      : [{
          mount: window.QUOTE_MOUNT || "app",
          category: (window.QUOTE_PAGE || {}).category || "automotive",
          locale: (window.QUOTE_PAGE || {}).locale || "en",
          embed: !!window.QUOTE_EMBED,
        }];
    instances.length = 0;
    configs.forEach((cfg) => {
      const instance = createInstance(cfg);
      if (instance) instances.push(instance);
    });
  }

  boot();

  /* the site's EN/中文 toggle re-renders every calculator in that language, keeping what was picked */
  window.QuoteSite = {
    setLocale(locale) {
      const next = locale === "zh" ? "zh" : "en";
      if (Array.isArray(window.QUOTE_INSTANCES)) window.QUOTE_INSTANCES.forEach((cfg) => { cfg.locale = next; });
      instances.forEach((instance) => instance.setLocale(next));
    },
  };
})();
