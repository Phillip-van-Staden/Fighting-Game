# 🥷 Samurai Showdown

A **2D fighting game** built with **vanilla JavaScript, HTML5 Canvas, and CSS**.  
Players can control a Samurai fighter against an AI-controlled enemy (Kenji).  
Includes a **start menu, retry menu, health bars, a timer**, and a simple but effective **enemy AI**.

---

## 🎮 Features

- **Player Controls(Keyboard)**

  - `A` → Move Left
  - `D` → Move Right
  - `W` → Jump
  - `Space` → Attack

- **Player Controls(Touch)**

  - `Drag left` → Move Left
  - `Drag right` → Move Right
  - `Drag drag up` → Jump
  - `Tap` → Attack

- **Game Systems**

  - Health bars for both fighters with smooth animations.
  - Countdown timer (default 45 seconds).
  - Start menu overlay and retry menu after match ends.
  - Win/lose detection when timer runs out or a fighter’s HP reaches 0.

- **AI Opponent (Kenji)**
  - Automatically makes decisions: chase, retreat, attack, jump, or patrol.
  - Reacts to being hit with retreat or counter-attack.
  - Uses cooldowns to prevent unfair attack spamming.
