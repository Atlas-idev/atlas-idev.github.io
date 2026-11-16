(() => {
  "use strict";

  /* ---------- Assistant : bulle de questions sur Juan ----------
     Avec data-endpoint (Worker de assistant/), les réponses viennent de Gemini.
     Sans, ou si l'IA ne répond pas, les réponses préparées ci-dessous prennent le relais. */
  const box = document.querySelector("[data-assistant]");
  if (!box) return;

  const endpoint = (box.dataset.endpoint || "").trim();
  const launcher = box.querySelector(".ai__launcher");
  const panel = box.querySelector(".ai__panel");
  const log = box.querySelector(".ai__log");
  const form = box.querySelector(".ai__form");
  const input = box.querySelector(".ai__input");
  const send = box.querySelector(".ai__send");
  const chips = box.querySelector(".ai__chips");
  const teaser = box.querySelector(".ai__teaser");
  const STORE = "jh-assistant";
  const WELCOME = "Bonjour ! Je suis l'assistant de Juan. Posez-moi vos questions sur son parcours, ses compétences, ses projets ou sa disponibilité.";

  let history = [];
  let busy = false;
  let online = Boolean(endpoint);

  /* Réponses préparées : mots-clés (sans accents) → réponse. Les plus précises d'abord. */
  const MAIL = "jhaminarivo@gmail.com";
  const ANSWERS = [
    { keys: ["parkme", "parking", "stationnement", "garer"],
      text: "**ParkMe** permet de réserver une place de parking à Madagascar. Un seul code Expo tourne sur iOS, Android et le web, avec une API Node.js temps réel (Socket.IO) et PostgreSQL.\n- Carte et itinéraire intégrés, places libres en direct\n- Réservation en 4 étapes avec plan des places, Mobile Money simulé, ticket QR code\n- Espaces gardien et administrateur, 290 contrôles automatisés" },
    { keys: ["taskflow", "kanban", "suivi de production", "gestion des taches"],
      text: "**Aylmara Taskflows** est l'outil de suivi de production des campagnes d'Aylmara, pour l'équipe et son client. Laravel 12, React et MySQL :\n- 4 espaces aux droits vérifiés par le serveur\n- Validation des tâches, Kanban, planning d'équipe, congés et pilotage\n- Import Excel, assistant IA et 103 tests automatisés" },
    { keys: ["securit", "incident", "securite"],
      text: "**SecurIT** (2025) est une application de signalement et de suivi des incidents de sécurité : interface React, back-end Django, PostgreSQL, tableaux de bord, authentification et gestion des rôles." },
    { keys: ["hackathon", "axian", "try-on", "essayage"],
      text: "Au **hackathon interuniversitaire Axian** (2024), Juan a conçu en équipe une plateforme d'essayage en ligne (virtual try-on) : parcours utilisateur, maquettes et prototype présentés au pitch final devant un jury." },
    { keys: ["tarif", "prix", "cout", "devis", "budget", "combien", "price", "rate"],
      text: `Les tarifs dépendent du projet : périmètre, délais, maintenance. Décrivez votre besoin à ${MAIL} : Juan vous répondra avec une proposition adaptée.` },
    { keys: ["disponib", "freelance", "mission", "recrut", "embauch", "collabor", "stage", "emploi", " job", "hire", "available", "travailler avec"],
      text: `Oui : en 2026, Juan est **ouvert aux missions freelance et aux collaborations** en développement web et mobile. Le plus simple est de lui écrire à ${MAIL} avec quelques mots sur votre projet.` },
    { keys: ["contact", "joindre", "mail", "telephone", " tel ", "numero", "appeler", "whatsapp", "ecrire", "github", "linkedin"],
      text: `- E-mail : ${MAIL}\n- Téléphone : +261 34 39 775 92\n- GitHub : https://github.com/Atlas-idev\nIl est basé à Antananarivo (UTC+3).` },
    { keys: [" cv", "curriculum", "resume", "telecharg"],
      text: "Le CV est en ligne : https://atlas-idev.github.io/cv.html\nVersion PDF : https://atlas-idev.github.io/assets/CV-HAMINARIVO.pdf" },
    { keys: ["competence", "techno", "stack", "langage", "outil", "maitrise", "framework", "skill", "react", "laravel", "django", "flutter", "php", "python", "java", "figma"],
      text: "Sa stack :\n- **Front-end** : React, JavaScript, HTML5, CSS3\n- **Back-end** : Laravel, PHP, Python, Django, Java, C#\n- **Mobile** : React Native, Flutter, Dart\n- **Données & CMS** : PostgreSQL, MySQL, WordPress\n- **Design & outils** : Figma, Canva, Git & GitHub" },
    { keys: ["service", "propose", "prestation", "faire pour", "site vitrine", "wordpress", "creer", "refonte", "seo", "crm", "newsletter", "application"],
      text: "Juan peut porter un projet de A à Z :\n- **Sites vitrines & WordPress** : création, refonte, SEO, performance\n- **Applications web** : React, Laravel ou Django, API REST, rôles, bases de données\n- **Applications mobiles** iOS et Android (React Native, Flutter)\n- **Intégration & CRM** : maquettes Figma en interfaces fidèles, newsletters" },
    { keys: ["experience", "parcours", "aylmara", "alternance", "poste", "entreprise", "carriere", "yavoloko", "decennale", "travaille"],
      text: "- **Aylmara** (depuis nov. 2025, alternance) : développeur web & intégrateur. Applications web et modules métier dont Taskflows, site aylmara.com, newsletters CRM, tests et maintenance.\n- **Yavoloko.art** (2024 – 2026) : site WordPress de la galerie d'art, refondu en 2026.\n- **VotreDecennaleFacile.fr** (avril 2025, freelance) : design et intégration WordPress, UX et SEO." },
    { keys: ["projet", "realisation", "portfolio", "site en ligne", "production", "nlamada", "client"],
      text: "Projets phares :\n- **Aylmara Taskflows** : suivi de production des campagnes (Laravel 12, React, MySQL)\n- **ParkMe** : réservation de parkings sur iOS, Android et web (Expo, Node.js, PostgreSQL)\n- **SecurIT** : signalement d'incidents de sécurité (React, Django)\n- **Hackathon Axian** : plateforme d'essayage en ligne\nSites en production : aylmara.com, nlamada.com, yavoloko.art, votredecennalefacile.fr." },
    { keys: ["formation", "etude", "diplome", "ecole", "esti", "licence", "universite", "gasytech", "robotique", "lycee"],
      text: "- **Licence informatique** (intégration & développement) à l'ESTI, Antananarivo, depuis 2023\n- Formation de base en **robotique** chez GasyTech (2025)\n- Lycée Privé Commercial L.P.C. (2023)" },
    { keys: ["langue", "anglais", "francais", "malgache", "english", "parle-t-il", "parlez"],
      text: "Malgache (langue maternelle), français (B2, courant) et anglais (B1, intermédiaire)." },
    { keys: ["methode", "process", "etape", "demarche", "organis", "comment travaille", "comment il travaille"],
      text: "Sa méthode en 4 étapes : **analyser** les besoins métier, **concevoir** (parcours, maquettes Figma, architecture), **développer** (intégration responsive, back-end, API, base de données), puis **tester et maintenir** (corrections, SEO, performances)." },
    { keys: ["ou est", "ou vit", "ou se trouve", "habite", "est base", "basee", "localis", "ville", "pays", "madagascar", "antananarivo", "fuseau", "heure locale", "a distance", "remote", "teletravail"],
      text: "Juan est basé à **Antananarivo, Madagascar** (UTC+3). Ses réalisations comptent des sites pour des entreprises françaises et malgaches." },
    { keys: ["qualite", "atout", "point fort", "soft skill", "personnalite", "devise"],
      text: "Adaptabilité, communication, travail en équipe, résolution de problèmes et respect des délais. Sa devise : « Never give up. »" },
    { keys: [" qui ", "presente", "profil", "juan", "about", " lui "],
      text: "**Juan (Haminarivo Ny Mandresy Juan Davids)** est développeur web full-stack à Antananarivo. Étudiant en licence informatique à l'ESTI et alternant chez Aylmara, il conçoit et développe des sites, des applications web et mobiles, de la maquette Figma jusqu'à la mise en ligne." },
    { keys: ["merci", "thanks", " super ", "parfait", "genial", " top "],
      text: "Avec plaisir ! Autre chose sur Juan ?" },
    { keys: ["bonjour", "salut", "hello", "bonsoir", "coucou", "hey", " hi "],
      text: "Bonjour ! Que voulez-vous savoir sur Juan : ses compétences, ses projets, son parcours ou sa disponibilité ?" },
  ];
  const UNKNOWN = `Je n'ai pas cette information. Je peux vous parler de ses compétences, de ses projets, de son parcours, de sa formation ou de sa disponibilité. Pour le reste, écrivez-lui : ${MAIL}.`;

  const normalize = (s) => ` ${s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9@.+-]+/g, " ")} `;
  const localAnswer = (question) => {
    const q = normalize(question);
    let best = null;
    let score = 0;
    // Un mot-clé long est plus précis : il pèse plus lourd.
    ANSWERS.forEach((a) => {
      const s = a.keys.reduce((sum, k) => sum + (q.includes(k) ? k.trim().length : 0), 0);
      if (s > score) { best = a; score = s; }
    });
    return best ? best.text : UNKNOWN;
  };

  /* Mise en forme sûre : texte échappé, puis gras, liens et retours à la ligne. */
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const format = (text) => esc(text)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?])/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>')
    .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.-]*\w)/g, '$1<a href="mailto:$2">$2</a>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- /gm, "• ")
    .replace(/\n/g, "<br>");

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };
  const bubble = (role, text) => {
    const el = document.createElement("div");
    el.className = `ai__msg ai__msg--${role === "user" ? "user" : "bot"}`;
    el.innerHTML = role === "user" ? esc(text).replace(/\n/g, "<br>") : format(text);
    log.append(el);
    scrollDown();
    return el;
  };
  const save = () => {
    try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-30))); } catch (e) { /* navigation privée */ }
  };

  const askAI = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reply) return data.reply;
      throw new Error(data.error || `HTTP ${res.status}`);
    } finally {
      clearTimeout(timer);
    }
  };

  const ask = async (question) => {
    const text = question.trim().slice(0, 500);
    if (!text || busy) return;
    busy = true;
    send.disabled = true;
    chips.hidden = true;
    history.push({ role: "user", text });
    bubble("user", text);
    save();

    const typing = document.createElement("div");
    typing.className = "ai__msg ai__msg--bot ai__typing";
    typing.setAttribute("aria-label", "L'assistant écrit");
    typing.innerHTML = "<i></i><i></i><i></i>";
    log.append(typing);
    scrollDown();

    let reply;
    if (online) {
      try { reply = await askAI(); } catch (e) { online = false; }
    } else {
      await new Promise((r) => setTimeout(r, 450));
    }
    if (!reply) reply = localAnswer(text);

    typing.remove();
    history.push({ role: "assistant", text: reply });
    bubble("assistant", reply);
    save();
    busy = false;
    send.disabled = false;
    input.focus({ preventScroll: true });
  };

  /* Ouverture / fermeture */
  const open = (state) => {
    panel.hidden = !state;
    box.classList.toggle("is-open", state);
    launcher.setAttribute("aria-expanded", String(state));
    launcher.setAttribute("aria-label", state ? "Fermer l'assistant" : "Ouvrir l'assistant");
    if (state) {
      teaser.hidden = true;
      try { sessionStorage.setItem(`${STORE}-seen`, "1"); } catch (e) { /* navigation privée */ }
      scrollDown();
      if (window.matchMedia("(hover: hover)").matches) input.focus({ preventScroll: true });
    }
  };
  launcher.addEventListener("click", () => open(panel.hidden));
  box.querySelector(".ai__close").addEventListener("click", () => { open(false); launcher.focus(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) { open(false); launcher.focus(); }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = input.value;
    input.value = "";
    input.style.height = "";
    ask(q);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener("input", () => {
    input.style.height = "";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  });
  chips.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => ask(b.textContent)));

  /* Petite invitation, une fois par visite */
  teaser.querySelector("button").addEventListener("click", () => {
    teaser.hidden = true;
    try { sessionStorage.setItem(`${STORE}-seen`, "1"); } catch (e) { /* navigation privée */ }
  });
  let seen = false;
  try { seen = sessionStorage.getItem(`${STORE}-seen`) === "1"; } catch (e) { /* navigation privée */ }
  if (!seen) setTimeout(() => { if (panel.hidden) teaser.hidden = false; }, 9000);

  /* Conversation reprise pendant la visite */
  try { history = JSON.parse(sessionStorage.getItem(STORE) || "[]"); } catch (e) { history = []; }
  bubble("assistant", WELCOME);
  history.forEach((m) => bubble(m.role, m.text));
  if (history.length) chips.hidden = true;
})();
