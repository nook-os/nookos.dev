/* nookos.dev — progressive enhancement only. Nothing here is required for the
   page to be readable: JS off gives you the same content, the seeded hero
   transcript, an expanded nav and no copy buttons. No dependencies, no build. */
(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
  const esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* ── mobile nav ─────────────────────────────────────────────────── */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "close" : "menu";
    };
    toggle.addEventListener("click", () => setOpen(nav.dataset.open !== "true"));
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.dataset.open === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ── boot sequence ──────────────────────────────────────────────── */
  // Short on purpose: it sets the scene, it doesn't hold the page hostage.
  const boot = document.getElementById("boot");

  // Every value starts at the same column, and the node rows share their own
  // grid — a status readout whose columns wander looks like output nobody
  // checked.
  const BOOT_LINES = [
    'nookos <i>v1.0</i> · <i>apache-2.0</i>',
    "nodes ................. <b>2 online</b>",
    "  azul     linux  <i>claude codex bash</i>",
    "  crimson  linux  <i>hermes bash</i>",
    "sessions .............. <b>1 attached</b>",
  ];

  async function runBoot() {
    if (!boot) return;
    if (reduced) {
      boot.innerHTML = BOOT_LINES.join("\n");
      return;
    }
    for (const line of BOOT_LINES) {
      boot.innerHTML += (boot.innerHTML ? "\n" : "") + line;
      await sleep(180);
    }
  }

  /* ── the demo shell ─────────────────────────────────────────────── */
  const shell = document.getElementById("shell");
  const log = document.getElementById("shellLog");
  const form = document.getElementById("shellForm");
  const input = document.getElementById("shellInput");
  const live = document.getElementById("shellLive");

  if (shell && log && form && input) {
    // One small in-memory fleet. It is a simulator and says so in the title
    // bar — but every command it accepts is a real `nook` command, because a
    // toy that teaches the wrong CLI is worse than no toy.
    const NODES = [
      { name: "azul", platform: "linux", status: "online", runtimes: ["claude", "codex", "bash"] },
      { name: "crimson", platform: "linux", status: "online", runtimes: ["hermes", "bash"] },
    ];
    const WORKSPACES = [
      { name: "acme/checkout-api", branch: "main", nodes: ["azul", "crimson"] },
      { name: "globex/billing-worker", branch: "main", nodes: ["crimson"] },
      { name: "widgets/web-dashboard", branch: "feat/sparkline", nodes: ["azul"] },
    ];
    const sessions = [
      { name: "api", workspace: "acme/checkout-api", runtime: "claude", node: "azul", status: "running" },
    ];

    const history = [];
    let histIndex = -1;
    let busy = false;

    const write = (html) => {
      log.insertAdjacentHTML("beforeend", html + "\n");
      log.scrollTop = log.scrollHeight;
    };
    const echo = (cmd) =>
      write(`<span class="prompt">$</span> <span class="cmd">${esc(cmd)}</span>`);
    const out = (s) => write(`<span class="out">${s}</span>`);
    const ok = (s) => write(`<span class="ok">✓</span> <span class="out">${s}</span>`);
    const err = (s) => write(`<span class="err">Error:</span> <span class="out">${s}</span>`);
    const dim = (s) => write(`<span class="dim">${s}</span>`);

    const announce = (s) => {
      if (live) live.textContent = s;
    };

    const pad = (s, n) => String(s).padEnd(n, " ");

    // Canned answers, matched on intent. Deliberately few: the point is the
    // round trip, not pretending to be a language model.
    const ANSWERS = [
      [/test/i, [
        "Running <span class='cmd'>cargo test</span> …",
        "  <span class='ok'>34 passed</span>, 0 failed, 2 ignored (4.8s)",
        "All green. The retry path is covered by <span class='cmd'>gateway::retries_on_502</span>.",
      ]],
      [/retr|backoff/i, [
        "Added exponential backoff to the gateway client: 3 attempts,",
        "100ms base, jittered. 5xx and timeouts retry; 4xx do not.",
        "Want me to run the tests?",
      ]],
      [/commit|push/i, [
        "Committed as <span class='cmd'>a91f2c4</span> — \"retry transient gateway failures\".",
        "Not pushed; say the word.",
      ]],
      [/machine|where|who|repo/i, [
        "I'm on azul (linux), in /srv/work/acme/checkout-api — the payment",
        "capture and settlement service.",
      ]],
    ];

    const answerFor = (prompt) => {
      for (const [re, lines] of ANSWERS) if (re.test(prompt)) return lines;
      return [
        "Got it. Working on that now — I'll leave the diff staged so you can",
        "review it with <span class='cmd'>nook read</span> when you're back.",
      ];
    };

    const findSession = (name) => sessions.find((s) => s.name === name);

    // Mirrors `nook exec`: the prompt echoed back, the reply, then a dim
    // trailer naming the runtime and its state. Kept deliberately in step with
    // crates/nook-node/src/style.rs — a demo that shows output the CLI does not
    // produce is a lie people discover after installing.
    async function agentReply(prompt, session) {
      write(`<span class="flag">❯</span> <span class="out">${esc(prompt)}</span>`);
      await sleep(420);
      const lines = answerFor(prompt);
      write(`<span class="ok">●</span> <span class="out">${lines[0]}</span>`);
      for (const l of lines.slice(1)) {
        await sleep(160);
        out("  " + l);
      }
      await sleep(140);
      dim(`  ${esc(session.runtime)} · ${esc(session.status)}`);
    }

    // Plain text, escaped only after padding — pad on what the eye sees, not
    // on "&lt;repo&gt;", or the columns drift by the length of every entity.
    const HELP = [
      ["nook get nodes|workspaces|sessions", "list what the fleet has"],
      ["nook start <repo> --node <n> --runtime <r>", "open a session anywhere"],
      ["nook exec <session> '<prompt>'", "type at it and wait for the answer"],
      ["nook send / nook read", "type without waiting / look at the screen"],
      ["nook delete sessions <name>", "tear it down"],
      ["nook whoami", "which credential am I holding"],
      ["clear", "clear this screen"],
    ];

    async function run(raw) {
      const line = raw.trim();
      if (!line) return;

      echo(line);
      history.unshift(line);
      histIndex = -1;

      const argv = line.match(/'[^']*'|"[^"]*"|\S+/g) || [];
      const bare = argv.map((a) => a.replace(/^['"]|['"]$/g, ""));
      const [cmd, ...rest] = bare;

      /* jokes first — they're the reason people keep typing */
      if (cmd === "ssh" || cmd === "scp") {
        dim("# that's the point. you don't need it here.");
        return out("Try <span class='cmd'>nook start acme/checkout-api --runtime claude</span> instead.");
      }
      if (cmd === "sudo") {
        return out("you're already root on your own fleet.");
      }
      if (cmd === "rm" && bare.includes("-rf")) {
        return out("nice try. this shell is a simulator — your machines are fine.");
      }
      if (cmd === "tmux") {
        return out("no tmux to attach to. that's nook's job now — sessions are already persistent.");
      }
      if (cmd === "exit" || cmd === "logout") {
        return dim("# sessions outlive you. that's the feature.");
      }
      if (cmd === "clear") {
        log.innerHTML = "";
        return;
      }
      if (cmd === "help" || cmd === "?") {
        out("The whole protocol:");
        HELP.forEach(([c, d]) =>
          write(`  <span class="cmd">${esc(pad(c, 44))}</span><span class="dim">${esc(d)}</span>`)
        );
        return;
      }
      if (cmd !== "nook") {
        return err(`${esc(cmd)}: not found. type <span class="cmd">help</span>.`);
      }

      const sub = rest[0];

      if (sub === "whoami") {
        out("server:  https://nook.example.com");
        out("as:      you@example.com <span class='dim'>(user token — can drive any node)</span>");
        return out("tenant:  demo");
      }

      if (sub === "get") {
        const what = rest[1];
        if (/^node/.test(what || "")) {
          write(`<span class="dim">${pad("NAME", 10)}${pad("PLATFORM", 10)}${pad("STATUS", 9)}RUNTIMES</span>`);
          NODES.forEach((n) =>
            out(`${pad(n.name, 10)}${pad(n.platform, 10)}<span class="ok">${pad(n.status, 9)}</span>${n.runtimes.join(",")}`)
          );
          return;
        }
        if (/^workspace/.test(what || "")) {
          write(`<span class="dim">${pad("NAME", 26)}${pad("BRANCH", 18)}NODES</span>`);
          WORKSPACES.forEach((w) => out(`${pad(w.name, 26)}${pad(w.branch, 18)}${w.nodes.join(",")}`));
          return;
        }
        if (/^session/.test(what || "")) {
          if (!sessions.length) return dim("no sessions.");
          write(`<span class="dim">${pad("NAME", 12)}${pad("RUNTIME", 10)}${pad("NODE", 10)}STATUS</span>`);
          sessions.forEach((s) =>
            out(`${pad(s.name, 12)}${pad(s.runtime, 10)}${pad(s.node, 10)}<span class="ok">${s.status}</span>`)
          );
          return;
        }
        return err("get what? try <span class='cmd'>nook get nodes</span>.");
      }

      if (sub === "start") {
        const ws = rest[1];
        const flag = (f) => {
          const i = rest.indexOf(f);
          return i > -1 ? rest[i + 1] : undefined;
        };
        if (!ws) return err("which workspace? try <span class='cmd'>nook get workspaces</span>.");
        const wsRec = WORKSPACES.find((w) => w.name === ws || w.name.endsWith("/" + ws));
        if (!wsRec) return err(`no workspace named '${esc(ws)}' — try <span class="cmd">nook get workspaces</span>.`);

        const runtime = flag("--runtime") || "bash";
        const node = flag("--node") || wsRec.nodes[0];
        const name = flag("--name") || runtime + "-" + (sessions.length + 1);

        const nodeRec = NODES.find((n) => n.name === node);
        if (!nodeRec) return err(`no node named '${esc(node)}'.`);
        if (!wsRec.nodes.includes(node))
          return err(`'${esc(node)}' has no online checkout of this workspace.`);
        if (!nodeRec.runtimes.includes(runtime))
          return err(`runtime '${esc(runtime)}' is not installed on this node.`);

        busy = true;
        dim("starting …");
        await sleep(500);
        sessions.push({ name, workspace: wsRec.name, runtime, node, status: "running" });
        ok(`${esc(name)} — ${esc(runtime)} on ${esc(node)}`);
        dim(`  nook exec ${esc(name)} 'your prompt'`);
        dim(`  nook read ${esc(name)}`);
        busy = false;
        announce(`Session ${name} started on ${node}`);
        return;
      }

      if (sub === "exec" || sub === "send") {
        const name = rest[1];
        const prompt = rest.slice(2).join(" ");
        const s = findSession(name);
        if (!s) return err(`no session named '${esc(name || "")}' — try <span class="cmd">nook get sessions</span>.`);
        if (!prompt) return err("nothing to send. put your prompt in quotes.");
        if (s.runtime !== "claude") {
          return out(`sent to ${esc(name)} <span class="dim">(runtime=${esc(s.runtime)} — that's a shell, not an agent)</span>`);
        }
        if (sub === "send") {
          ok(`sent to ${esc(name)}`);
          return dim(`  nook read ${esc(name)}   # look when you're ready`);
        }
        busy = true;
        await agentReply(prompt, s);
        busy = false;
        announce("The agent replied.");
        return;
      }

      if (sub === "read") {
        const s = findSession(rest[1]);
        if (!s) return err(`no session named '${esc(rest[1] || "")}'.`);
        dim(`── ${s.name} · runtime=${s.runtime} · node=${s.node} · status=${s.status} ──`);
        out("▐▛███▜▌   Claude Code");
        out("▝▜█████▛▘  Opus 4.8 · " + s.workspace);
        out("  ▘▘ ▝▝");
        return dim("(still there. it was always still there.)");
      }

      if (sub === "delete") {
        const name = rest[2];
        const i = sessions.findIndex((s) => s.name === name);
        if (i < 0) return err(`no session named '${esc(name || "")}'.`);
        sessions.splice(i, 1);
        return ok(`Deleted session '${esc(name)}'`);
      }

      return err(`unknown command '${esc(sub || "")}' — type <span class="cmd">help</span>.`);
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      const value = input.value;
      input.value = "";
      await run(value);
    });

    // Clicking anywhere in the terminal should put the cursor where you expect.
    shell.addEventListener("click", (e) => {
      if (e.target.closest("button") || window.getSelection().toString()) return;
      input.focus();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histIndex < history.length - 1) input.value = history[++histIndex];
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histIndex > 0) input.value = history[--histIndex];
        else {
          histIndex = -1;
          input.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        const vocab = [
          "help",
          "clear",
          "nook whoami",
          "nook get nodes",
          "nook get workspaces",
          "nook get sessions",
          "nook start acme/checkout-api --node azul --runtime claude --name api",
          "nook exec api 'run the tests'",
          "nook read api",
          "nook delete sessions api",
        ];
        const hit = vocab.find((v) => v.startsWith(input.value) && v !== input.value);
        if (hit) input.value = hit;
      }
    });

    document.querySelectorAll(".chip[data-cmd]").forEach((chip) => {
      chip.addEventListener("click", async () => {
        if (busy) return;
        input.value = "";
        input.focus();
        await run(chip.dataset.cmd);
      });
    });
  }

  /* ── tabbed install ─────────────────────────────────────────────── */
  // APG tabs with automatic activation: roving tabindex, arrows wrap,
  // Home/End jump. Panels render visible (JS off = every method readable);
  // enhancing hides the inactive ones and keeps [hidden] in step with the tab.
  document.querySelectorAll("[data-tabs]").forEach((group) => {
    const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
    if (tabs.length < 2) return;
    const panelFor = (tab) => document.getElementById(tab.getAttribute("aria-controls"));

    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = panelFor(t);
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    };

    group.dataset.enhanced = "true";
    // Honour a server-marked selection if present, else the first tab.
    select(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0], false);

    group.addEventListener("click", (e) => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) select(tab, true);
    });

    group.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      let j = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") j = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = tabs.length - 1;
      if (j === null) return;
      e.preventDefault();
      select(tabs[j], true);
    });
  });

  /* ── copy buttons on code blocks ────────────────────────────────── */
  // Prompts are decorative, so they are stripped before the clipboard sees
  // them — pasting "$ nook run" into a shell is a small, avoidable insult.
  document.querySelectorAll(".code").forEach((block) => {
    const pre = block.querySelector("pre");
    if (!pre || !navigator.clipboard) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "copy";
    btn.setAttribute("aria-label", "Copy this command to the clipboard");

    btn.addEventListener("click", async () => {
      const text = Array.from(pre.childNodes)
        .map((n) =>
          n.nodeType === Node.ELEMENT_NODE && n.classList.contains("prompt")
            ? ""
            : n.textContent
        )
        .join("")
        .trim();
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "copied";
        btn.dataset.copied = "true";
        setTimeout(() => {
          btn.textContent = "copy";
          delete btn.dataset.copied;
        }, 1600);
      } catch {
        btn.textContent = "failed";
        setTimeout(() => (btn.textContent = "copy"), 1600);
      }
    });

    block.appendChild(btn);
  });

  /* ── footer year ────────────────────────────────────────────────── */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  runBoot();

  /* ── desktop apps ───────────────────────────────────────────────────
     All three are always shown and always work; this only marks the one you
     are on. Detection is advisory, so being wrong costs a highlight rather
     than a download, and with JS off the cards behave identically. */
  (function markCurrentPlatform() {
    const row = document.getElementById("appsRow");
    if (!row) return;

    const ua = navigator.userAgent;
    const p = navigator.platform || "";
    let os = null;
    if (/Mac|iPhone|iPad/.test(ua) || /Mac/.test(p)) os = "mac";
    else if (/Win/.test(ua) || /Win/.test(p)) os = "win";
    // Android reports Linux and is not a desktop target.
    else if ((/Linux|X11/.test(ua) || /Linux/.test(p)) && !/Android/.test(ua)) os = "linux";
    if (!os) return;

    // Each card is a container of per-format links now, not one big anchor.
    const card = row.querySelector(`[data-os="${os}"]`);
    if (!card) return;
    card.dataset.current = "true";
    // Move it first so the one you want is where the eye lands.
    row.prepend(card);
  })();

})();
