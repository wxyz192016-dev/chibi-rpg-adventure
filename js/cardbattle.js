const KEY = "wuxia_card_battle_v1";
const HEROES = [
  {id:"changfeng",name:"蕭長風",role:"槍盾前鋒",desc:"沉著穩健，擅長守住陣線。",hp:190,atk:24,def:15,speed:8,ult:"破陣龍槍",kind:"strike",power:2.5},
  {id:"zhaoye",name:"沈照夜",role:"迅影刺客",desc:"身法迅捷，專攻敵方要害。",hp:125,atk:34,def:7,speed:18,ult:"夜影七殺",kind:"strike",power:3.1},
  {id:"qinghan",name:"顧清寒",role:"醫者軍師",desc:"以醫術穩住隊伍，兼具術法攻勢。",hp:145,atk:18,def:10,speed:13,ult:"回春清心",kind:"heal",power:1.1},
  {id:"qianshan",name:"陸千山",role:"重甲刀衛",desc:"厚重刀勢，能承受大量傷害。",hp:220,atk:25,def:18,speed:6,ult:"千山斷岳",kind:"strike",power:2.7},
  {id:"yungui",name:"楚雲歸",role:"弓弩射手",desc:"遠程壓制，擅長連續打擊。",hp:135,atk:29,def:8,speed:15,ult:"穿雲連弩",kind:"aoe",power:1.8},
  {id:"muxue",name:"慕容雪",role:"劍術游俠",desc:"攻守均衡，能快速切入戰場。",hp:155,atk:27,def:11,speed:14,ult:"飛雪連城",kind:"aoe",power:1.9},
  {id:"wujiu",name:"秦無咎",role:"破陣拳師",desc:"近身爆發，善於擊潰強敵。",hp:175,atk:31,def:12,speed:10,ult:"伏虎崩拳",kind:"strike",power:2.8},
  {id:"ruyan",name:"柳如煙",role:"控場琴師",desc:"琴音擾亂敵陣，削弱群體攻勢。",hp:140,atk:22,def:9,speed:16,ult:"亂弦驚鴻",kind:"aoe",power:1.65}
];
const ENEMIES = [
  {name:"帝國刀卒",role:"刀兵",hp:145,atk:19,def:8,speed:9},
  {name:"帝國弩手",role:"弩手",hp:112,atk:24,def:5,speed:13},
  {name:"巡城校尉",role:"校尉",hp:185,atk:23,def:12,speed:10},
  {name:"黑風匪徒",role:"匪兵",hp:135,atk:21,def:7,speed:12},
  {name:"軍中術士",role:"術士",hp:120,atk:25,def:6,speed:14}
];
const $ = id => document.getElementById(id);
const clone = x => JSON.parse(JSON.stringify(x));
let state, fight = null, timer = null, hostPlayer = () => null, toast = msg => alert(msg);
function freshState(){
  const heroes={}; HEROES.forEach(h=>heroes[h.id]={level:1,xp:0});
  return {version:1,gold:200,owned:["changfeng","zhaoye","qinghan","qianshan","yungui"],team:["changfeng","zhaoye","qinghan","qianshan","yungui"],heroes,wins:0};
}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&s.version===1&&Array.isArray(s.team)&&s.heroes)return s;}catch{}return freshState();}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function xpNeed(level){return 60+level*35;}
function heroLevel(id){return state.heroes[id]?.level||1;}
function heroStats(h){
  const lv=heroLevel(h.id),scale=1+(lv-1)*.12;
  return {maxHp:Math.round(h.hp*scale),atk:Math.round(h.atk*scale),def:Math.round(h.def+(lv-1)*2),speed:h.speed+Math.floor((lv-1)/3)};
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function heroCard(h){
  const owned=state.owned.includes(h.id),lv=heroLevel(h.id),xp=state.heroes[h.id]?.xp||0;
  return '<article class="roster-card"><div class="roster-avatar">'+esc(h.name.slice(0,1))+'</div><div class="roster-main"><b>'+esc(h.name)+'</b><span>'+esc(h.role)+' · Lv.'+lv+'</span><p>'+esc(h.desc)+'</p>'+(owned?'<small>修練經驗 '+xp+' / '+xpNeed(lv)+'</small><div class="roster-actions"><button class="btn" data-train="'+h.id+'">修練（30兩）</button></div>':'<small>尚未加入隊伍</small><div class="roster-actions"><button class="btn primary" data-recruit="'+h.id+'">招募（80兩）</button></div>')+'</div></article>';
}
function render(){
  const root=$("cardBattleRoot"); if(!root)return;
  const player=hostPlayer();
  const slots=state.team.map((id,i)=>{
    const options=state.owned.map(hid=>{const h=HEROES.find(x=>x.id===hid);return '<option value="'+hid+'" '+(hid===id?'selected':'')+'>'+esc(h.name)+'</option>';}).join("");
    return '<label class="formation-slot"><span>'+(i<2?'前排':'後排')+' · 第'+(i+1)+'位</span><select data-slot="'+i+'">'+options+'</select></label>';
  }).join("");
  root.innerHTML='<div class="section-heading"><div><p class="eyebrow">FIVE HEROES · AUTO TURN BATTLE</p><h2>英雄隊伍與卡牌戰鬥</h2></div><span class="location-pill">固定五人編制</span></div>'+
    '<div class="card-summary panel"><div><small>起義軍主將</small><b>'+esc(player?.name||"未命名主角")+'</b></div><div><small>軍資</small><b>'+state.gold+' 兩</b></div><div><small>勝場</small><b>'+state.wins+'</b></div></div>'+
    '<div class="card-section panel"><div class="section-heading compact"><div><p class="eyebrow">FORMATION</p><h3>五人陣形</h3></div><span class="tiny muted">前排 2 人 · 後排 3 人</span></div><div class="formation-grid">'+slots+'</div><p class="tiny muted">每個位置必須配置不同英雄；隊伍固定五人，不提供縮減人數的編制。</p></div>'+
    '<div class="card-section panel"><div class="section-heading compact"><div><p class="eyebrow">HERO ROSTER</p><h3>英雄名冊與招募</h3></div><span class="tiny muted">已招募 '+state.owned.length+' / '+HEROES.length+'</span></div><div class="roster-grid">'+HEROES.map(heroCard).join("")+'</div></div>'+
    (fight?renderFight():'<div class="card-section panel battle-launch"><div><p class="eyebrow">AUTO ROUND BATTLE</p><h3>野外遭遇戰</h3><p class="muted">五名隊員依速度自動輪流攻擊；絕技能量滿後，由你決定施放時機。</p></div><button id="startCardFight" class="btn primary">出征迎敵</button></div>');
  root.querySelectorAll("[data-slot]").forEach(el=>el.onchange=()=>{const i=Number(el.dataset.slot),id=el.value;if(state.team.some((x,j)=>x===id&&j!==i)){toast("同一名英雄不能重複上陣。");render();return;}state.team[i]=id;save();render();});
  root.querySelectorAll("[data-recruit]").forEach(b=>b.onclick=()=>{const id=b.dataset.recruit;if(state.gold<80)return toast("軍資不足，招募需要 80 兩。");state.gold-=80;state.owned.push(id);state.heroes[id]={level:1,xp:0};save();render();toast("招募成功："+HEROES.find(h=>h.id===id).name);});
  root.querySelectorAll("[data-train]").forEach(b=>b.onclick=()=>train(b.dataset.train));
  const start=$("startCardFight");if(start)start.onclick=startFight;
  root.querySelectorAll("[data-ultimate]").forEach(b=>b.onclick=()=>ultimate(b.dataset.ultimate));
}
function train(id){
  if(state.gold<30)return toast("軍資不足，修練需要 30 兩。");
  const data=state.heroes[id];state.gold-=30;data.xp+=30;
  let levels=0;while(data.xp>=xpNeed(data.level)){data.xp-=xpNeed(data.level);data.level++;levels++;}
  save();render();toast(levels?"修練完成，"+HEROES.find(h=>h.id===id).name+" 提升至 Lv."+data.level+"。":"修練完成，獲得 30 點修練經驗。");
}
function startFight(){
  if(fight)return;
  if(state.team.length!==5||state.team.some(id=>!state.owned.includes(id))||new Set(state.team).size!==5)return toast("請先配置五名不同的上陣英雄。");
  const scale=1+state.wins*.07;
  const allies=state.team.map(id=>{const h=HEROES.find(x=>x.id===id),s=heroStats(h);return {...h,...s,hp:s.maxHp,energy:0,side:"ally"};});
  const enemies=ENEMIES.map(e=>({...e,maxHp:Math.round(e.hp*scale),hp:Math.round(e.hp*scale),atk:Math.round(e.atk*scale),def:Math.round(e.def*scale),energy:0,side:"enemy"}));
  fight={allies,enemies,round:0,queue:[],log:["雙方列陣，戰鬥自動開始！"],ended:false};
  render();runTimer();
}
function runTimer(){clearInterval(timer);timer=setInterval(tick,950);}
function alive(list){return list.filter(x=>x.hp>0);}
function chooseTarget(list){const live=alive(list);return live[0]||null;}
function addLog(text){fight.log.unshift(text);fight.log=fight.log.slice(0,8);}
function tick(){
  if(!fight||fight.ended)return;
  if(!alive(fight.enemies).length)return finish(true);
  if(!alive(fight.allies).length)return finish(false);
  if(!fight.queue.length){
    fight.round++;
    fight.queue=[...alive(fight.allies),...alive(fight.enemies)].sort((a,b)=>b.speed-a.speed);
    addLog("第 "+fight.round+" 回合開始。");
  }
  const actor=fight.queue.shift();if(!actor||actor.hp<=0){render();return;}
  const target=chooseTarget(actor.side==="ally"?fight.enemies:fight.allies);
  if(!target){finish(actor.side==="ally");return;}
  const hit=Math.max(1,Math.round(actor.atk*(.9+Math.random()*.25)-target.def*.55));
  target.hp=Math.max(0,target.hp-hit);
  actor.energy=Math.min(100,actor.energy+35);
  addLog(actor.name+" 攻擊 "+target.name+"，造成 "+hit+" 點傷害。");
  if(!alive(fight.enemies).length)return finish(true);
  if(!alive(fight.allies).length)return finish(false);
  render();
}
function ultimate(id){
  if(!fight||fight.ended)return;
  const actor=fight.allies.find(x=>x.id===id&&x.hp>0);
  if(!actor||actor.energy<100)return toast("該英雄的絕技能量尚未集滿。");
  actor.energy=0;
  if(actor.kind==="heal"){
    const target=[...alive(fight.allies)].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];
    if(target){const amount=Math.round(target.maxHp*.34);target.hp=Math.min(target.maxHp,target.hp+amount);addLog(actor.name+" 施放「"+actor.ult+"」，為 "+target.name+" 恢復 "+amount+" 點生命。");}
  }else if(actor.kind==="aoe"){
    const targets=alive(fight.enemies);targets.forEach(t=>{const hit=Math.max(1,Math.round(actor.atk*actor.power-t.def*.35));t.hp=Math.max(0,t.hp-hit);});addLog(actor.name+" 施放「"+actor.ult+"」，對敵方全體造成傷害。");
  }else{
    const target=chooseTarget(fight.enemies);if(target){const hit=Math.max(1,Math.round(actor.atk*actor.power-target.def*.35));target.hp=Math.max(0,target.hp-hit);addLog(actor.name+" 施放「"+actor.ult+"」，對 "+target.name+" 造成 "+hit+" 點絕技傷害。");}
  }
  if(!alive(fight.enemies).length)return finish(true);
  render();
}
function renderFight(){
  const allyRows=fight.allies.map(h=>'<div class="combat-card '+(h.hp<=0?'fallen':'')+'"><b>'+esc(h.name)+'</b><small>'+esc(h.role)+' · HP '+h.hp+'/'+h.maxHp+'</small><div class="roster-hp"><i style="width:'+Math.max(0,h.hp/h.maxHp*100)+'%"></i></div><div class="energy-line">絕技能量 '+h.energy+'/100</div><button class="btn ultimate-btn" data-ultimate="'+h.id+'" '+(h.hp<=0||h.energy<100?'disabled':'')+'>施放「'+esc(h.ult)+'」</button></div>').join("");
  const enemyRows=fight.enemies.map(e=>'<div class="combat-card enemy-combat '+(e.hp<=0?'fallen':'')+'"><b>'+esc(e.name)+'</b><small>'+esc(e.role)+' · HP '+e.hp+'/'+e.maxHp+'</small><div class="roster-hp"><i style="width:'+Math.max(0,e.hp/e.maxHp*100)+'%"></i></div></div>').join("");
  return '<div class="card-section panel live-battle"><div class="section-heading compact"><div><p class="eyebrow">ROUND '+fight.round+'</p><h3>'+(fight.ended?(alive(fight.enemies).length?"戰鬥勝利":"戰鬥失利"):"自動戰鬥進行中")+'</h3></div><button id="retreatCardFight" class="btn '+(fight.ended?"":"danger")+'">'+(fight.ended?"返回隊伍":"撤出戰場")+'</button></div><p class="tiny muted">普通攻擊與敵方行動均自動執行；能量達 100 時，可手動施放絕技。</p><div class="combat-grid"><div><h4>我方五人</h4><div class="combat-roster">'+allyRows+'</div></div><div><h4>敵方部隊</h4><div class="combat-roster">'+enemyRows+'</div></div></div><div class="battle-feed card-feed">'+fight.log.map(x=>'<p>'+esc(x)+'</p>').join("")+'</div></div>';
}
function finish(won){
  if(!fight||fight.ended)return;
  fight.ended=true;clearInterval(timer);timer=null;
  if(won){
    state.wins++;state.gold+=55;
    fight.allies.forEach(h=>{const d=state.heroes[h.id];d.xp+=45;while(d.xp>=xpNeed(d.level)){d.xp-=xpNeed(d.level);d.level++;}});
    addLog("勝利！全隊各獲得 45 點修練經驗，軍資增加 55 兩。");
  }else addLog("戰敗！全隊仍獲得 10 點歷練經驗。");
  if(!won)fight.allies.forEach(h=>{const d=state.heroes[h.id];d.xp+=10;});
  save();render();
  const root=$("cardBattleRoot");if(root){const panel=root.querySelector(".live-battle");if(panel){const h=panel.querySelector("h3");if(h)h.textContent=won?"戰鬥勝利":"戰鬥失利";const p=panel.querySelector(".tiny");if(p)p.textContent=won?"成功擊退敵軍，獲得修練經驗與軍資。":"隊伍暫時撤退，整理陣形後可再次出征。";const btn=$("retreatCardFight");if(btn){btn.textContent="返回隊伍";btn.classList.remove("danger");}}}
  toast(won?"戰鬥勝利！":"戰鬥失利，繼續修練再來挑戰。");
}
export function initCardBattle(getPlayer,showToast){
  hostPlayer=getPlayer||hostPlayer;toast=showToast||toast;state=load();
  const nav=document.querySelector('[data-view="cards"]');
  if(nav)nav.addEventListener("click",()=>render());
  const root=$("cardBattleRoot");if(root)root.addEventListener("click",e=>{if(e.target.id==="retreatCardFight"&&fight){if(!fight.ended){clearInterval(timer);timer=null;toast("已撤出戰場。");}fight=null;render();}});
  render();
}
