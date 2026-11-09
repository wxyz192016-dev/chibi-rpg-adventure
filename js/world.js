import {REGIONS,NPCS,ENEMIES} from "./database.js";
export function regionById(id){return REGIONS.find(r=>r.id===id)||REGIONS[0];}
export function canTravel(player,region){return player.level>=region.unlock;}
export function randomEncounter(region){const names=region.enemy;const name=names[Math.floor(Math.random()*names.length)];return {name,...ENEMIES[name],maxHp:ENEMIES[name].hp};}
export function regionNpcs(region){return region.npc.map(name=>({name,...NPCS[name]}));}
export function exploreReward(player){const r=Math.random();if(r<.48)return {type:"herb",amount:1+Math.floor(Math.random()*2),text:"你在草叢間採得止血草。"};if(r<.68)return {type:"gold",amount:8+Math.floor(Math.random()*18),text:"你在石縫中找到散落的銀兩。"};if(r<.84)return {type:"encounter",text:"前方傳來兵刃聲，有人攔住去路！"};return {type:"xp",amount:12,text:"你觀察地勢與步法，對江湖路數略有領悟。"};}
