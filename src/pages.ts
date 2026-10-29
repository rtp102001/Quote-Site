import { CATEGORIES } from "./categories";
import { esc } from "./html";

export const BRAND = "QuoteLocal";
export const AREA = "Johnston County";

/** Inline SVG icons (stroke-based, 24px grid, no external assets). */
const ICON_PATHS: Record<string, string> = {
  landscaping: '<path d="M12 22V12"/><path d="M12 12C12 7 8 4 3 4c0 5 4 8 9 8z"/><path d="M12 14c0-4 3-7 9-7 0 4-3 7-9 7z"/><path d="M5 22h14"/>',
  hvac: '<path d="M12 3v18"/><path d="M4.2 7.5l15.6 9"/><path d="M19.8 7.5l-15.6 9"/><path d="M9.5 4.5L12 7l2.5-2.5"/><path d="M9.5 19.5L12 17l2.5 2.5"/>',
  roofing: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  septic_plumbing: '<path d="M4 7h7a3 3 0 0 1 3 3v2"/><path d="M4 4v6"/><path d="M12 16c0 1.7 1.3 3 3 3s3-1.3 3-3c0-2-3-5-3-5s-3 3-3 5z"/>',
  electrical: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  form: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
};
export function icon(name: string, size = 24, extra = ""): string {
  return `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${ICON_PATHS[name] ?? ""}</svg>`;
}

const CAT_BLURB: Record<string, string> = {
  landscaping: "Lawn care, sod, mulch, trees & drainage",
  hvac: "Heat pumps, AC repair, furnaces & ducts",
  roofing: "Leaks, shingles, storm damage & new roofs",
  septic_plumbing: "Septic pumping & repair, leaks, water heaters",
  electrical: "Panels, outlets, lighting & generators",
};

