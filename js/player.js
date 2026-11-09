export function createPlayer(name="沈行舟"){return {name,level:1,xp:0,gold:100,hp:100,maxHp:100,mp:30,maxMp:30,atk:10,def:5,agi:5,root:5,wisdom:5,fame:0,region:"qinghe",kills:0,herbs:0,swordKills:0,inventory:["herb","herb","inner"],learned:["basic","breath"],skillLevels:{basic:1,breath:1},equipped:{weapon:null,armor:null},quests:[],flags:{},};}
export function xpNeeded(level){return 100+(level-1)*55;}
export function addXp(p,amount){p.xp+=amount;let levels=0;while(p.xp>=xpNeeded(p.level)){p.xp-=xpNeeded(p.level);p.level++;p.maxHp+=14;p.maxMp+=5;p.atk+=2;p.def+=1;p.agi+=1;p.hp=p.maxHp;p.mp=p.maxMp;levels++;}return levels;}
export function heal(p,hp=0,mp=0){p.hp=Math.min(p.maxHp,p.hp+hp);p.mp=Math.min(p.maxMp,p.mp+mp);}
