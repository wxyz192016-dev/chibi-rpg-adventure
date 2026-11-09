export const REGIONS=[
{id:"qinghe",name:"青河鎮",level:1,desc:"江南水鄉旁的繁華小鎮，客棧、藥鋪與鏢局林立。",unlock:1,enemy:["地痞","流寇"],npc:["掌櫃","老鏢師"]},
{id:"bamboo",name:"幽竹林",level:3,desc:"竹海深處常有野獸出沒，傳聞林中藏有前人遺下的劍譜。",unlock:3,enemy:["山賊","毒蛇"],npc:["採藥人"]},
{id:"sword",name:"天劍山莊",level:5,desc:"依山而建的武學門庭，劍氣清寒，門規森嚴。",unlock:5,enemy:["試劍弟子","守山弟子"],npc:["守門弟子","執事"]},
{id:"blackwind",name:"黑風嶺",level:8,desc:"山勢險峻、匪寨盤踞，夜間常傳出兵刃交擊之聲。",unlock:8,enemy:["黑風匪","刀疤頭目"],npc:["負傷俠客"]},
{id:"secret",name:"絕世秘境",level:12,desc:"雲霧封山的古老遺跡，傳說藏有失傳絕學。",unlock:12,enemy:["守陵傀儡","秘境守衛"],npc:["隱世高人"]}
];
export const NPCS={
"掌櫃":{role:"青河客棧掌櫃",desc:"消息靈通，總能聽見各路旅人的江湖傳聞。",line:"客官，江湖路遠，先歇歇腳再上路。"},
"老鏢師":{role:"退隱鏢師",desc:"走過南北鏢路，熟悉江湖規矩。",line:"行走江湖，眼要明、心要定，手中劍才不會偏。"},
"採藥人":{role:"山林採藥人",desc:"常年往返竹林，熟悉草藥與山徑。",line:"林中有藥，也有毒。莫只看見眼前的花草。"},
"守門弟子":{role:"天劍山莊弟子",desc:"奉命看守山門，考察來訪者的根基。",line:"若想入莊求學，先讓我看看你的基本功。"},
"執事":{role:"天劍山莊執事",desc:"負責門中事務與弟子試煉。",line:"習武貴在持之以恆，不可貪多求快。"},
"負傷俠客":{role:"受傷的江湖人",desc:"似乎剛從黑風寨逃出，身上帶著重要情報。",line:"黑風寨主刀法狠辣……少俠務必小心。"},
"隱世高人":{role:"隱居秘境的前輩",desc:"氣息深不可測，似乎知曉失傳武學。",line:"有形之招易學，無形之意難求。"}
};
export const ENEMIES={
"地痞":{hp:38,atk:7,def:1,xp:18,gold:8,desc:"仗勢欺人的街頭混混。"},
"流寇":{hp:52,atk:9,def:2,xp:24,gold:12,desc:"四處劫掠的流竄匪徒。"},
"山賊":{hp:68,atk:12,def:3,xp:34,gold:18,desc:"盤踞竹林外圍的山賊。"},
"毒蛇":{hp:45,atk:13,def:1,xp:30,gold:5,desc:"藏在草叢中的毒蛇。"},
"試劍弟子":{hp:85,atk:15,def:5,xp:48,gold:20,desc:"奉命切磋的山莊弟子。"},
"守山弟子":{hp:105,atk:18,def:7,xp:58,gold:24,desc:"守護山門的精銳弟子。"},
"黑風匪":{hp:130,atk:22,def:8,xp:75,gold:35,desc:"黑風寨的精銳匪徒。"},
"刀疤頭目":{hp:190,atk:27,def:11,xp:115,gold:65,desc:"黑風嶺一帶令人聞風喪膽的頭目。"},
"守陵傀儡":{hp:230,atk:32,def:14,xp:150,gold:80,desc:"守護古墓入口的機關傀儡。"},
"秘境守衛":{hp:320,atk:38,def:18,xp:220,gold:120,desc:"秘境深處的強大守衛。"}
};
export const SKILLS=[
{id:"basic",name:"基礎劍法",type:"劍法",desc:"以穩健劍招攻擊敵人。",cost:0,power:1.25,unlock:1,learn:0},
{id:"cloud",name:"青雲劍訣",type:"劍法",desc:"劍勢連綿，對單一敵人造成較高傷害。",cost:8,power:1.9,unlock:3,learn:80},
{id:"tiger",name:"伏虎拳",type:"拳法",desc:"沉肩墜肘，剛猛一擊。",cost:6,power:1.65,unlock:2,learn:50},
{id:"breath",name:"吐納調息",type:"內功",desc:"凝神運氣，恢復部分生命與內力。",cost:5,power:0,unlock:1,learn:0},
{id:"step",name:"踏雪無痕",type:"輕功",desc:"身形飄忽，短暫提高閃避。",cost:7,power:0,unlock:4,learn:100}
];
export const ITEMS=[
{id:"herb",name:"止血草",type:"丹藥",desc:"恢復 45 點生命。",price:12,heal:45},
{id:"pill",name:"小還丹",type:"丹藥",desc:"恢復 90 點生命。",price:35,heal:90},
{id:"inner",name:"凝氣散",type:"丹藥",desc:"恢復 25 點內力。",price:28,mana:25},
{id:"sword",name:"精鋼長劍",type:"武器",desc:"攻擊力 +5。",price:90,atk:5},
{id:"vest",name:"粗布護甲",type:"防具",desc:"防禦力 +3。",price:75,def:3},
{id:"manual",name:"劍法殘頁",type:"秘籍",desc:"可用於領悟武學。",price:60}
];
export const QUESTS=[
{id:"first",title:"初試身手",desc:"擊敗 2 名地痞或流寇，證明自己有自保之力。",goal:2,reward:45,xp:50,type:"kills"},
{id:"herb",title:"林間採藥",desc:"探索幽竹林並取得 3 株止血草。",goal:3,reward:55,xp:65,type:"herbs"},
{id:"sword",title:"山莊試煉",desc:"達到 5 級，並擊敗 2 名試劍弟子。",goal:2,reward:100,xp:100,type:"swordkills"}
];