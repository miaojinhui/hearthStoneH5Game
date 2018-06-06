/**
 * 用来模拟电脑进行的一系列操作
 */
/**
 * 查看电脑可以做的事情
 */
var NOTHINGTODO = -10086;
function computerCanDoing(){
	var obj = new Object();
	//能获得法力水晶
	if(cangetCrystal==1){
		obj.state = 1;
		obj.thing = "getCrystal";
		return obj;
	}
	//能抽卡
	
	if(cangetCard==1){
		obj.state = 1;
		obj.thing = "getCard";
		return obj;
	}
	//能释放法术
	for(var i=0;i<computercard.length;i++){
		if(useMagicNoProblem(i)==false){//判断逻辑上是否能用此卡
			continue;
		}
		if(computercard[i].choosed !=1&&computercard[i].posi==1&&computercard[i].cost<=computerNowCrystal&&computercard[i].attack=="法术"){
			obj.state= 1;
			obj.cardidx = i;
			
			obj.thing = "domagic";
			computercard[i].choosed = 1;		//保证就算不用也不会重复选，进入死循环
			return obj;
			
		}
		
	}
	//电脑能攻击
	for(var i=0;i<computercard.length;i++){
		
		if(computercard[i].posi==2&&computercard[i].sleeping==0){
			obj.state= 1;
			obj.cardidx = i;
			obj.thing = "attack";
			
			return obj;
			
			
		}
	}

	//电脑能召唤随从
	for(var i=0;i<computercard.length;i++){

		if(computercard[i].posi==1&&computercard[i].cost<=computerNowCrystal&&computercard[i].attack!='法术'&&getChangPosForcomputer()!=-1){
			obj.state= 1;
			obj.cardidx = i;
			obj.thing = "gotowar";

			return obj;
		}
		
	}
	
	
	
	
	obj.state = NOTHINGTODO;
	return obj;
}
/**
			 * 电脑开始做这件事情
			 */
			
			function doComputer(obj){
				console.log(obj.thing);
				if(obj.thing=="getCrystal"){//获得法力水晶
					computerMaxCrystal+= computerMaxCrystal<10?1:0;  //法力水晶加1
					computerNowCrystal=computerMaxCrystal;
					computerCardNum++;	
					cangetCrystal = 0;
				}else if(obj.thing=="getCard"){	//电脑抽卡
					var ran = Math.floor(Math.random()*card.length);
					var obj = card[ran]	;	
					var newobj = {
						img:obj.img,
						name:obj.name,
						cost:obj.cost,
						attack:obj.attack,
						HP:obj.HP,
						font:obj.font,
						posx:100,
						posy:100,
						posi:1,
						sleeping:1,
						point:obj.point,
						run:obj.run};
					computercard.push(newobj);
					myshowinfoParam("对方抽了一张卡",20);
					
					cangetCard = 0;
					
				}else if(obj.thing=="gotowar"){//召唤

					var goodpos = -1;

					goodpos = getChangPosForcomputer();
					if(goodpos!=-1){
						computercard[obj.cardidx].posi = 2;//把这只怪兽召唤到场上						
						computercard[obj.cardidx].posx = calcomputerChangPosX(goodpos);
						computercard[obj.cardidx].posy  = calcomputerChangPosY(goodpos);
						computercard[obj.cardidx].post  = goodpos;
						doNOPointFunction(computercard,obj.cardidx);
						computerNowCrystal -= computercard[obj.cardidx].cost;
						
						myshowinfoParam("对方召唤了一只"+computercard[obj.cardidx].name,20);
						
					}
					
					
					
				}else if(obj.thing=="attack"){//攻击
					
					
					var attackHero = Math.random()>0.5;
					
					if(attackHero==true||attackHero==1){
						
						myshowinfoParam(computercard[obj.cardidx].name+"对您发起了攻击",18);
						tx.push(
							
							{funname:"attackTX",
							fun:attackTX,
							who:"computercard",
							myidx:obj.cardidx,
							beginX:computercard[obj.cardidx].posx,
							beginY:computercard[obj.cardidx].posy,
							endX:450,
							endY:450,
							beginT:allT,
							lastT:15});
						heroHP -= computercard[obj.cardidx].attack;
						computercard[obj.cardidx].sleeping = 1;
						
					}else{
						var mychang= [];
						for(var i=0;i<mycard.length;i++){
							if(mycard[i].posi==2){
								mychang.push(i);
							}
						}
						var cnt = Math.floor(Math.random()*mychang.length);
						if(mychang.length==0)return;

						cnt = mychang[cnt];
						myshowinfoParam(computercard[obj.cardidx].name+"对"+mycard[cnt].name+"发起攻击",20);
						tx.push(
							{funname:"attackTX",
							fun:attackTX,
							who:"computercard",
							myidx:obj.cardidx,
							beginX:computercard[obj.cardidx].posx,
							beginY:computercard[obj.cardidx].posy,
							endX:mycard[cnt].posx,
							endY:mycard[cnt].posy,
							beginT:allT,
							goal:cnt,
							lastT:15});
						mycard[cnt].HP -= computercard[obj.cardidx].attack;
						computercard[obj.cardidx].HP -= mycard[cnt].attack;
//						if(mycard[cnt].HP<=0)mycard[cnt].posi= 3;
//						if(computercard[obj.cardidx].HP<=0)computercard[obj.cardidx].posi = 3;
						computercard[obj.cardidx].sleeping = 1;
						
					}
					
					
					
					
					
					
					
					
				}else if(obj.thing=="domagic"){//放法术
							
					
						if(computercard[obj.cardidx].point == POINTNO){//若为无指向性法术
							console.log(obj.cardidx);
							doNOPointFunction(computercard,obj.cardidx);
							myshowinfoParam("电脑使用了法术"+computercard[obj.cardidx].name,20);
						}else{//指向性法术，随机指定目标释放,但要根据卡牌的好坏
					
							var name = computercard[obj.cardidx].name;
							var goodCard = ["真言盾"];//增益卡列表
							var isgood = 0;
							for(var i=0;i<goodCard.length;i++){
								if(name==goodCard[i])isgood=1;
							}
							if(isgood){
								var myidx = chooseIt(computercard);
								domagic(computercard,obj.cardidx,computercard,myidx);
								myshowinfoParam("电脑对自己的"+computercard[myidx].name+"使用了法术"+computercard[obj.cardidx].name,18);
							}else{
								var itidx = -1;
								for(var i=0;i<mycard.length;i++){
									if(mycard[i].attack>=3&&mycard[i].HP>=3){
										itidx = i;
										break;
									}
								}
								if(itidx==-1)itidx = chooseIt(computercard);
								myshowinfoParam("电脑对您的"+mycard[itidx].name+"使用了法术"+computercard[obj.cardidx].name,18);
								domagic(computercard,obj.cardidx,mycard,itidx);
							}
							
						}
						
						
					
					
					
				}
			}
			/**
			 * 电脑分析使用这张牌是否合适
			 * @param {Object} cardidx
			 */
			function useMagicNoProblem(cardidx){
				
				if(computercard[cardidx].name=="真言盾"){//看自己场上是否有随从
					var ok = 0;
					for(var i=0;i<computercard.length;i++){
						if(computercard[i].posi==2)return true;
					}
					return false;
					
					
				}
				var goodforcomputer = ["火球术","刺杀","变形术"];//对方场上有攻击和血量在3以上的随从时发动
				for(var j=0;j<goodforcomputer.length;j++){
					if(computercard[cardidx].name==goodforcomputer[j]){
						for(var k=0;k<mycard.length;k++){
							if(mycard[k].posi==2&&mycard[k].attack>=3&&mycard[k].HP>=3)return true;//隐藏的bug
						}
						return false;
					}
					
				}
				if(computercard[cardidx].name=="扭曲虚空"){
					var  cgoal = 0;
					for(var i=0;i<computercard.length;i++){
						if(computercard[i].posi==2){
							cgoal += computercard[i].attack+computercard[i].HP;
						}
					}
					var mygoal = 0;
					for(var i=0;i<mycard.length;i++){
						if(mycard[i].posi==2){
							mygoal += mycard[i].attack + mycard[i].HP;
						}
					}
					if(cgoal>=mygoal-10)return false;
					else return true;
					
				}
				
			
				return true;
			}
			
