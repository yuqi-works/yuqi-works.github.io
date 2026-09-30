"use strict";
(() => {
  // lib/pricing.ts
  var packages = {
    personal: { name: "The Collector", label: "Owner / collector", description: "A focused portrait of your car with individually finished images.", price: 425, photos: 15, vehicle: 175, photo: 20, time: "Up to 90 minutes \xB7 one location", finish: "15 individually finished, high-resolution photos", delivery: "Photo delivery target: 5 business days", usage: "Personal and social sharing included" },
    listing: { name: "The Listing", label: "Sale / listing", description: "Complete exterior, interior and detail coverage for your vehicle listing.", price: 275, photos: 15, vehicle: 175, photo: 10, time: "Up to 60 minutes \xB7 one location", finish: "15 colour-corrected, high-resolution listing photos", delivery: "Photo delivery target: 2\u20133 business days", usage: "Personal vehicle listing use included" },
    commercial: { name: "The Business", label: "Brand / business", description: "Automotive content for your business channels, with usage included.", price: 650, photos: 15, vehicle: 275, photo: 20, time: "Up to 3 hours \xB7 one location", finish: "15 edited photos, including 5 selected hero retouches", delivery: "Photo delivery target: 5\u20137 business days", usage: "Use on your own website, organic social channels and standard business materials included" }
  };
  function getCarPhotoConfig(shootType, vehicles) {
    const pkg = packages[shootType];
    return { included: pkg.photos + Math.max(0, vehicles - 1) * 8, extraPrice: pkg.photo };
  }
  function getCarPhotoChoices(shootType, vehicles) {
    const { included } = getCarPhotoConfig(shootType, vehicles);
    return [0, 5, 10, 20, 35].map((extra) => included + extra);
  }
  var videos = { none: { label: "None", price: 0 }, reel: { label: "Social reel (15\u201330 sec)", price: 300 }, film: { label: "Cinematic film (45\u201360 sec)", price: 650 } };
  var addOns = { night: { label: "Night lighting setup", price: 150 }, rolling: { label: "Motion-style panning photos", price: 180 }, drone: { label: "Aerial stills (3\u20135 photos)", price: 250 } };
  var propertySizes = {
    small: { label: "Up to 2,000 sq ft", price: 185, photos: 20, time: "Up to 60 minutes \xB7 one property" },
    medium: { label: "2,001\u20134,000 sq ft", price: 235, photos: 30, time: "Up to 90 minutes \xB7 one property" },
    large: { label: "4,001\u20136,000 sq ft", price: 285, photos: 40, time: "Up to 2 hours \xB7 one property" }
  };
  var propertyExtraPhotoPrice = 4;
  function getPropertyPhotoConfig(propertySize) {
    return { included: propertySizes[propertySize].photos, extraPrice: propertyExtraPhotoPrice };
  }
  function getPropertyPhotoChoices(propertySize) {
    const { included } = getPropertyPhotoConfig(propertySize);
    return [0, 10, 20, 30, 40].map((extra) => included + extra);
  }
  var propertyVideos = {
    none: { label: "None", price: 0 },
    reel: { label: "Property social reel (15\u201330 sec)", price: 200 },
    film: { label: "Property walkthrough (60\u201390 sec)", price: 400 }
  };
  var propertyAddOns = {
    night: { label: "Twilight exteriors \xB7 same visit", price: 150, delivery: "3 additional dusk exterior photos" },
    drone: { label: "Aerial stills \xB7 property", price: 175, delivery: "4\u20136 additional aerial stills where permitted" }
  };
  function calculatePropertyQuote(input) {
    const size = propertySizes[input.propertySize ?? "small"];
    const extraPhotos = Math.max(0, input.photos - size.photos);
    const deliveredPhotos = size.photos + extraPhotos;
    const selectedExtras = input.extras.filter((extra) => extra === "night" || extra === "drone");
    const lines = [
      { label: `Property photography \xB7 ${size.label} \xB7 ${size.photos} photos`, amount: size.price },
      ...extraPhotos ? [{ label: `${extraPhotos} additional listing photos`, amount: extraPhotos * propertyExtraPhotoPrice }] : [],
      ...input.video !== "none" ? [{ label: propertyVideos[input.video].label, amount: propertyVideos[input.video].price }] : [],
      ...selectedExtras.map((extra) => ({ label: propertyAddOns[extra].label, amount: propertyAddOns[extra].price }))
    ];
    return {
      packageName: "The Property",
      shootLabel: `Real estate / listing \xB7 ${size.label}`,
      description: "Interior, exterior and key details, prepared for a clear property listing.",
      deliveredPhotos,
      videoLabel: propertyVideos[input.video].label,
      extraLabels: selectedExtras.map((extra) => propertyAddOns[extra].label),
      lines,
      total: lines.reduce((sum, item) => sum + item.amount, 0),
      deliverables: [
        size.time,
        `${deliveredPhotos} colour-balanced, high-resolution interior and exterior photos`,
        "Web and listing-ready exports",
        "Listing marketing use for the property included",
        ...input.video !== "none" ? [`One ${propertyVideos[input.video].label.toLowerCase()} \xB7 additional filming time included`] : [],
        ...selectedExtras.map((extra) => propertyAddOns[extra].delivery),
        "Photo delivery target: 1\u20132 business days",
        ...input.video !== "none" ? ["Video delivery target: 3\u20135 business days"] : []
      ]
    };
  }
  function calculateQuote(input) {
    if (input.shootType === "property") return calculatePropertyQuote(input);
    const pkg = packages[input.shootType];
    const extraVehicles = Math.max(0, input.vehicles - 1);
    const includedPhotos = getCarPhotoConfig(input.shootType, input.vehicles).included;
    const extraPhotos = Math.max(0, input.photos - includedPhotos);
    const deliveredPhotos = includedPhotos + extraPhotos;
    const lines = [
      { label: `${pkg.name} \xB7 ${pkg.photos} photos`, amount: pkg.price },
      ...extraVehicles ? [{ label: `${extraVehicles} additional vehicle${extraVehicles > 1 ? "s" : ""} \xB7 8 photos each`, amount: extraVehicles * pkg.vehicle }] : [],
      ...extraPhotos ? [{ label: `${extraPhotos} additional photos`, amount: extraPhotos * pkg.photo }] : [],
      ...input.video !== "none" ? [{ label: videos[input.video].label, amount: videos[input.video].price }] : [],
      ...input.extras.map((extra) => ({ label: addOns[extra].label, amount: addOns[extra].price }))
    ];
    return {
      packageName: `${pkg.name}${input.video === "none" ? "" : " + Motion"}`,
      shootLabel: pkg.label,
      description: pkg.description,
      deliveredPhotos,
      videoLabel: videos[input.video].label,
      extraLabels: input.extras.map((extra) => addOns[extra].label),
      lines,
      total: lines.reduce((sum, item) => sum + item.amount, 0),
      deliverables: [
        pkg.time,
        ...extraVehicles ? [`Up to ${extraVehicles * (input.shootType === "commercial" ? 45 : 30)} additional minutes for ${extraVehicles} more vehicle${extraVehicles === 1 ? "" : "s"}`] : [],
        pkg.finish.replace(String(pkg.photos), String(deliveredPhotos)),
        "Web and social-ready exports",
        pkg.usage,
        ...input.video !== "none" ? [`One ${videos[input.video].label.toLowerCase()} \xB7 additional filming time included`] : [],
        ...input.extras.map((extra) => extra === "night" ? "Additional night lighting setup" : extra === "rolling" ? "Motion-style panning photos from a stationary position" : "3\u20135 additional aerial stills where permitted"),
        pkg.delivery,
        ...input.video !== "none" ? ["Video delivery target: 7\u201310 business days"] : []
      ]
    };
  }

  // lib/i18n.ts
  var en = {
    moneyTag: "en-CA",
    header: { location: "VANCOUVER, BC", portfolio: "View portfolio", langSwitch: "\u4E2D\u6587", langHrefAuto: "/zh", langHrefProperty: "/zh/real-estate" },
    nav: { service: "Photography service", automotive: "Automotive photography", property: "Real estate photography" },
    intro: {
      eyebrow: "PRIVATE ESTIMATE / 2026",
      h1Auto: ["Make the car", "the story."],
      h1Property: ["Frame the space", "with care."],
      auto: "Build a shoot around your vehicle. Choose what you need and see a clear starting estimate instantly.",
      property: "Choose a property size, photo count and the media your listing needs. See an estimate instantly."
    },
    sections: {
      brief: ["01 / THE BRIEF", "What are we shooting?"],
      briefProperty: ["01 / THE PROPERTY", "How large is the space?"],
      scope: ["02 / SCOPE", "Shape the deliverables."],
      motion: ["03 / MOTION", "Add a moving image."],
      extras: ["04 / FINISHING TOUCHES", "Make it yours."]
    },
    shoots: [
      { value: "listing", tag: "LISTING", title: "Sale / listing", description: "15 clear photos \xB7 60 minutes \xB7 2\u20133 days.", starting: "$275" },
      { value: "personal", tag: "PERSONAL", title: "Owner / collector", description: "15 finished portraits \xB7 90 minutes.", starting: "$425" },
      { value: "commercial", tag: "COMMERCIAL", title: "Brand / business", description: "15 images \xB7 own-channel use included.", starting: "$650" }
    ],
    from: "FROM {price} CAD",
    sizes: [
      { value: "small", title: "Small", detail: "Up to 2,000 sq ft" },
      { value: "medium", title: "Medium", detail: "2,001\u20134,000 sq ft" },
      { value: "large", title: "Large", detail: "4,001\u20136,000 sq ft" }
    ],
    videosAuto: [
      { value: "none", title: "Photos only", description: "No video edit", price: "$0" },
      { value: "reel", title: "Social reel", description: "One vertical 15\u201330 second edit", price: "+$300" },
      { value: "film", title: "Cinematic film", description: "One 45\u201360 second edit", price: "+$650" }
    ],
    videosProperty: [
      { value: "none", title: "Photos only", description: "No video edit", price: "$0" },
      { value: "reel", title: "Property social reel", description: "One vertical 15\u201330 second edit", price: "+$200" },
      { value: "film", title: "Property walkthrough", description: "One 60\u201390 second edit", price: "+$400" }
    ],
    extrasAuto: [
      { value: "night", title: "Night lighting setup", detail: "Extra lighting and setup after dark", price: "+$150" },
      { value: "rolling", title: "Motion-style photos", detail: "Panning from a stationary position", price: "+$180" },
      { value: "drone", title: "Aerial stills", detail: "3\u20135 extra photos where flying is permitted", price: "+$250" }
    ],
    extrasProperty: [
      { value: "night", title: "Twilight exteriors", detail: "Three dusk photos on the same visit", price: "+$150" },
      { value: "drone", title: "Aerial stills", detail: "4\u20136 extra photos where flying is permitted", price: "+$175" }
    ],
    scope: {
      vehiclesLabel: "Vehicles",
      vehiclesNote: "One shoot, up to six cars.",
      photosLabel: "Edited photos",
      photosNoteExtra: (included, extra) => `${included} included \xB7 ${extra} per additional photo.`,
      photosNoteBulk: (included, extra) => `${included} included \xB7 ${extra} per 10 more.`,
      noteAuto: "Every package has an included ground-photo count; each additional vehicle adds 8. Aerial stills, if selected, are delivered in addition. For recurring dealer inventory, ask for a custom batch quote.",
      noteProperty: "Each size includes a photo count. Aerial and twilight photos are additional. Properties over 6,000 sq ft, floor plans and 3D tours are outside this estimate.",
      removeVehicle: "Remove one vehicle",
      addVehicle: "Add one vehicle"
    },
    panel: {
      imageCaption: "YUQI WORKS / SELECTED FRAME",
      imageAltAuto: "Red Audi R8 photographed on a wooded road by YUQI WORKS",
      imageAltProperty: "Straight-on exterior view of a private residence and pool photographed by YUQI WORKS",
      packageTag: "YOUR SUGGESTED PACKAGE",
      estimateTag: "REFERENCE ESTIMATE",
      currencyNote: "CAD \xB7 before applicable taxes",
      breakdownTag: "PRICE BREAKDOWN",
      totalLabel: "Estimated total",
      taxNote: "All prices shown exclude applicable taxes.",
      deliverTag: "WHAT YOU RECEIVE",
      requestQuote: "Request this quote",
      copyInquiry: "Copy inquiry summary",
      copied: "Copied summary",
      finePrintAuto: "An indicative estimate, not a booking or final invoice. One Metro Vancouver location assumed; longer travel is confirmed before booking. Complex retouching, paid advertising, third-party usage, genuine car-to-car tracking and permits need a separate quote. Drone coverage depends on airspace and weather.",
      finePrintProperty: "An indicative estimate, not a booking or final invoice. One Metro Vancouver property assumed; longer travel is confirmed before booking. Floor plans, staging, 3D tours and extensive retouching are not included. Twilight pricing assumes the same visit. Drone coverage depends on airspace and weather."
    },
    contact: { prompt: "A different brief?", cta: "Talk directly with Yuqi" },
    footer: { copyright: "YUQI WORKS \xA9 2026", disciplines: "AUTOMOTIVE + REAL ESTATE PHOTOGRAPHY \xB7 VANCOUVER", instagram: "INSTAGRAM" },
    mobile: { photosSuffix: "photos", beforeTax: "Before tax", viewQuote: "View quote" },
    inquiry: {
      titleAuto: "automotive",
      titleProperty: "real estate",
      subjectAuto: "Automotive shoot inquiry \u2014 YUQI WORKS",
      subjectProperty: "Real estate shoot inquiry \u2014 YUQI WORKS",
      package: "Suggested package",
      shoot: "Shoot",
      vehicles: "Vehicles",
      propertySize: "Property size",
      photosLine: (isProperty, count) => `${isProperty ? "Listing" : "Ground"} photos: ${count} total`,
      video: "Video",
      extras: "Extras",
      none: "None",
      estimateLine: (formatted) => `Reference estimate: ${formatted} CAD before applicable taxes`,
      blank: "",
      locationPromptAuto: "Preferred date / location / vehicle details:",
      locationPromptProperty: "Property address / approximate size / preferred date:",
      contactPrompt: "Name and best contact:"
    },
    aria: {
      serviceNav: "Photography service",
      configurator: "Build your photography estimate",
      estimate: "Your estimate",
      shootGroup: "Automotive shoot type",
      sizeGroup: "Property size",
      videoGroup: "Video option",
      photoGroup: "Edited photos",
      vehicleGroup: "Vehicles",
      photos: (count) => `${count} edited photos`
    }
  };
  var zh = {
    moneyTag: "zh-CN",
    header: { location: "\u6E29\u54E5\u534E \xB7 BC", portfolio: "\u6D4F\u89C8\u4F5C\u54C1\u96C6", langSwitch: "EN", langHrefAuto: "/", langHrefProperty: "/real-estate" },
    nav: { service: "\u6444\u5F71\u670D\u52A1", automotive: "\u6C7D\u8F66\u6444\u5F71", property: "\u5730\u4EA7\u6444\u5F71" },
    intro: {
      eyebrow: "\u79C1\u4EBA\u62A5\u4EF7 / 2026",
      h1Auto: ["\u8BA9\u8F66", "\u6210\u4E3A\u4E3B\u89D2\u3002"],
      h1Property: ["\u628A\u7A7A\u95F4", "\u62CD\u5F97\u8BB2\u7A76\u3002"],
      auto: "\u6309\u4F60\u7684\u8F66\u8F86\u5B9A\u5236\u62CD\u6444\u3002\u9009\u597D\u9700\u8981\u7684\u9879\u76EE\uFF0C\u7ACB\u523B\u770B\u5230\u6E05\u6670\u7684\u8D77\u6B65\u4EF7\u3002",
      property: "\u9009\u62E9\u623F\u5C4B\u9762\u79EF\u3001\u7167\u7247\u6570\u91CF\uFF0C\u4EE5\u53CA\u623F\u6E90\u9700\u8981\u7684\u89C6\u9891\u3002\u7ACB\u523B\u770B\u5230\u62A5\u4EF7\u3002"
    },
    sections: {
      brief: ["01 / \u62CD\u6444\u9700\u6C42", "\u62CD\u4EC0\u4E48\uFF1F"],
      briefProperty: ["01 / \u623F\u5C4B", "\u7A7A\u95F4\u6709\u591A\u5927\uFF1F"],
      scope: ["02 / \u62CD\u6444\u8303\u56F4", "\u786E\u5B9A\u4EA4\u4ED8\u5185\u5BB9\u3002"],
      motion: ["03 / \u52A8\u6001\u5F71\u50CF", "\u52A0\u4E00\u6BB5\u89C6\u9891\u3002"],
      extras: ["04 / \u9644\u52A0\u9879", "\u8865\u5145\u7EC6\u8282\u3002"]
    },
    shoots: [
      { value: "listing", tag: "\u6302\u724C", title: "\u51FA\u552E / \u6302\u724C", description: "15 \u5F20\u6E05\u6670\u7167\u7247 \xB7 60 \u5206\u949F \xB7 2\u20133 \u5929\u4EA4\u4ED8", starting: "$275" },
      { value: "personal", tag: "\u8F66\u4E3B", title: "\u8F66\u4E3B / \u6536\u85CF\u5BB6", description: "15 \u5F20\u7CBE\u4FEE\u8096\u50CF \xB7 90 \u5206\u949F", starting: "$425" },
      { value: "commercial", tag: "\u5546\u4E1A", title: "\u54C1\u724C / \u5546\u4E1A", description: "15 \u5F20 \xB7 \u542B\u81EA\u6709\u6E20\u9053\u4F7F\u7528\u6743", starting: "$650" }
    ],
    from: "{price} CAD \u8D77",
    sizes: [
      { value: "small", title: "\u5C0F\u578B", detail: "2,000 \u5E73\u65B9\u82F1\u5C3A\u4EE5\u5185" },
      { value: "medium", title: "\u4E2D\u578B", detail: "2,001\u20134,000 \u5E73\u65B9\u82F1\u5C3A" },
      { value: "large", title: "\u5927\u578B", detail: "4,001\u20136,000 \u5E73\u65B9\u82F1\u5C3A" }
    ],
    videosAuto: [
      { value: "none", title: "\u53EA\u8981\u7167\u7247", description: "\u4E0D\u52A0\u89C6\u9891\u526A\u8F91", price: "$0" },
      { value: "reel", title: "\u793E\u4EA4\u77ED\u7247", description: "\u4E00\u6761\u7AD6\u7248 15\u201330 \u79D2\u526A\u8F91", price: "+$300" },
      { value: "film", title: "\u7535\u5F71\u611F\u77ED\u7247", description: "\u4E00\u6761 45\u201360 \u79D2\u526A\u8F91", price: "+$650" }
    ],
    videosProperty: [
      { value: "none", title: "\u53EA\u8981\u7167\u7247", description: "\u4E0D\u52A0\u89C6\u9891\u526A\u8F91", price: "$0" },
      { value: "reel", title: "\u623F\u6E90\u793E\u4EA4\u77ED\u7247", description: "\u4E00\u6761\u7AD6\u7248 15\u201330 \u79D2\u526A\u8F91", price: "+$200" },
      { value: "film", title: "\u623F\u6E90\u5BFC\u89C8\u89C6\u9891", description: "\u4E00\u6761 60\u201390 \u79D2\u526A\u8F91", price: "+$400" }
    ],
    extrasAuto: [
      { value: "night", title: "\u591C\u95F4\u5E03\u5149", detail: "\u5929\u9ED1\u540E\u989D\u5916\u5E03\u5149\u4E0E\u642D\u5EFA", price: "+$150" },
      { value: "rolling", title: "\u52A8\u611F\u7167\u7247", detail: "\u673A\u4F4D\u4E0D\u52A8\uFF0C\u5E73\u79FB\u8DDF\u62CD", price: "+$180" },
      { value: "drone", title: "\u822A\u62CD\u7167\u7247", detail: "\u5141\u8BB8\u98DE\u884C\u7684\u4F4D\u7F6E\u52A0\u62CD 3\u20135 \u5F20", price: "+$250" }
    ],
    extrasProperty: [
      { value: "night", title: "\u9EC4\u660F\u5916\u666F", detail: "\u540C\u4E00\u6B21\u5230\u8BBF\u52A0\u62CD\u4E09\u5F20\u66AE\u8272\u5916\u666F", price: "+$150" },
      { value: "drone", title: "\u822A\u62CD\u7167\u7247", detail: "\u5141\u8BB8\u98DE\u884C\u7684\u4F4D\u7F6E\u52A0\u62CD 4\u20136 \u5F20", price: "+$175" }
    ],
    scope: {
      vehiclesLabel: "\u8F66\u8F86",
      vehiclesNote: "\u4E00\u6B21\u62CD\u6444\uFF0C\u6700\u591A\u516D\u53F0\u8F66\u3002",
      photosLabel: "\u7CBE\u4FEE\u7167\u7247",
      photosNoteExtra: (included, extra) => `\u542B ${included} \u5F20 \xB7 \u6BCF\u52A0\u4E00\u5F20 ${extra}\u3002`,
      photosNoteBulk: (included, extra) => `\u542B ${included} \u5F20 \xB7 \u6BCF\u52A0 10 \u5F20 ${extra}\u3002`,
      noteAuto: "\u6BCF\u4E2A\u5957\u9910\u542B\u57FA\u7840\u5730\u9762\u7167\u7247\u5F20\u6570\uFF0C\u6BCF\u589E\u52A0\u4E00\u53F0\u8F66\u52A0 8 \u5F20\u3002\u9009\u822A\u62CD\u5219\u989D\u5916\u4EA4\u4ED8\u3002\u7ECF\u9500\u5546\u957F\u671F\u5E93\u5B58\u53E6\u6709\u6279\u91CF\u62A5\u4EF7\u3002",
      noteProperty: "\u6BCF\u4E2A\u9762\u79EF\u6863\u4F4D\u542B\u56FA\u5B9A\u5F20\u6570\u7167\u7247\uFF0C\u822A\u62CD\u4E0E\u66AE\u8272\u7167\u7247\u989D\u5916\u8BA1\u8D39\u3002\u8D85\u8FC7 6,000 \u5E73\u65B9\u82F1\u5C3A\u7684\u623F\u5C4B\u3001\u6237\u578B\u56FE\u548C 3D \u5BFC\u89C8\u4E0D\u5728\u672C\u62A5\u4EF7\u5185\u3002",
      removeVehicle: "\u51CF\u5C11\u4E00\u53F0\u8F66",
      addVehicle: "\u589E\u52A0\u4E00\u53F0\u8F66"
    },
    panel: {
      imageCaption: "YUQI WORKS / \u7CBE\u9009\u753B\u9762",
      imageAltAuto: "YUQI WORKS \u62CD\u6444\u7684\u6797\u95F4\u516C\u8DEF\u4E0A\u7684\u7EA2\u8272\u5965\u8FEA R8",
      imageAltProperty: "YUQI WORKS \u62CD\u6444\u7684\u79C1\u4EBA\u4F4F\u5B85\u4E0E\u6CF3\u6C60\u6B63\u9762\u5916\u666F",
      packageTag: "\u63A8\u8350\u65B9\u6848",
      estimateTag: "\u53C2\u8003\u62A5\u4EF7",
      currencyNote: "\u52A0\u5143 \xB7 \u4E0D\u542B\u9002\u7528\u7A0E\u8D39",
      breakdownTag: "\u4EF7\u683C\u660E\u7EC6",
      totalLabel: "\u4F30\u7B97\u603B\u8BA1",
      taxNote: "\u4EE5\u4E0A\u4EF7\u683C\u5747\u4E0D\u542B\u9002\u7528\u7A0E\u8D39\u3002",
      deliverTag: "\u4F60\u5C06\u83B7\u5F97",
      requestQuote: "\u53D1\u9001\u8FD9\u7248\u62A5\u4EF7",
      copyInquiry: "\u590D\u5236\u8BE2\u4EF7\u6458\u8981",
      copied: "\u5DF2\u590D\u5236\u6458\u8981",
      finePrintAuto: "\u6B64\u4EF7\u683C\u4E3A\u53C2\u8003\u4F30\u7B97\uFF0C\u4E0D\u6784\u6210\u9884\u7EA6\u6216\u6700\u7EC8\u8D26\u5355\u3002\u9ED8\u8BA4\u4E00\u4E2A\u5927\u6E29\u54E5\u534E\u5730\u533A\u573A\u5730\uFF1B\u66F4\u8FDC\u7684\u4EA4\u901A\u8D39\u7528\u5728\u9884\u7EA6\u524D\u786E\u8BA4\u3002\u590D\u6742\u4FEE\u56FE\u3001\u4ED8\u8D39\u5E7F\u544A\u3001\u7B2C\u4E09\u65B9\u6388\u6743\u3001\u771F\u5B9E\u8DDF\u8F66\u62CD\u6444\u4E0E\u8BB8\u53EF\u9700\u5355\u72EC\u62A5\u4EF7\u3002\u822A\u62CD\u53D6\u51B3\u4E8E\u7A7A\u57DF\u4E0E\u5929\u6C14\u3002",
      finePrintProperty: "\u6B64\u4EF7\u683C\u4E3A\u53C2\u8003\u4F30\u7B97\uFF0C\u4E0D\u6784\u6210\u9884\u7EA6\u6216\u6700\u7EC8\u8D26\u5355\u3002\u9ED8\u8BA4\u4E00\u5957\u5927\u6E29\u54E5\u534E\u5730\u533A\u623F\u6E90\uFF1B\u66F4\u8FDC\u7684\u4EA4\u901A\u8D39\u7528\u5728\u9884\u7EA6\u524D\u786E\u8BA4\u3002\u6237\u578B\u56FE\u3001\u8F6F\u88C5\u5E03\u7F6E\u30013D \u5BFC\u89C8\u4E0E\u5927\u91CF\u4FEE\u56FE\u4E0D\u542B\u5728\u5185\u3002\u66AE\u8272\u5916\u666F\u6309\u540C\u4E00\u6B21\u5230\u8BBF\u8BA1\u4EF7\u3002\u822A\u62CD\u53D6\u51B3\u4E8E\u7A7A\u57DF\u4E0E\u5929\u6C14\u3002"
    },
    contact: { prompt: "\u9700\u6C42\u4E0D\u4E00\u6837\uFF1F", cta: "\u76F4\u63A5\u8054\u7CFB Yuqi" },
    footer: { copyright: "YUQI WORKS \xA9 2026", disciplines: "\u6C7D\u8F66 + \u5730\u4EA7\u6444\u5F71 \xB7 \u6E29\u54E5\u534E", instagram: "INSTAGRAM" },
    mobile: { photosSuffix: "\u5F20", beforeTax: "\u4E0D\u542B\u7A0E", viewQuote: "\u67E5\u770B\u62A5\u4EF7" },
    inquiry: {
      titleAuto: "\u6C7D\u8F66\u6444\u5F71",
      titleProperty: "\u5730\u4EA7\u6444\u5F71",
      subjectAuto: "\u6C7D\u8F66\u62CD\u6444\u8BE2\u4EF7 \u2014 YUQI WORKS",
      subjectProperty: "\u5730\u4EA7\u62CD\u6444\u8BE2\u4EF7 \u2014 YUQI WORKS",
      package: "\u5EFA\u8BAE\u65B9\u6848",
      shoot: "\u62CD\u6444\u7C7B\u578B",
      vehicles: "\u8F66\u8F86\u6570\u91CF",
      propertySize: "\u623F\u5C4B\u9762\u79EF",
      photosLine: (isProperty, count) => `${isProperty ? "\u6302\u724C\u7167\u7247" : "\u5730\u9762\u7167\u7247"}\uFF1A\u5171 ${count} \u5F20`,
      video: "\u89C6\u9891",
      extras: "\u9644\u52A0\u9879",
      none: "\u65E0",
      estimateLine: (formatted) => `\u53C2\u8003\u62A5\u4EF7\uFF1A${formatted} \u52A0\u5143\uFF08\u4E0D\u542B\u9002\u7528\u7A0E\u8D39\uFF09`,
      blank: "",
      locationPromptAuto: "\u671F\u671B\u65E5\u671F / \u573A\u5730 / \u8F66\u8F86\u4FE1\u606F\uFF1A",
      locationPromptProperty: "\u623F\u5C4B\u5730\u5740 / \u5927\u81F4\u9762\u79EF / \u671F\u671B\u65E5\u671F\uFF1A",
      contactPrompt: "\u59D3\u540D\u4E0E\u8054\u7CFB\u65B9\u5F0F\uFF1A"
    },
    aria: {
      serviceNav: "\u6444\u5F71\u670D\u52A1",
      configurator: "\u914D\u7F6E\u4F60\u7684\u6444\u5F71\u62A5\u4EF7",
      estimate: "\u4F60\u7684\u62A5\u4EF7",
      shootGroup: "\u6C7D\u8F66\u62CD\u6444\u7C7B\u578B",
      sizeGroup: "\u623F\u5C4B\u9762\u79EF",
      videoGroup: "\u89C6\u9891\u9009\u9879",
      photoGroup: "\u7CBE\u4FEE\u7167\u7247",
      vehicleGroup: "\u8F66\u8F86",
      photos: (count) => `${count} \u5F20\u7CBE\u4FEE\u7167\u7247`
    }
  };
  function getCopy(locale) {
    return locale === "zh" ? zh : en;
  }

  // lib/pricing-zh.ts
  var zhPackageName = {
    personal: "\u8F66\u4E3B\u8096\u50CF\u5957\u9910",
    listing: "\u6302\u724C\u5957\u9910",
    commercial: "\u5546\u4E1A\u5957\u9910",
    property: "\u623F\u6E90\u5957\u9910"
  };
  var zhShootLabel = {
    personal: "\u8F66\u4E3B / \u6536\u85CF\u5BB6",
    listing: "\u51FA\u552E / \u6302\u724C",
    commercial: "\u54C1\u724C / \u5546\u4E1A"
  };
  var zhPackageDescription = {
    personal: "\u4E3A\u4F60\u7684\u8F66\u62CD\u4E00\u7EC4\u4E13\u6CE8\u7684\u8096\u50CF\uFF0C\u9010\u5F20\u7CBE\u4FEE\u3002",
    listing: "\u8F66\u8F86\u6302\u724C\u6240\u9700\u7684\u5B8C\u6574\u5916\u89C2\u3001\u5185\u9970\u4E0E\u7EC6\u8282\u8986\u76D6\u3002",
    commercial: "\u9762\u5411\u5546\u4E1A\u6E20\u9053\u7684\u6C7D\u8F66\u5185\u5BB9\uFF0C\u542B\u4F7F\u7528\u6743\u3002"
  };
  var zhSizeLabel = {
    small: "2,000 \u5E73\u65B9\u82F1\u5C3A\u4EE5\u5185",
    medium: "2,001\u20134,000 \u5E73\u65B9\u82F1\u5C3A",
    large: "4,001\u20136,000 \u5E73\u65B9\u82F1\u5C3A"
  };
  var zhSizeTime = {
    small: "60 \u5206\u949F\u4EE5\u5185 \xB7 \u4E00\u5957\u623F\u6E90",
    medium: "90 \u5206\u949F\u4EE5\u5185 \xB7 \u4E00\u5957\u623F\u6E90",
    large: "2 \u5C0F\u65F6\u4EE5\u5185 \xB7 \u4E00\u5957\u623F\u6E90"
  };
  var zhTime = {
    personal: "90 \u5206\u949F\u4EE5\u5185 \xB7 \u4E00\u4E2A\u573A\u5730",
    listing: "60 \u5206\u949F\u4EE5\u5185 \xB7 \u4E00\u4E2A\u573A\u5730",
    commercial: "3 \u5C0F\u65F6\u4EE5\u5185 \xB7 \u4E00\u4E2A\u573A\u5730"
  };
  var zhFinish = {
    personal: "{n} \u5F20\u9010\u5F20\u7CBE\u4FEE\u7684\u9AD8\u5206\u8FA8\u7387\u7167\u7247",
    listing: "{n} \u5F20\u5B8C\u6210\u6821\u8272\u7684\u9AD8\u5206\u8FA8\u7387\u6302\u724C\u7167\u7247",
    commercial: "{n} \u5F20\u7CBE\u4FEE\u7167\u7247\uFF0C\u542B 5 \u5F20\u7CBE\u9009\u4E3B\u56FE\u6DF1\u5EA6\u7CBE\u4FEE"
  };
  var zhUsage = {
    personal: "\u542B\u4E2A\u4EBA\u4F7F\u7528\u4E0E\u793E\u4EA4\u5E73\u53F0\u5206\u4EAB",
    listing: "\u542B\u4E2A\u4EBA\u8F66\u8F86\u6302\u724C\u7528\u9014",
    commercial: "\u542B\u81EA\u6709\u7F51\u7AD9\u3001\u81EA\u7136\u793E\u4EA4\u6E20\u9053\u4E0E\u5E38\u89C4\u5546\u7528\u7269\u6599\u4F7F\u7528\u6743"
  };
  var zhDelivery = {
    personal: "\u7167\u7247\u4EA4\u4ED8\u76EE\u6807\uFF1A5 \u4E2A\u5DE5\u4F5C\u65E5",
    listing: "\u7167\u7247\u4EA4\u4ED8\u76EE\u6807\uFF1A2\u20133 \u4E2A\u5DE5\u4F5C\u65E5",
    commercial: "\u7167\u7247\u4EA4\u4ED8\u76EE\u6807\uFF1A5\u20137 \u4E2A\u5DE5\u4F5C\u65E5"
  };
  var zhVideo = {
    none: "\u4E0D\u52A0\u89C6\u9891",
    reel: "\u793E\u4EA4\u77ED\u7247\uFF0815\u201330 \u79D2\uFF09",
    film: "\u7535\u5F71\u611F\u77ED\u7247\uFF0845\u201360 \u79D2\uFF09"
  };
  var zhPropertyVideo = {
    none: "\u4E0D\u52A0\u89C6\u9891",
    reel: "\u623F\u6E90\u793E\u4EA4\u77ED\u7247\uFF0815\u201330 \u79D2\uFF09",
    film: "\u623F\u6E90\u5BFC\u89C8\u89C6\u9891\uFF0860\u201390 \u79D2\uFF09"
  };
  var zhAddOn = {
    night: "\u591C\u95F4\u5E03\u5149",
    rolling: "\u52A8\u611F\u5E73\u79FB\u7167\u7247",
    drone: "\u822A\u62CD\u7167\u7247\uFF083\u20135 \u5F20\uFF09"
  };
  var zhAddOnDelivery = {
    night: "\u989D\u5916\u7684\u591C\u95F4\u5E03\u5149\u4E0E\u642D\u5EFA",
    rolling: "\u673A\u4F4D\u4E0D\u52A8\u3001\u5E73\u79FB\u8DDF\u62CD\u7684\u52A8\u611F\u7167\u7247",
    drone: "\u5141\u8BB8\u98DE\u884C\u7684\u4F4D\u7F6E\u52A0\u62CD 3\u20135 \u5F20\u822A\u62CD\u7167\u7247"
  };
  var zhPropertyAddOn = {
    night: "\u9EC4\u660F\u5916\u666F \xB7 \u540C\u4E00\u6B21\u5230\u8BBF",
    drone: "\u822A\u62CD\u7167\u7247 \xB7 \u623F\u6E90"
  };
  var zhPropertyAddOnDelivery = {
    night: "\u989D\u5916\u4E09\u5F20\u66AE\u8272\u5916\u666F\u7167\u7247",
    drone: "\u5141\u8BB8\u98DE\u884C\u7684\u4F4D\u7F6E\u52A0\u62CD 4\u20136 \u5F20\u822A\u62CD\u7167\u7247"
  };
  var VIDEO_DELIVERY_ZH = {
    property: "\u89C6\u9891\u4EA4\u4ED8\u76EE\u6807\uFF1A3\u20135 \u4E2A\u5DE5\u4F5C\u65E5",
    car: "\u89C6\u9891\u4EA4\u4ED8\u76EE\u6807\uFF1A7\u201310 \u4E2A\u5DE5\u4F5C\u65E5"
  };
  function calculatePropertyQuoteZh(input) {
    const size = propertySizes[input.propertySize ?? "small"];
    const extraPhotos = Math.max(0, input.photos - size.photos);
    const deliveredPhotos = size.photos + extraPhotos;
    const selectedExtras = input.extras.filter((extra) => extra === "night" || extra === "drone");
    const lines = [
      { label: `\u5730\u4EA7\u6444\u5F71 \xB7 ${zhSizeLabel[input.propertySize ?? "small"]} \xB7 \u542B ${size.photos} \u5F20\u7167\u7247`, amount: size.price },
      ...extraPhotos ? [{ label: `\u989D\u5916 ${extraPhotos} \u5F20\u6302\u724C\u7167\u7247`, amount: extraPhotos * propertyExtraPhotoPrice }] : [],
      ...input.video !== "none" ? [{ label: zhPropertyVideo[input.video], amount: propertyVideos[input.video].price }] : [],
      ...selectedExtras.map((extra) => ({ label: zhPropertyAddOn[extra], amount: propertyAddOns[extra].price }))
    ];
    return {
      packageName: zhPackageName.property,
      shootLabel: `\u5730\u4EA7 / \u6302\u724C \xB7 ${zhSizeLabel[input.propertySize ?? "small"]}`,
      description: "\u5BA4\u5185\u3001\u5916\u666F\u4E0E\u5173\u952E\u7EC6\u8282\uFF0C\u4E3A\u6E05\u6670\u7684\u623F\u6E90\u5C55\u793A\u505A\u51C6\u5907\u3002",
      deliveredPhotos,
      videoLabel: zhPropertyVideo[input.video],
      extraLabels: selectedExtras.map((extra) => zhPropertyAddOn[extra]),
      lines,
      total: lines.reduce((sum, item) => sum + item.amount, 0),
      deliverables: [
        zhSizeTime[input.propertySize ?? "small"],
        `${deliveredPhotos} \u5F20\u5B8C\u6210\u8272\u5F69\u5E73\u8861\u7684\u9AD8\u5206\u8FA8\u7387\u5BA4\u5185\u5916\u7167\u7247`,
        "\u53EF\u76F4\u63A5\u7528\u4E8E\u7F51\u7EDC\u4E0E\u623F\u6E90\u5E73\u53F0\u7684\u5BFC\u51FA\u6587\u4EF6",
        "\u542B\u8BE5\u623F\u6E90\u7684\u6302\u724C\u8425\u9500\u4F7F\u7528\u6743",
        ...input.video !== "none" ? [`\u4E00\u6761${zhPropertyVideo[input.video]} \xB7 \u542B\u989D\u5916\u62CD\u6444\u65F6\u95F4`] : [],
        ...selectedExtras.map((extra) => zhPropertyAddOnDelivery[extra]),
        "\u7167\u7247\u4EA4\u4ED8\u76EE\u6807\uFF1A1\u20132 \u4E2A\u5DE5\u4F5C\u65E5",
        ...input.video !== "none" ? [VIDEO_DELIVERY_ZH.property] : []
      ]
    };
  }
  function calculateQuoteZh(input) {
    if (input.shootType === "property") return calculatePropertyQuoteZh(input);
    const pkg = packages[input.shootType];
    const extraVehicles = Math.max(0, input.vehicles - 1);
    const includedPhotos = getCarPhotoConfig(input.shootType, input.vehicles).included;
    const extraPhotos = Math.max(0, input.photos - includedPhotos);
    const deliveredPhotos = includedPhotos + extraPhotos;
    const lines = [
      { label: `${zhPackageName[input.shootType]} \xB7 \u542B ${pkg.photos} \u5F20\u7167\u7247`, amount: pkg.price },
      ...extraVehicles ? [{ label: `\u53E6\u52A0 ${extraVehicles} \u53F0\u8F66 \xB7 \u6BCF\u53F0 8 \u5F20`, amount: extraVehicles * pkg.vehicle }] : [],
      ...extraPhotos ? [{ label: `\u53E6\u52A0 ${extraPhotos} \u5F20\u7167\u7247`, amount: extraPhotos * pkg.photo }] : [],
      ...input.video !== "none" ? [{ label: zhVideo[input.video], amount: videos[input.video].price }] : [],
      ...input.extras.map((extra) => ({ label: zhAddOn[extra], amount: addOns[extra].price }))
    ];
    return {
      packageName: `${zhPackageName[input.shootType]}${input.video === "none" ? "" : "\uFF0B\u89C6\u9891"}`,
      shootLabel: zhShootLabel[input.shootType],
      description: zhPackageDescription[input.shootType],
      deliveredPhotos,
      videoLabel: zhVideo[input.video],
      extraLabels: input.extras.map((extra) => zhAddOn[extra]),
      lines,
      total: lines.reduce((sum, item) => sum + item.amount, 0),
      deliverables: [
        zhTime[input.shootType],
        ...extraVehicles ? [`\u4E3A\u53E6\u5916 ${extraVehicles} \u53F0\u8F66\u589E\u52A0\u7EA6 ${extraVehicles * (input.shootType === "commercial" ? 45 : 30)} \u5206\u949F`] : [],
        zhFinish[input.shootType].replace("{n}", String(deliveredPhotos)),
        "\u9002\u914D\u7F51\u7EDC\u4E0E\u793E\u4EA4\u5E73\u53F0\u7684\u5BFC\u51FA\u6587\u4EF6",
        zhUsage[input.shootType],
        ...input.video !== "none" ? [`\u4E00\u6761${zhVideo[input.video]} \xB7 \u542B\u989D\u5916\u62CD\u6444\u65F6\u95F4`] : [],
        ...input.extras.map((extra) => zhAddOnDelivery[extra]),
        zhDelivery[input.shootType],
        ...input.video !== "none" ? [VIDEO_DELIVERY_ZH.car] : []
      ]
    };
  }
  function moneyZh(amount) {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CAD",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0
    }).format(amount);
  }

  // scripts/static-core.ts
  var moneyEn = (amount) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(amount);
  var api = {
    calculateQuote,
    calculateQuoteZh,
    getCarPhotoChoices,
    getCarPhotoConfig,
    getPropertyPhotoChoices,
    getPropertyPhotoConfig,
    getCopy,
    moneyEn,
    moneyZh,
    packages
  };
  globalThis.QuoteCore = api;
  var static_core_default = api;
})();
