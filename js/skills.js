import {SKILLS} from "./database.js";
export function availableSkills(player){return SKILLS.filter(s=>player.level>=s.unlock);}
export function learnSkill(player,id){const s=SKILLS.find(x=>x.id===id);if(!s||player.level<s.unlock||player.learned.includes(id))return false;if(s.learn>0&&player.xp<s.learn)return false;player.learned.push(id);player.skillLevels[id]=1;if(s.learn>0)player.xp-=s.learn;return true;}
export function skillById(id){return SKILLS.find(s=>s.id===id);}
