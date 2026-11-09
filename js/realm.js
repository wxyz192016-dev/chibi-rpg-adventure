// Expansion layer: open-world travel, recruit relations, oath bonds and party turn combat.
(function(){
"use strict";
const $=id=>document.getElementById(id);
const STORE="wuxia_108_constellations_v1";
const PLAYER_STORE="wuxia_jianghu_rpg_v1";
const regions=[
{id:"qinghe",name:"青河郡",level:1,desc:"水鄉市集與流民聚落交錯，反帝國盟約從此地起步。",sites:["青河鎮","蘆葦渡口","舊糧倉"],enemies:["帝國巡兵","地痞頭目"]},
{id:"bamboo",name:"竹海山脈",level:3,desc:"竹林、鏢道與山寨盤踞，藏著被密探追捕的鏢局遺孤。",sites:["幽竹林","鏢局舊址","藏鋒石窟"],enemies:["黑衣密探","山賊刀手"]},
{id:"sword",name:"天劍山",level:5,desc:"武林門派林立，帝國鎮武監正逼迫各派交出弟子名冊。",sites:["天劍山莊","問劍坪","古劍塚"],enemies:["鎮武監校尉","叛門劍客"]},
{id:"thunder",name:"霹靂谷",level:7,desc:"火器工坊與鑄造坊遍布峽谷，工匠被迫替帝國打造攻城器。",sites:["霹靂堂","火器工坊","雷火礦坑"],enemies:["火器營兵","機關守衛"]},
{id:"flower",name:"百花谷",level:9,desc:"醫館與藥田收容疫民，帝國卻封鎖藥道並嫁禍醫者。",sites:["百花谷","藥王廬","忘憂渡"],enemies:["監藥使","帝國藥衛"]},
{id:"blackwind",name:"黑風原",level:11,desc:"軍糧大道穿過荒原，豪強與軍閥勾結，百姓正受飢荒所苦。",sites:["黑風寨","三號糧倉","斷糧峽"],enemies:["節度軍","黑風悍匪"]},
{id:"north",name:"北境邊關",level:14,desc:"雪原孤城被皇帝下令棄守，邊軍與百姓等待援軍。",sites:["北境孤城","烽火台","雪狼關"],enemies:["帝國精騎","邊關監軍"]},
{id:"capital",name:"承天皇城",level:17,desc:"帝國密司、天牢與皇宮盤踞於此，天下命運將在此迎來決戰。",sites:["帝都外城","皇城天牢","承天宮"],enemies:["禁軍統領","鎮國大將","承天帝"]}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let gameSave=null,playerSave=null,battle=null,activeTab="realm";
function read(){try{gameSave=JSON.parse(localStorage.getItem(STORE)||"null")||{};}catch{gameSave={};}try{playerSave=JSON.parse(localStorage.getItem(PLAYER_STORE)||"null")||{};}catch{playerSave={};}
gameSave.recruited=Array.isArray(gameSave.recruited)?gameSave.recruited:[];
gameSave.relations=gameSave.relations||{};gameSave.party=Array.isArray(gameSave.party)?gameSave.party:[];
gameSave.worldRegion=gameSave.worldRegion||"qinghe";gameSave.visited=Array.isArray(gameSave.visited)?gameSave.visited:["qinghe"];
gameSave.worldFlags=gameSave.worldFlags||{};gameSave.oaths=Array.isArray(gameSave.oaths)?gameSave.oaths:[];
gameSave.factionRep=gameSave.factionRep||{people:0,sects:0,border:0};
}
function write(){localStorage.setItem(STORE,JSON.stringify(gameSave));}
function heroList(){return window.WuxiaConstellation?window.WuxiaConstellation.getHeroes():[];}
function heroById(id){return heroList().find(h=>h.id===Number(id));}
function rel(id){if(!gameSave.relations[id])gameSave.relations[id]={loyalty:70,affinity:0,bond:0,notes:[]};return gameSave.relations[id];}
function recruited(){return gameSave.recruited.map(heroById).filter(Boolean);}
function player(){return playerSave.player||{name:"星宿俠客",level:1,hp:100,maxHp:100,mp:30,maxMp:30,atk:10,def:5,agi:5,gold:100,xp:0};}
function level(){return Number(player().level||1);}
function inject(){
 const root=$("game"),nav=root&&root.querySelector(".main-nav");if(!root||!nav||$("view-realm"))return;
 [["realm","天下地圖"],["bonds","英雄羈絆"],["party","星宿隊伍"]].forEach(([id,label])=>{const b=document.createElement("button");b.className="nav-btn";b.dataset.view=id;b.textContent=label;nav.appendChild(b);b.addEventListener("click",()=>open(id));});
 const section=document.createElement("section");section.id="view-realm";section.className="view";section.hidden=true;
 section.innerHTML='<div class="section-heading"><div><p class="eyebrow">THE OPEN JIANGHU</p><h2>天下江湖地圖</h2></div><span class="location-pill" id="realmLocation">青河郡</span></div><div class="realm-hero panel"><div><p class="eyebrow">EXPLORE · ENCOUNTER · LIBERATE</p><h3>山河萬里，星火可成燎原。</h3><p>自由前往已達條件的地區，探索據點、遭遇敵軍、解救百姓並累積各方勢力支持。</p></div><div class="realm-stats" id="realmStats"></div></div><div class="realm-map" id="realmMap"></div><div class="realm-detail panel" id="realmDetail"></div><div class="realm-battle panel" id="realmBattle" hidden></div>';
 root.appendChild(section);
 const bonds=document.createElement("section");bonds.id="view-bonds";bonds.className="view";bonds.hidden=true;
 bonds.innerHTML='<div class="section-heading"><div><p class="eyebrow">TRUST · OATH · FATE</p><h2>英雄羈絆與忠誠</h2></div><span class="location-pill" id="bondCount">0 位盟友</span></div><div class="bond-summary panel" id="bondSummary"></div><div class="bond-list" id="bondList"></div>';
 root.appendChild(bonds);
 const party=document.createElement("section");party.id="view-party";party.className="view";party.hidden=true;
 party.innerHTML='<div class="section-heading"><div><p class="eyebrow">FIVE HERO FORMATION</p><h2>星宿隊伍與戰術</h2></div><span class="location-pill" id="partyCount">0 / 4 位隊友</span></div><div class="party-guide panel"><h3>五人出戰編制</h3><p>玩家為隊長，最多配置四位已招募英雄。出戰英雄會在每個回合自動依速度支援，羈絆越深，合擊傷害越高。</p><div class="party-slots" id="partySlots"></div></div><div class="party-picker panel"><h3>編入隊伍</h3><div id="partyPicker"></div></div><div class="party-tactics panel"><h3>隊伍戰術</h3><p>前鋒承傷、醫者支援、斥候先攻；隊伍角色依英雄專長提供戰鬥加成。</p><div id="partyBonuses"></div></div>';
 root.appendChild(party);
 renderAll();
}
function open(id){activeTab=id;document.querySelectorAll("#game .view").forEach(v=>v.hidden=v.id!=="view-"+id);document.querySelectorAll("#game .nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===id));if(id==="realm")renderRealm();if(id==="bonds")renderBonds();if(id==="party")renderParty();}
function currentRegion(){return regions.find(r=>r.id===gameSave.worldRegion)||regions[0];}
function renderRealm(){
 const r=currentRegion();$("realmLocation").textContent=r.name;
 $("realmStats").innerHTML='<span>已探索 <b>'+gameSave.visited.length+' / 8</b></span><span>已集結 <b>'+(gameSave.recruited.length+1)+' / 108</b></span><span>俠客等級 <b>'+level()+'</b></span>';
 $("realmMap").innerHTML=regions.map(x=>{const open=level()>=x.level||gameSave.visited.includes(x.id);return '<button class="realm-region '+(x.id===r.id?"selected":"")+'" data-realm="'+x.id+'" '+(!open?"disabled":"")+'><span class="realm-pin">'+(gameSave.visited.includes(x.id)?"✦":"◇")+'</span><b>'+esc(x.name)+'</b><small>建議等級 '+x.level+(open?" · 可前往":" · 尚未開放")+'</small></button>';}).join("");
 $("realmMap").querySelectorAll("[data-realm]").forEach(b=>b.addEventListener("click",()=>{gameSave.worldRegion=b.dataset.realm;if(!gameSave.visited.includes(b.dataset.realm))gameSave.visited.push(b.dataset.realm);write();renderRealm();}));
 $("realmDetail").innerHTML='<div class="realm-detail-head"><div><span class="tag">探索區域 · 建議等級 '+r.level+'</span><h3>'+esc(r.name)+'</h3><p>'+esc(r.desc)+'</p></div><button class="btn primary" id="realmExplore">探索此地</button></div><h4>可探索據點</h4><div class="site-list">'+r.sites.map((s,i)=>'<button class="site-btn" data-site="'+i+'">'+esc(s)+' <span>前往探索 →</span></button>').join("")+'</div><div class="realm-log" id="realmLog">'+(gameSave.worldFlags.lastLog||"山河遼闊，先選擇一處據點展開探索。")+'</div>';
 $("realmExplore").onclick=()=>explore(r.sites[Math.floor(Math.random()*r.sites.length)]);
 $("realmDetail").querySelectorAll("[data-site]").forEach(b=>b.addEventListener("click",()=>explore(r.sites[Number(b.dataset.site)])));
}
function explore(site){
 const r=currentRegion(),roll=Math.random();
 gameSave.worldFlags.lastLog="你來到「"+site+"」，四周傳來腳步與風聲。";
 if(roll<.48){const names=r.enemies;const enemyName=names[Math.floor(Math.random()*names.length)];const scale=Math.max(1,Math.floor(r.level/2));battle={name:enemyName,hp:70+scale*22,maxHp:70+scale*22,atk:8+scale*3,def:2+scale,xp:28+scale*14,gold:12+scale*7,turn:1,guard:false,log:"你在"+site+"遭遇"+enemyName+"！"};gameSave.worldFlags.lastLog=battle.log;write();renderRealm();$("realmBattle").hidden=false;renderBattle();}
 else if(roll<.72){const gain=18+Math.floor(Math.random()*28);playerSave.player.gold=(player().gold||0)+gain;gameSave.worldFlags.lastLog="你在"+site+"找到散落的銀兩，取得 "+gain+" 兩。";savePlayer();}
 else if(roll<.88){const gain=22+Math.floor(Math.random()*30);playerSave.player.xp=(player().xp||0)+gain;gameSave.worldFlags.lastLog="你在"+site+"救助百姓並獲得見聞，取得 "+gain+" 點經驗。";savePlayer();}
 else{const faction=["people","sects","border"][Math.floor(Math.random()*3)];gameSave.factionRep[faction]=(gameSave.factionRep[faction]||0)+5;gameSave.worldFlags.lastLog="你協助"+(faction==="people"?"百姓":faction==="sects"?"武林門派":"北境邊軍")+"脫困，勢力支持 +5。";}
 write();renderRealm();
}
function savePlayer(){localStorage.setItem(PLAYER_STORE,JSON.stringify(playerSave));}
function partyHeroes(){return gameSave.party.map(heroById).filter(Boolean);}
function renderParty(){
 const members=partyHeroes();$("partyCount").textContent=members.length+" / 4 位隊友";
 $("partySlots").innerHTML='<div class="party-slot captain"><b>隊長</b><strong>'+esc(player().name||"玩家")+'</strong><small>本命星宿 · '+(player().level||1)+' 級</small></div>'+[0,1,2,3].map(i=>{const h=members[i];return '<div class="party-slot">'+(h?'<b>第 '+(i+2)+' 位</b><strong>'+esc(h.name)+'</strong><small>'+esc(h.role)+' · 忠誠 '+rel(h.id).loyalty+'</small><button class="text-btn" data-remove="'+h.id+'">移出隊伍</button>':'<b>空位</b><strong>尚未配置</strong><small>可加入一位已招募英雄</small>')+'</div>';}).join("");
 $("partySlots").querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{gameSave.party=gameSave.party.filter(x=>x!==Number(b.dataset.remove));write();renderParty();});
 const available=recruited().filter(h=>!gameSave.party.includes(h.id));
 $("partyPicker").innerHTML=available.map(h=>'<div class="picker-row"><div><b>'+esc(h.star)+'・'+esc(h.name)+'</b><small>'+esc(h.role)+' · 戰力 '+h.power+' · 忠誠 '+rel(h.id).loyalty+'</small></div><button class="btn" data-add="'+h.id+'" '+(gameSave.party.length>=4||rel(h.id).loyalty<=15?"disabled":"")+'>'+(rel(h.id).loyalty<=15?"忠誠不足":gameSave.party.length>=4?"隊伍已滿":"加入隊伍")+'</button></div>').join("")||'<p class="muted">尚無可編入的已招募英雄。請先在「108星宿」招募英雄。</p>';
 $("partyPicker").querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{if(gameSave.party.length<4){gameSave.party.push(Number(b.dataset.add));write();renderParty();}});
 const roles=members.map(h=>h.role).join("、");
 $("partyBonuses").innerHTML='<p>目前隊伍：'+(roles||"尚未配置隊友")+'</p><p>合擊加成：'+(members.filter(h=>rel(h.id).bond>0).length*5)+'% · 隊伍人數：'+(members.length+1)+'/5</p>';
}
function renderBonds(){
 const hs=recruited();$("bondCount").textContent=hs.length+" 位盟友";
 const avg=hs.length?Math.round(hs.reduce((a,h)=>a+rel(h.id).loyalty,0)/hs.length):0;
 $("bondSummary").innerHTML='<div class="bond-metrics"><span>盟友數 <b>'+hs.length+'</b></span><span>平均忠誠 <b>'+avg+'</b></span><span>結義盟約 <b>'+gameSave.oaths.length+'</b></span><span>可用隊伍 <b>'+partyHeroes().length+'/4</b></span></div><p>忠誠度會受任務選擇、共同作戰與個人事件影響。忠誠過低的英雄可能拒絕出戰，但仍可透過對話、贈禮與共同歷練挽回。</p>';
 $("bondList").innerHTML=hs.map(h=>{const x=rel(h.id);const status=x.loyalty<=15?"暫時背離":x.loyalty<40?"心存疑慮":x.loyalty<70?"普通盟友":x.loyalty<90?"信任相隨":"生死與共";return '<article class="bond-card"><div class="bond-card-head"><div><span class="tag">'+esc(h.star)+'</span><h3>'+esc(h.name)+'</h3><small>'+esc(h.role)+' · '+status+'</small></div><b>'+x.loyalty+'/100</b></div><div class="loyalty-track"><i style="width:'+x.loyalty+'%"></i></div><div class="bond-values"><span>好感 '+x.affinity+'</span><span>羈絆 '+x.bond+'</span></div><p>'+esc(h.trait)+'</p><div class="bond-actions"><button class="btn" data-talk="'+h.id+'">促膝長談 +3</button><button class="btn" data-gift="'+h.id+'">贈禮 5兩 +6</button><button class="btn" data-train="'+h.id+'">共同修練 +4</button><button class="btn" data-disagree="'+h.id+'">理念衝突 -12</button><button class="btn primary" data-oath="'+h.id+'" '+(x.loyalty<80||x.bond>0?"disabled":"")+'>'+(x.bond>0?"已立羈絆":"結義")+'</button></div></article>';}).join("")||'<div class="panel"><p>招募第一位英雄後，便能在此培養信任、羈絆與結義關係。</p></div>';
 $("bondList").querySelectorAll("[data-talk]").forEach(b=>b.onclick=()=>changeRelation(Number(b.dataset.talk),"talk"));
 $("bondList").querySelectorAll("[data-gift]").forEach(b=>b.onclick=()=>changeRelation(Number(b.dataset.gift),"gift"));
 $("bondList").querySelectorAll("[data-train]").forEach(b=>b.onclick=()=>changeRelation(Number(b.dataset.train),"train"));
 $("bondList").querySelectorAll("[data-disagree]").forEach(b=>b.onclick=()=>changeRelation(Number(b.dataset.disagree),"disagree"));
 $("bondList").querySelectorAll("[data-oath]").forEach(b=>b.onclick=()=>oath(Number(b.dataset.oath)));
}
function changeRelation(id,action){
 const x=rel(id),h=heroById(id);if(action==="gift"){if((player().gold||0)<5){alert("銀兩不足，需要 5 兩。");return;}playerSave.player.gold-=5;savePlayer();x.loyalty=Math.min(100,x.loyalty+6);x.affinity+=8;}
 if(action==="talk"){x.loyalty=Math.min(100,x.loyalty+3);x.affinity+=4;}
 if(action==="train"){x.loyalty=Math.min(100,x.loyalty+4);x.bond=Math.min(100,x.bond+3);x.affinity+=3;}
 if(action==="disagree"){x.loyalty=Math.max(0,x.loyalty-12);x.affinity=Math.max(0,x.affinity-5);if(x.loyalty<=15){gameSave.worldFlags.betrayal=gameSave.worldFlags.betrayal||{};gameSave.worldFlags.betrayal[id]=true;gameSave.party=gameSave.party.filter(v=>v!==id);}}
 x.notes=(x.notes||[]).concat([action==="gift"?"收下隊長贈禮":action==="talk"?"深夜促膝長談":action==="train"?"共同修練武學":"理念衝突，信任受損"]).slice(-8);
 if(x.loyalty>15&&gameSave.worldFlags.betrayal&&gameSave.worldFlags.betrayal[id])delete gameSave.worldFlags.betrayal[id];
 write();renderBonds();
}
function oath(id){
 const h=heroById(id),x=rel(id);if(!h||x.loyalty<80||x.bond>0)return;
 x.bond=100;x.loyalty=100;gameSave.oaths.push(id);if(!gameSave.party.includes(id)&&gameSave.party.length<4)gameSave.party.push(id);
 write();renderBonds();alert("你與"+h.name+"歃血為盟！羈絆合擊已啟用。");
}
function renderBattle(){
 const b=battle;if(!b)return;const hs=partyHeroes().filter(h=>rel(h.id).loyalty>15);
 $("realmBattle").innerHTML='<div class="battle-head"><div><p class="eyebrow">TURN '+b.turn+' · FIELD ENCOUNTER</p><h3>'+esc(b.name)+'</h3><span class="muted">敵方生命 '+b.hp+' / '+b.maxHp+'</span></div><span class="danger-tag">遭遇戰</span></div><div class="enemy-health"><i style="width:'+Math.max(0,b.hp/b.maxHp*100)+'%"></i></div><div class="combat-party"><div class="combat-unit"><b>'+esc(player().name||"玩家")+'</b><small>HP '+player().hp+'/'+player().maxHp+'</small></div>'+hs.map(h=>'<div class="combat-unit"><b>'+esc(h.name)+'</b><small>援護攻擊 '+Math.max(1,Math.floor(h.power/7))+'</small></div>').join("")+'</div><div class="realm-log">'+esc(b.log)+'</div><div class="battle-actions"><button class="btn primary" data-action="attack">隊長攻擊</button><button class="btn" data-action="skill">星宿合擊</button><button class="btn" data-action="guard">全隊防禦</button><button class="btn danger" data-action="flee">撤退</button></div>';
 $("realmBattle").querySelectorAll("[data-action]").forEach(btn=>btn.onclick=()=>battleAction(btn.dataset.action));
}
function battleAction(action){
 if(!battle)return;const p=player(),hs=partyHeroes().filter(h=>rel(h.id).loyalty>15);let hit=0;
 if(action==="flee"){battle=null;$("realmBattle").hidden=true;gameSave.worldFlags.lastLog="你帶領隊伍撤離戰場。";write();renderRealm();return;}
 if(action==="attack")hit=Math.max(1,p.atk+Math.floor(Math.random()*5)-battle.def);
 if(action==="skill"){if((p.mp||0)<8){alert("內力不足，需要 8 點。");return;}p.mp-=8;hit=Math.max(1,Math.floor((p.atk+5)*1.8)-battle.def)+hs.reduce((a,h)=>a+Math.max(1,Math.floor(h.power/7)),0);hit+=gameSave.oaths.filter(id=>gameSave.party.includes(id)).length*6;}
 if(action==="guard")battle.guard=true;
 if(action!=="guard")battle.hp=Math.max(0,battle.hp-hit);
 let report=action==="guard"?"全隊結成守勢，降低敵人本回合傷害。":"隊伍合計造成 "+hit+" 點傷害。";
 if(battle.hp<=0){p.xp=(p.xp||0)+battle.xp;p.gold=(p.gold||0)+battle.gold;p.fame=(p.fame||0)+2;hs.forEach(h=>{rel(h.id).loyalty=Math.min(100,rel(h.id).loyalty+1);});savePlayer();battle.log=report+" 擊敗"+battle.name+"，獲得 "+battle.xp+" 經驗與 "+battle.gold+" 兩。";const msg=battle.log;battle=null;$("realmBattle").hidden=true;gameSave.worldFlags.lastLog=msg;write();renderRealm();return;}
 const enemyHit=Math.max(1,battle.atk+Math.floor(Math.random()*4)-p.def-(battle.guard?Math.floor(battle.atk*.55):0));p.hp=Math.max(1,p.hp-enemyHit);battle.guard=false;
 hs.forEach(h=>{const x=rel(h.id);x.loyalty=Math.min(100,x.loyalty+1);});
 battle.turn++;battle.log=report+" "+battle.name+"反擊，隊長受到 "+enemyHit+" 點傷害。";savePlayer();write();renderBattle();
}
function renderAll(){if($("view-realm")){renderRealm();renderBonds();renderParty();}}

const realmStyle=document.createElement("style");realmStyle.textContent=".realm-hero,.realm-detail,.party-guide,.party-picker,.party-tactics,.bond-summary{padding:18px;margin:12px 0}.realm-hero{display:flex;justify-content:space-between;gap:20px;align-items:center;background:linear-gradient(120deg,#2b2a20,#18231d);border:1px solid #75613d;border-radius:12px}.realm-hero h3{margin:5px 0;color:#ead8b5}.realm-hero p,.bond-summary p,.party-guide p,.party-tactics p{font-size:12px;color:#b9b5a7;line-height:1.8}.realm-stats,.bond-metrics{display:flex;gap:14px;flex-wrap:wrap}.realm-stats span,.bond-metrics span{font-size:11px;color:#b9b5a7}.realm-stats b,.bond-metrics b{display:block;color:#e2c58d;font-size:18px}.realm-map{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.realm-region{min-height:92px;text-align:left;padding:12px;background:linear-gradient(145deg,#202a24,#151c18);border:1px solid #455346;border-radius:10px;color:#eee0c1}.realm-region:disabled{opacity:.35}.realm-region.selected{border-color:#d1ad6c;box-shadow:inset 0 0 0 1px #d1ad6c}.realm-region b,.realm-region small{display:block}.realm-region small{font-size:10px;color:#aeb4a8;margin-top:7px}.realm-pin{display:block;color:#d8b777;font-size:17px;margin-bottom:4px}.realm-detail-head{display:flex;justify-content:space-between;align-items:center;gap:15px}.realm-detail h3{margin:8px 0}.realm-detail p{font-size:12px;color:#b9b5a7;line-height:1.8}.site-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.site-btn{display:flex;justify-content:space-between;gap:8px;padding:11px;background:#121a16;border:1px solid #3c493d;border-radius:7px;color:#e8ddc4;text-align:left}.site-btn span{color:#d5b778;font-size:10px}.realm-log{margin-top:12px;padding:12px;background:#101713;border-radius:8px;color:#d5c6a6;font-size:12px;line-height:1.7}.realm-battle{margin-top:14px;padding:18px;border:1px solid #8c554b;background:linear-gradient(145deg,#392724,#1b211e)}.enemy-health,.loyalty-track{height:7px;background:#101713;border-radius:8px;overflow:hidden;margin:10px 0}.enemy-health i,.loyalty-track i{display:block;height:100%;background:#c47765}.combat-party{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:14px 0}.combat-unit,.party-slot{padding:12px;background:#111915;border:1px solid #39463b;border-radius:8px}.combat-unit b,.combat-unit small,.party-slot b,.party-slot strong,.party-slot small{display:block}.combat-unit small,.party-slot small{font-size:10px;color:#aeb4a8;margin-top:5px}.bond-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.bond-card{padding:15px;background:linear-gradient(145deg,#202a24,#151c18);border:1px solid #3c493d;border-radius:10px}.bond-card-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.bond-card h3{margin:7px 0 3px}.bond-card-head small,.bond-card p{font-size:11px;color:#aeb4a8}.bond-card-head>b{color:#dfc184}.loyalty-track i{background:#c6a86c}.bond-values{display:flex;gap:15px;font-size:10px;color:#d7c39d}.bond-actions{display:flex;flex-wrap:wrap;gap:6px}.bond-actions .btn{font-size:10px;padding:7px 9px}.party-slots{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.party-slot.captain{border-color:#a78a53}.party-slot strong{margin-top:7px;color:#e7d6b2}.picker-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #ffffff12}.picker-row small{display:block;font-size:10px;color:#aeb4a8;margin-top:4px}.picker-row .btn{white-space:nowrap}.party-tactics{margin-top:12px}@media(max-width:760px){.realm-map{grid-template-columns:repeat(2,1fr)}.bond-list{grid-template-columns:1fr}.party-slots{grid-template-columns:repeat(2,1fr)}.combat-party{grid-template-columns:repeat(2,1fr)}.realm-hero,.realm-detail-head{align-items:flex-start;flex-direction:column}.site-list{grid-template-columns:1fr}}";document.head.appendChild(realmStyle);

function boot(){
 read();const game=$("game");if(!game)return;
 const obs=new MutationObserver(()=>{if(!game.hidden&&!$("view-realm")){read();inject();}});
 obs.observe(game,{attributes:true,attributeFilter:["hidden"]});
 if(!game.hidden)inject();
 const start=$("startGame");if(start)start.addEventListener("click",()=>setTimeout(()=>{read();inject();},120));
 const rosterObserver=new MutationObserver(()=>{if(activeTab==="bonds"&&$("view-bonds")&&!$("view-bonds").hidden)renderBonds();});
 const roster=$("view-constellation");if(roster)rosterObserver.observe(roster,{childList:true,subtree:true});
}
boot();
})();