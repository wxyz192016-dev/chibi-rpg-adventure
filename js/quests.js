import {QUESTS} from "./database.js";
export function questStatus(p,q){const active=p.quests.includes(q.id);if(p.flags["done_"+q.id])return "done";if(!active)return "available";const progress=q.type==="kills"?p.kills:q.type==="herbs"?p.herbs:p.swordKills;return progress>=q.goal?"ready":"active";}
export function acceptQuest(p,id){if(!p.quests.includes(id)&&!p.flags["done_"+id])p.quests.push(id);}
export function claimQuest(p,q){if(questStatus(p,q)!=="ready")return false;p.flags["done_"+q.id]=true;p.quests=p.quests.filter(x=>x!==q.id);p.gold+=q.reward;p.xp+=q.xp;return true;}
