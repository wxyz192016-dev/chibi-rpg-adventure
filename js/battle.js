export function damage(attacker,defender,multiplier=1){const base=Math.max(1,attacker.atk+Math.floor(Math.random()*5)-defender.def);return Math.max(1,Math.floor(base*multiplier));}
export function enemyDamage(enemy,player,defending=false){const raw=Math.max(1,enemy.atk+Math.floor(Math.random()*4)-player.def);return Math.max(1,defending?Math.floor(raw*.35):raw);}
export function enemyTurn(enemy,player,defending=false){const hit=enemyDamage(enemy,player,defending);player.hp=Math.max(0,player.hp-hit);return hit;}