const css = `
:root{--bg:#fbf7f0;--card:#fff;--ink:#2b2420;--muted:#6b5f55;--line:#e8dfd2;--brand:#2f6b4f;--brand-d:#245540;--accent:#d9792b;--accent-l:#fbe9d7;--ok:#2f6b4f;--err:#b3261e;--radius:14px;--shadow:0 1px 2px rgba(43,36,32,.06),0 8px 24px rgba(43,36,32,.08)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
a{color:var(--brand)}a:hover{color:var(--brand-d)}
:focus-visible{outline:3px solid var(--accent);outline-offset:2px;border-radius:6px}
.skip{position:absolute;left:-999px}.skip:focus{left:12px;top:12px;background:#fff;padding:8px 12px;z-index:10}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.site-h{background:var(--card);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}
.site-h .wrap{display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:800;font-size:1.15rem;letter-spacing:-.01em}
.logo-mark{width:34px;height:34px;border-radius:10px;background:var(--brand);color:#fff;display:grid;place-items:center}
.logo small{display:block;font-weight:600;font-size:.72rem;color:var(--accent);letter-spacing:.06em;text-transform:uppercase;line-height:1}
.nav a{text-decoration:none;font-weight:600;padding:8px 14px;border:1.5px solid var(--line);border-radius:999px;color:var(--ink);font-size:.92rem}
.nav a:hover{border-color:var(--brand);color:var(--brand)}
.hero{background:radial-gradient(1200px 400px at 80% -10%,#f6dcc0 0,transparent 60%),linear-gradient(180deg,#f4ece0,var(--bg));padding:48px 0 40px}
.hero h1{font-size:clamp(2rem,5.5vw,3.2rem);line-height:1.1;letter-spacing:-.025em;margin:.2em 0 .35em;max-width:16ch}
.hero h1 em{font-style:normal;color:var(--brand)}
.hero p.lead{font-size:1.15rem;color:var(--muted);max-width:56ch;margin:0 0 24px}
.eyebrow{display:inline-flex;align-items:center;gap:6px;background:var(--accent-l);color:#8a4614;font-weight:700;font-size:.8rem;padding:6px 12px;border-radius:999px;letter-spacing:.03em}
.trust{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:22px;color:var(--muted);font-size:.95rem;padding:0;list-style:none}
.trust li{display:flex;align-items:center;gap:6px}.trust .ico{color:var(--brand)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#fff;border:0;border-radius:12px;padding:14px 24px;font:inherit;font-weight:700;font-size:1.05rem;cursor:pointer;text-decoration:none;box-shadow:0 2px 0 #b5611f;transition:transform .05s,background .15s}
.btn:hover{background:#c96a1f;color:#fff}.btn:active{transform:translateY(1px)}.btn[disabled]{opacity:.55;cursor:not-allowed}
.btn.block{width:100%}
section{padding:40px 0}
h2{font-size:clamp(1.4rem,3.5vw,1.9rem);letter-spacing:-.02em;margin:0 0 8px}
.sub{color:var(--muted);margin:0 0 24px}
.steps{display:grid;gap:16px;grid-template-columns:1fr;counter-reset:s;padding:0;list-style:none;margin:0}
.step{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px;display:flex;gap:16px;align-items:flex-start}
.step .n{flex:none;width:44px;height:44px;border-radius:12px;background:#e7f0ea;color:var(--brand);display:grid;place-items:center}
.step h3{margin:0 0 4px;font-size:1.05rem}.step p{margin:0;color:var(--muted);font-size:.95rem}
.cats{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.cat{position:relative;display:block;cursor:pointer}
.cat input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}
.cat .card{height:100%;background:var(--card);border:2px solid var(--line);border-radius:var(--radius);padding:16px;display:flex;flex-direction:column;gap:8px;transition:border-color .15s,box-shadow .15s,transform .1s}
.cat .card .ico-w{width:44px;height:44px;border-radius:12px;background:var(--accent-l);color:#a9561a;display:grid;place-items:center}
.cat .card b{font-size:1rem}.cat .card span{font-size:.85rem;color:var(--muted);line-height:1.35}
.cat:hover .card{border-color:#d8c6b0;transform:translateY(-1px)}
.cat input:checked+.card{border-color:var(--brand);box-shadow:0 0 0 3px #cfe3d7}
.cat input:checked+.card .ico-w{background:var(--brand);color:#fff}
.cat input:focus-visible+.card{outline:3px solid var(--accent);outline-offset:2px}
a.cat{text-decoration:none;color:inherit}
.panel{background:var(--card);border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);padding:24px}
.grid2{display:grid;gap:16px;grid-template-columns:1fr}
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.field label,.legend{font-weight:700;font-size:.95rem}
.hint{font-weight:400;color:var(--muted);font-size:.85rem}
input[type=text],input[type=email],input[type=tel],input[type=number],textarea,select{width:100%;font:inherit;color:var(--ink);background:#fffdfa;border:1.5px solid #d9cdbd;border-radius:10px;padding:12px 14px;min-height:48px}
textarea{min-height:120px;resize:vertical}
input:focus,textarea:focus,select:focus{border-color:var(--brand);outline:3px solid #cfe3d7;outline-offset:0}
fieldset{border:0;padding:0;margin:0 0 16px}legend{padding:0;margin-bottom:8px}
.drop{border:2px dashed #cdb99f;border-radius:var(--radius);background:#fffaf3;padding:24px;text-align:center;cursor:pointer;transition:background .15s,border-color .15s}
.drop.over{background:var(--accent-l);border-color:var(--accent)}
.drop .ico{color:var(--accent)}.drop p{margin:6px 0 0}.drop .browse{color:var(--brand);font-weight:700;text-decoration:underline}
.vh{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.counter{display:flex;align-items:center;justify-content:space-between;margin:10px 2px 0;font-size:.9rem;color:var(--muted)}
.pill{font-weight:700;padding:3px 10px;border-radius:999px;background:#f1e9de;color:var(--muted)}
.pill.good{background:#e7f0ea;color:var(--brand)}.pill.bad{background:#fbe4e2;color:var(--err)}
.thumbs{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:10px;margin-top:12px;padding:0;list-style:none}
.thumbs li{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;border:1px solid var(--line);background:#f4ece0}
.thumbs img{width:100%;height:100%;object-fit:cover;display:block}
.thumbs button{position:absolute;top:4px;right:4px;width:28px;height:28px;border-radius:50%;border:0;background:rgba(43,36,32,.75);color:#fff;display:grid;place-items:center;cursor:pointer}
.alert{border-radius:12px;padding:14px 16px;margin:0 0 18px;display:flex;gap:10px}
.alert.err{background:#fdecea;border:1px solid #f3c2bd;color:#7d1d16}.alert ul{margin:0;padding-left:18px}
.fine{color:var(--muted);font-size:.85rem;text-align:center;margin:12px 0 0}
.ts{margin:4px 0 16px;min-height:65px}
.msg{max-width:620px;margin:48px auto;text-align:center}
.msg .badge{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;margin:0 auto 16px;background:#e7f0ea;color:var(--brand)}
.msg.err .badge{background:#fdecea;color:var(--err)}
.msg h1{font-size:clamp(1.6rem,4vw,2.2rem);margin:0 0 8px;letter-spacing:-.02em}.msg p{color:var(--muted);font-size:1.05rem}
.site-f{border-top:1px solid var(--line);padding:28px 0;color:var(--muted);font-size:.88rem;margin-top:24px}
.site-f .wrap{display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between}
.perks{display:grid;gap:12px;grid-template-columns:1fr;margin:0 0 20px;padding:0;list-style:none}
.perks li{display:flex;gap:10px;align-items:flex-start}.perks .ico{color:var(--brand);flex:none;margin-top:3px}
.checks{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
@media(min-width:720px){.steps{grid-template-columns:repeat(3,1fr)}.grid2{grid-template-columns:1fr 1fr}.panel{padding:36px}.hero{padding:72px 0 56px}.two{display:grid;grid-template-columns:1fr 1.4fr;gap:40px;align-items:start}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

export function layout(title: string, body: string, opts: { siteKey?: string; status?: number } = {}): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · ${BRAND} — ${AREA}</title><meta name="description" content="Free quotes from top-rated local contractors in Johnston County, NC.">
<meta name="theme-color" content="#2f6b4f"><style>${css}</style>
${opts.siteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ""}</head>
<body><a class="skip" href="#main">Skip to content</a>
<header class="site-h"><div class="wrap"><a class="logo" href="/" aria-label="${BRAND} ${AREA} home"><span class="logo-mark">${icon("pin", 20)}</span><span>${BRAND}<small>${AREA}, NC</small></span></a>
<nav class="nav" aria-label="Main"><a href="/contractors/signup">For contractors</a></nav></div></header>
<main id="main">${body}</main>
<footer class="site-f"><div class="wrap"><span>© ${BRAND} — ${AREA}, NC. Free for homeowners.</span><span>We connect you with local pros. We don't handle payments or projects.</span></div></footer>
</body></html>`;
  return new Response(html, { status: opts.status ?? 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function errorBox(errors: string[]): string {
  return errors.length
    ? `<div class="alert err" role="alert" tabindex="-1" id="form-errors">${icon("x", 20)}<div><b>Please fix the following:</b><ul>${errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div></div>`
    : "";
}

export function homePage(siteKey: string, errors: string[] = [], values: Record<string, string> = {}): Response {
  const v = (k: string) => esc(values[k] ?? "");
  const catCards = CATEGORIES.map((c) => `<label class="cat"><input type="radio" name="category" value="${c.id}" required ${values.category === c.id ? "checked" : ""}>
<span class="card"><span class="ico-w">${icon(c.id)}</span><b>${esc(c.label)}</b><span>${esc(CAT_BLURB[c.id])}</span></span></label>`).join("");
  const catLinks = CATEGORIES.map((c) => `<a class="cat" href="#request" data-cat="${c.id}"><span class="card"><span class="ico-w">${icon(c.id)}</span><b>${esc(c.label)}</b><span>${esc(CAT_BLURB[c.id])}</span></span></a>`).join("");
  return layout("Free local quotes", `
<section class="hero"><div class="wrap">
<span class="eyebrow">${icon("pin", 14)} Serving all of ${AREA}, NC</span>
<h1>Get quotes from <em>top-rated local pros</em> in one step.</h1>
<p class="lead">Describe your project once, add a few photos, and we'll send it to up to 10 of the best-reviewed contractors near you, from Clayton to Benson. They contact you directly.</p>
<a class="btn" href="#request">Start my free request</a>
<ul class="trust"><li>${icon("check", 18)} 100% free for homeowners</li><li>${icon("shield", 18)} Your info only goes to matched pros</li><li>${icon("pin", 18)} Local to ${AREA}</li></ul>
</div></section>

<section aria-labelledby="how"><div class="wrap"><h2 id="how">How it works</h2><p class="sub">Three quick steps. No account needed.</p>
<ol class="steps">
<li class="step"><span class="n">${icon("form")}</span><div><h3>1. Tell us about the job</h3><p>Pick a service, describe what you need, and add 3 to 5 photos.</p></div></li>
<li class="step"><span class="n">${icon("mail")}</span><div><h3>2. Confirm your email</h3><p>One click confirms you're real. That keeps spam away from local pros.</p></div></li>
<li class="step"><span class="n">${icon("phone")}</span><div><h3>3. Pros reach out</h3><p>Up to 10 top-rated contractors nearby get your request and contact you with a quote or ballpark.</p></div></li>
</ol></div></section>

<section aria-labelledby="services" style="padding-top:8px"><div class="wrap"><h2 id="services">Services we cover</h2><p class="sub">Choose a service to get started.</p>
<div class="cats">${catLinks}</div></div></section>

<section id="request" aria-labelledby="req-h"><div class="wrap"><div class="panel">
<h2 id="req-h">Request your free quotes</h2><p class="sub">Takes about two minutes. Johnston County, NC addresses only.</p>
${errorBox(errors)}
<form id="quote-form" method="post" action="/api/quote" enctype="multipart/form-data" novalidate>
<fieldset><legend class="legend">What do you need help with?</legend><div class="cats">${catCards}</div></fieldset>
<div class="field"><label for="description">Describe the job <span class="hint">(what's happening, how big, how soon)</span></label>
<textarea id="description" name="description" required minlength="10" maxlength="4000" placeholder="e.g. Septic alarm keeps going off and the yard is soggy near the tank. House built in 1998.">${v("description")}</textarea></div>
<fieldset><legend class="legend">Photos <span class="hint">(3 to 5 required · JPEG, PNG, WebP or GIF · up to 5 MB each)</span></legend>
<div class="drop" id="drop" tabindex="0" role="button" aria-describedby="photo-count">
${icon("camera", 32)}<p><b>Drag photos here</b> or <span class="browse">browse your device</span></p><p class="hint">Show the problem area from a few angles.</p></div>
<input class="vh" id="photos" name="photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple aria-label="Choose 3 to 5 photos">
<div class="counter"><span id="photo-help">Add at least 3 photos.</span><span class="pill" id="photo-count" aria-live="polite">0 / 5</span></div>
<ul class="thumbs" id="thumbs" aria-label="Selected photos"></ul></fieldset>
<div class="grid2">
<div class="field"><label for="name">Your name</label><input type="text" id="name" name="name" autocomplete="name" required maxlength="100" value="${v("name")}"></div>
<div class="field"><label for="zip">ZIP code <span class="hint">(Johnston County)</span></label><input type="text" id="zip" name="zip" inputmode="numeric" autocomplete="postal-code" pattern="\\d{5}" maxlength="5" required value="${v("zip")}"></div>
<div class="field"><label for="email">Email</label><input type="email" id="email" name="email" autocomplete="email" required value="${v("email")}"></div>
<div class="field"><label for="phone">Phone</label><input type="tel" id="phone" name="phone" autocomplete="tel" required value="${v("phone")}"></div>
</div>
<div class="cf-turnstile ts" data-sitekey="${esc(siteKey)}"></div>
<button class="btn block" type="submit" id="submit">Send my request</button>
<p class="fine">We'll email you a confirmation link first. Your details go only to the matched contractors.</p>
</form></div></div></section>
<script>
(()=>{const MAX=5,MIN=3,CAP=5*1024*1024,OK=["image/jpeg","image/png","image/webp","image/gif"];
const input=document.getElementById('photos'),drop=document.getElementById('drop'),thumbs=document.getElementById('thumbs'),count=document.getElementById('photo-count'),help=document.getElementById('photo-help'),form=document.getElementById('quote-form');
let files=[];
function sync(){const dt=new DataTransfer();files.forEach(f=>dt.items.add(f));input.files=dt.files;thumbs.innerHTML='';
files.forEach((f,i)=>{const li=document.createElement('li');const img=document.createElement('img');img.alt='Photo '+(i+1)+': '+f.name;img.src=URL.createObjectURL(f);
const b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Remove photo '+(i+1));b.innerHTML='&times;';b.onclick=()=>{files.splice(i,1);sync()};li.append(img,b);thumbs.append(li)});
const n=files.length;count.textContent=n+' / '+MAX;count.className='pill '+(n>=MIN&&n<=MAX?'good':n>0?'bad':'');
help.textContent=n<MIN?'Add '+(MIN-n)+' more photo'+(MIN-n===1?'':'s')+'.':n===MAX?'Maximum reached.':'Looks good! You can add up to '+(MAX-n)+' more.'}
function add(list){let msg='';for(const f of list){if(files.length>=MAX){msg='You can upload up to 5 photos.';break}
if(!OK.includes(f.type)){msg=f.name+' is not a supported image type.';continue}if(f.size>CAP){msg=f.name+' is larger than 5 MB.';continue}files.push(f)}
sync();if(msg)help.textContent=msg}
drop.onclick=()=>input.click();drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click()}};
input.onchange=()=>{const l=[...input.files];add(l)};
['dragenter','dragover'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.add('over')}));
['dragleave','drop'].forEach(t=>drop.addEventListener(t,e=>{e.preventDefault();drop.classList.remove('over')}));
drop.addEventListener('drop',e=>add([...e.dataTransfer.files]));
document.querySelectorAll('a.cat[data-cat]').forEach(a=>a.addEventListener('click',()=>{const r=form.querySelector('input[value="'+a.dataset.cat+'"]');if(r)r.checked=true}));
form.addEventListener('submit',e=>{if(files.length<MIN||files.length>MAX){e.preventDefault();help.textContent='Please add 3 to 5 photos.';count.className='pill bad';drop.focus();return}
if(!form.checkValidity()){e.preventDefault();form.reportValidity()}});
const err=document.getElementById('form-errors');if(err)err.focus();})();
</script>`, { siteKey });
}

export function signupPage(siteKey: string, errors: string[] = []): Response {
  const checks = CATEGORIES.map((c) => `<label class="cat"><input type="checkbox" name="categories" value="${c.id}"><span class="card"><span class="ico-w">${icon(c.id)}</span><b>${esc(c.label)}</b></span></label>`).join("");
  return layout("Contractor sign-up", `
<section class="hero" style="padding-bottom:24px"><div class="wrap"><span class="eyebrow">${icon("pin", 14)} For ${AREA} contractors</span>
<h1>Get real local jobs, <em>free</em>.</h1>
<p class="lead">Homeowners describe the job and include photos. We send each request to up to 10 top-rated pros nearby, ranked by rating, reviews, and distance.</p></div></section>
<section style="padding-top:8px"><div class="wrap two">
<div><h2>Why join</h2><ul class="perks">
<li>${icon("check")}<div><b>Verified homeowners.</b> Every request is email-confirmed and photo-backed.</div></li>
<li>${icon("check")}<div><b>No lead fees.</b> Free during launch, and no bidding wars.</div></li>
<li>${icon("check")}<div><b>Talk directly.</b> Reply straight to the homeowner. We stay out of the way.</div></li></ul></div>
<div class="panel"><h2>Create your listing</h2><p class="sub">Takes one minute.</p>${errorBox(errors)}
<form method="post" action="/api/contractors">
<div class="grid2">
<div class="field"><label for="contact_name">Your name</label><input type="text" id="contact_name" name="contact_name" autocomplete="name" required></div>
<div class="field"><label for="business_name">Business name</label><input type="text" id="business_name" name="business_name" autocomplete="organization" required></div>
<div class="field"><label for="email">Email for leads</label><input type="email" id="email" name="email" autocomplete="email" required></div>
<div class="field"><label for="phone">Phone</label><input type="tel" id="phone" name="phone" autocomplete="tel" required></div>
<div class="field"><label for="zip">Business ZIP</label><input type="text" id="zip" name="zip" inputmode="numeric" pattern="\\d{5}" maxlength="5" required></div>
<div class="field"><label for="radius">Service radius <span class="hint">(miles)</span></label><input type="number" id="radius" name="service_radius_miles" min="5" max="100" value="30" required></div>
</div>
<fieldset><legend class="legend">Services you offer</legend><div class="checks">${checks}</div></fieldset>
<div class="cf-turnstile ts" data-sitekey="${esc(siteKey)}"></div>
<button class="btn block" type="submit">Join ${BRAND}</button></form></div></div></section>`, { siteKey });
}

export function messagePage(title: string, msg: string, status = 200, cls: "ok" | "err" = "ok"): Response {
  return layout(title, `<div class="wrap"><div class="msg ${cls === "err" ? "err" : ""}" role="${cls === "err" ? "alert" : "status"}">
<div class="badge">${icon(cls === "err" ? "x" : "check", 36)}</div><h1>${esc(title)}</h1><p>${msg}</p>
<p><a class="btn" href="/">Back to ${BRAND}</a></p></div></div>`, { status });
}
