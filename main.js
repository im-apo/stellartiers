const tierPoints = {
  HT1: 60, LT1: 45,
  RHT1: 60, RLT1: 45,
  HT2: 30, LT2: 20,
  RHT2: 30, RLT2: 20,
  HT3: 10, LT3: 6,
  HT4: 4, LT4: 3,
  HT5: 2,  LT5: 1
};

let players = [];
let currentGamemode = "overall";

async function loadPlayers() {
  const res = await fetch("http://watermelon.fps.ms:11527/players.json");
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

document.getElementById("copyIpBtn").addEventListener("click", () => {
  navigator.clipboard.writeText("fadedmc.net");
  const popup = document.getElementById("copyPopup");
  popup.style.display = "block";
  setTimeout(()=> popup.style.display="none", 2000);
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

loadPlayers();

const pages = ["gamemodePageMain", "gamemodePageSub", "gamemodePageExtra"];
let currentPageIndex = 0;

function showPage(index) {
  pages.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) {
      if (i === index) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    }
  });
  currentPageIndex = index;
}

document.getElementById("prevPageBtn").addEventListener("click", () => {
  currentPageIndex = (currentPageIndex - 1 + pages.length) % pages.length;
  showPage(currentPageIndex);
});

document.getElementById("nextPageBtn").addEventListener("click", () => {
  currentPageIndex = (currentPageIndex + 1) % pages.length;
  showPage(currentPageIndex);
});

showPage(0);
