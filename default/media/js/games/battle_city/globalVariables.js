var up=38,down=40,right=39,left=37,enter=32,pause_start=13;var cell=12;var windCount;var cursor=[];cursor[0]=210;cursor[1]=265;cursor[2]=315;var curY,curI,curX;var enemiesCount;var win;var countFlash;var setOfEnemies=[];setOfEnemies[0]=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];setOfEnemies[1]=[0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0];setOfEnemies[2]=[0,0,0,2,0,0,1,0,0,2,0,0,0,1,0,2,0,0,0,0];setOfEnemies[3]=[0,0,2,0,3,0,0,2,0,2,0,0,3,0,0,0,2,0,0,0];setOfEnemies[4]=[2,1,0,0,0,0,3,0,0,3,0,0,0,3,0,0,0,1,0,0];setOfEnemies[5]=[0,0,2,3,0,0,0,1,0,0,3,0,0,0,0,0,3,0,0,0];setOfEnemies[6]=[0,0,2,0,1,0,0,1,0,0,0,1,2,0,0,1,0,0,0,0];setOfEnemies[7]=[0,0,0,2,0,3,1,0,0,2,1,0,0,1,0,2,0,0,0,0];setOfEnemies[8]=[0,0,2,0,3,0,0,2,0,2,0,2,3,0,0,0,2,0,0,0];setOfEnemies[9]=[2,1,0,0,0,2,3,0,0,3,0,0,0,3,0,0,0,1,0,0];setOfEnemies[10]=[0,0,0,2,0,0,0,0,0,3,0,1,1,2,0,0,0,0,0,0];setOfEnemies[11]=[0,0,0,0,1,1,0,1,0,0,2,1,0,0,0,1,0,0,0,0];setOfEnemies[12]=[0,0,0,2,0,3,1,0,0,2,0,0,0,1,3,2,0,3,3,0];setOfEnemies[13]=[0,0,2,0,3,3,0,2,0,2,0,0,3,0,0,0,2,3,0,0];setOfEnemies[14]=[2,1,0,0,0,1,3,0,0,3,1,3,3,3,0,0,0,1,0,0];setOfEnemies[15]=[0,0,0,0,0,3,2,2,1,1,1,0,0,0,0,0,0,0,0,0];setOfEnemies[16]=[0,0,0,2,1,2,2,1,2,2,2,1,2,2,0,1,0,0,0,0];setOfEnemies[17]=[0,0,0,2,3,0,1,1,0,2,2,0,0,1,0,2,0,0,0,0];setOfEnemies[18]=[0,0,2,0,3,3,1,2,0,2,3,3,3,0,3,1,2,3,3,0];setOfEnemies[19]=[2,1,1,2,3,1,3,2,3,3,2,1,1,3,2,3,2,1,2,1];var paused;var game_over;var canvas,ctx,canvas1,canvas3,canvas0,ctx1,ctx2,ctx3,ctx0,canvas2,canvas4,ctx4,w,h;var img,img11,eagle,stone,bullet,g_o,forest,sea,stage,crashEagle;var frames=[];var birthsT=[];var tanks=[];var etanks=[];var scoreArray=[];for(var e=0;e<4;e++){scoreArray[e]=0}var improves1=[];var improves2=[];var improves3=[];var eimproves333=[];var tankCount;var enemies=[];var timerInterval=100;var timeCount;var nums=[];var heart,pause,gameOver,level;var crashBullets=[];var yG;var numberOfStage=0;var ns=[];var score,ScoreTable;var points=0;var arrayOfCanvases=[];var queueOfAnimations=[];var dcx=[];dcx[0]=[-1,-1,-1];dcx[1]=[0,1,2];dcx[2]=[3,3,3];dcx[3]=[0,1,2];var dcy=[];dcy[0]=[0,1,2];dcy[1]=[-1,-1,-1];dcy[2]=[0,1,2];dcy[3]=[3,3,3];var dcx1=[];dcx1[0]=[-1,-1,-1];dcx1[1]=[-1,0,1];dcx1[2]=[1,1,1];dcx1[3]=[-1,0,1];var dcy1=[];dcy1[0]=[-1,0,1];dcy1[1]=[-1,-1,-1];dcy1[2]=[-1,0,1];dcy1[3]=[1,1,1];var shiftBulletX=[0,12,24,12];var shiftBulletY=[12,0,12,24];var bonuses=[];bonuses[0]="b";bonuses[1]="h";bonuses[2]="l";bonuses[3]="w";bonuses[4]="m";bonuses[5]="t";var border;var bonImages=[];var forPoints=[];var pointsNums=[];var tankStep=12;var bulletStep=12;var tankWid=36;var tx=156,ty=444;var menu;var EnemyId=9;var chanceForShoot=20;var timeOfLastDeath=0,intervalForRevival=1000,intervalForBullet=500;var n=41,m=41;var map=[];var mapForBonus=[];var canvasOffsetLeft=0,canvasOffsetTop=0;var x=[],y=12,forShoot;var resourse_counter=0;var pointsForRecord=0;var timer,timerBots;var bullets=[];var b,d;var bonusTime;var forCheckMapForTank=[];forCheckMapForTank[0]=[0,1,1,0,2,2,0,2,1];forCheckMapForTank[1]=[0,1,0,1,2,0,2,1,2];var staffWall=[];staffWall[0]=[17,17,17,17,17,18,19,20,21,22,23,23,23,23,23];staffWall[1]=[39,38,37,36,35,35,35,35,35,35,39,38,37,36,35];var wallTime;var helmetTime;var countFrames=0;var oldX,oldY;var imgFrame;imgFrame=new Image();var bonObj;var eimproves1=[];var eimproves2=[];var eimproves3=[];var eimproves31=[];var eimproves32=[];var eimproves33=[];