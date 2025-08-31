const tierPoints = {
  HT1: 75, LT1: 60,
  HT2: 50, LT2: 40,
  HT3: 30, LT3: 20,
  HT4: 15, LT4: 10,
  HT5: 5,  LT5: 3
};

let players = [];
let currentGamemode = "overall";

async function loadPlayers() {
  const res = await fetch("https://207a685c-33f7-4709-a247-101f6a05420a-00-nsnc0sy5rpo5.picard.replit.dev/players.json");
  players = await res.json();
  renderPlayers();
}

function calculatePoints(player) {
  let total = 0;
  for (const mode in player.tiers) {
    total += tierPoints[player.tiers[mode]] || 0;
  }
  return total;
}

// Discord button → open invite
document.getElementById("discordBtn").addEventListener("click", () => {
  window.open("https://discord.gg/Mm4qkZvt9r", "_blank");
});

function getBadge(points) {
  if (points >= 200) return {label:"Legendary", class:"legendary"};
  if (points >= 150) return {label:"Master", class:"master"};
  if (points >= 100) return {label:"Expert", class:"expert"};
  if (points >= 50)  return {label:"Advanced", class:"advanced"};
  if (points >= 20)  return {label:"Intermediate", class:"intermediate"};
  return {label:"Novice", class:"novice"};
}

function renderPlayers() {
  const searchValue = document.getElementById("searchBox").value.toLowerCase();
  let filtered = players.filter(p => p.name.toLowerCase().includes(searchValue));

  if (currentGamemode === "overall") {
    filtered.forEach(p => p.points = calculatePoints(p));
    filtered.sort((a,b) => b.points - a.points);
  } else {
    filtered.forEach(p => p.points = tierPoints[p.tiers[currentGamemode]] || 0);
    filtered.sort((a,b) => b.points - a.points);
  }

  const container = document.getElementById("playerList");
  container.innerHTML = "";

  if (!filtered.length) {
    container.innerHTML = `<div class="no-results">No players found</div>`;
    return;
  }

  filtered.forEach((p, idx) => {
    const badge = getBadge(calculatePoints(p));
    let gamemodeDisplay = currentGamemode === "overall"
      ? Object.entries(p.tiers).map(([gm, tier]) =>
          `<div class="gamemode-tier-item">
            <span class="gamemode-tier-text">${gm.toUpperCase()}</span>
            <span class="tier ${tier.toLowerCase()}">${tier}</span>
          </div>`
        ).join("")
      : `<span class="tier ${p.tiers[currentGamemode].toLowerCase()}">${p.tiers[currentGamemode]}</span>`;

    const row = document.createElement("div");
    row.className = `player-row ${currentGamemode!=="overall"?"gamemode-view":""}`;
    row.innerHTML = `
      <div class="rank ${idx===0?"gold":idx===1?"silver":idx===2?"bronze":""}">${idx+1}</div>
      <div class="player-info">
        <img class="player-avatar" src="${p.avatar}" alt="${p.name}">
        <div class="player-details">
          <span class="player-name">${p.name} <span class="player-region">${p.region}</span></span>
          <span class="player-points">${p.points} pts <span class="points-badge ${badge.class}">${badge.label}</span></span>
        </div>
      </div>
      <div class="gamemode-tiers">${gamemodeDisplay}</div>
    `;
    row.addEventListener("click", () => openPlayerModal(p));
    container.appendChild(row);
  });
}

function openPlayerModal(player) {
  const modal = document.getElementById("playerModal");
  const body = document.getElementById("modalBody");
  body.innerHTML = `
    <h2>${player.name}</h2>
    <img src="${player.avatar}" style="width:80px; border-radius:12px; margin:10px auto; display:block;">
    <table style="width:100%">
      <tr><th>Gamemode</th><th>Tier</th><th>Points</th></tr>
      ${Object.entries(player.tiers).map(([gm,tier]) =>
        `<tr><td>${gm.toUpperCase()}</td><td><span class="tier ${tier.toLowerCase()}">${tier}</span></td><td>${tierPoints[tier]}</td></tr>`
      ).join("")}
    </table>
  `;
  modal.style.display = "flex";
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("playerModal").style.display = "none";
});

document.getElementById("tierInfoBtn").addEventListener("click", () => {
  document.getElementById("tierInfoModal").style.display = "flex";
});
document.getElementById("closeTierInfo").addEventListener("click", () => {
  document.getElementById("tierInfoModal").style.display = "none";
});

document.getElementById("searchBox").addEventListener("input", renderPlayers);

document.querySelectorAll(".gamemode-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".gamemode-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentGamemode = tab.dataset.gamemode;
    renderPlayers();
  });
});

document.getElementById("copyIpBtn").addEventListener("click", () => {
  navigator.clipboard.writeText("fadedmc.net");
  const popup = document.getElementById("copyPopup");
  popup.style.display = "block";
  setTimeout(()=> popup.style.display="none", 2000);
});

loadPlayers();
