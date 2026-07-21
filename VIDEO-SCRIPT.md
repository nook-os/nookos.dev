# NookOS — four-minute launch video

**Format:** screen recording, first person, no face cam required.
**Target:** 4:00. Spoken word count ≈ 620.
**Tone:** show it working, then explain why it works that way. No slides until
the very end, and even then only one.

**Setup before you hit record**

- Two machines online in the fleet, `azul` and `crimson`. One of them must have
  Claude Code installed and the other must not — the difference is the point.
- Terminal at a readable size, ~110 columns, on the near-black theme.
- Browser tab with the NookOS dashboard already signed in, on a second desktop
  so you can cut to it without a login on camera.
- Demo workspaces named `acme/checkout-api`, `globex/billing-worker`,
  `widgets/web-dashboard`. Nothing real on screen. Check the tab title, the
  window title bar and the shell prompt for hostnames before you record.

---

## 0:00 — 0:35 · Cold open: the thing itself

*(Screen: a bare terminal. No intro, no logo, no "hey everyone".)*

> This is my laptop. Nothing is running on it.
>
> This machine is called `azul`. It's a Linux box in the other room, and it has
> the repo I want to work on checked out. I'm not going to ssh into it.

*(Type, slowly enough to read:)*

```bash
nook start acme/checkout-api --node azul --runtime claude --name demo
```

*(Output appears: `✓ demo — claude on azul`)*

> That started Claude Code over there. Let me talk to it.

```bash
nook exec demo 'what machine are you on, and what is this repo?'
```

*(Wait for the real answer. Do not cut. The pause is the proof.)*

> That's Claude, running on a different computer, answering me in my own
> terminal. No ssh. No tmux. I didn't type a hostname, a port or a key.

---

## 0:35 — 1:15 · The whole protocol

> Everything you just saw is three verbs. `send` types into the session. `read`
> looks at the screen. `exec` does both and waits.

```bash
nook send demo 'add retries to the gateway client, then run the tests'
nook read demo
```

> `exec` is the interesting one. It polls until the screen stops changing,
> because a coding agent's thinking time is unpredictable — a fixed `sleep`
> either cuts the answer off or wastes two minutes. It waits until the thing is
> actually done.

*(Cut to the browser, session view, same session, Claude mid-work.)*

> And here's that exact session in the browser. Same tmux session on `azul`,
> streamed into the page. The terminal and the CLI are two windows onto one
> thing.

---

## 1:15 — 1:45 · Persistence

> Watch this.

*(Close the laptop lid, or kill the terminal window outright. Beat. Reopen.)*

```bash
nook read demo --lines 200
```

> Still there. Sessions live on the node, not in my client. My laptop dying is
> not an event as far as the work is concerned. I can come back tomorrow, on a
> different machine, and pick the conversation up mid-sentence.

---

## 1:45 — 2:30 · The fleet

*(Cut to browser: Nodes page, capacity bars moving.)*

> Here's why there's a control plane at all instead of a shell script.
>
> Every machine reports what it is — CPU, memory, load, how many sessions it's
> carrying, and which runtimes it actually has installed. `azul` has Claude and
> Codex. `crimson` doesn't. So if I ask `crimson` for Claude, it fails
> immediately and tells me why, instead of failing mysteriously ten seconds in.

*(Workspaces page.)*

> And I think in repos, not machines. This workspace exists on two boxes. If I
> leave `--node` off entirely, the scheduler picks an online machine that has
> the repo. The machine becomes an implementation detail.

*(Board page, drag a card to In Progress.)*

> The board dispatches for real. Moving a card creates the worktree, picks the
> machine, and opens the session.

---

## 2:30 — 3:05 · Agents driving it

> Here's the part I actually built this for.

*(Terminal.)*

```bash
./skills/install.sh --host crimson
```

> That installs NookOS as a skill on another machine's agent. Now *that* agent
> can start sessions anywhere in the fleet and drive them — because the protocol
> is small enough to explain in one line.
>
> This isn't hypothetical. An agent on one machine drove Claude Code on another
> using exactly the commands I just showed you, and shipped the work. There's
> also an MCP server at `/mcp` if you'd rather your agent used tools than a CLI.

---

## 3:05 — 3:35 · The posture

*(Terminal, or the security section of the site.)*

> Three things people ask immediately.
>
> Machines connect **outbound**. No inbound SSH, no public ports, nothing
> reachable from the internet.
>
> A node token can only act on its own machine. Only a user token drives the
> fleet. That's deliberate — a node token sits in a file on a box that runs
> other people's code, and one compromised machine must not become every
> machine.
>
> And there's no telemetry. None. It's your Postgres, your disks, your repos.

---

## 3:35 — 4:00 · Close

*(Cut to nookos.dev, scroll slowly from the hero.)*

> NookOS is free and open source, Apache-2.0, self-hosted. Clone it, run
> `./run.sh`, and you'll have a fleet in about five minutes. Everything I showed
> you is in the box — there is no paid tier holding a feature hostage.
>
> There's a managed version coming for people who'd rather not run the control
> plane themselves. The link for that is on the site.
>
> nookos.dev. Go break it, and tell me what broke.

*(End card: `nookos.dev` · `github.com/nook-os/nook-os` · Apache-2.0. Hold 3s.
No outro music bed over the last line — let it land dry.)*

---

## Notes to self while editing

- Do not speed up the `nook exec` wait. The real latency is the credibility.
- Cut every "um", but keep the pause before the answer lands at 0:35.
- Burn in captions for the commands; people watch this muted.
- If a take shows a real hostname, tenant or token, the take is dead. Reshoot.
