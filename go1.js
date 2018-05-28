/**
 * 
 */

var canvas;
var context;
var locs=new Array(19);
var img_b = new Image();
var img_w = new Image();
var bbox;
var is_tizi=false;
var bw=0x30000;
img_b.src = "black.png";
img_w.src = "white.png";	
for(var i=0; i<19; i++){
	locs[i]= new Array(19);
	for(var j=0; j<19; j++){
		locs[i][j]=i*100+j;
	}
}

function drawRect() {
	canvas = document.getElementById("GoBoard");
	context = canvas.getContext("2d");
	bbox =canvas.getBoundingClientRect();
	for (var i = 16; i <= 556; i += 30) {
		context.beginPath();
		context.moveTo(16, i);
		context.lineTo(556, i);
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(i, 16);
		context.lineTo(i, 556);
		context.closePath();
		context.stroke();
	}
}

var isBw;

function set_isBw(bow){
	isBw=bow;
	bw=bow;
	button_color_change();
}
function button_color_change(){
	var button_goahead =document.getElementById("goahead");
	if(bw==0x30000){
		button_goahead.style.color="black";
	}else{
		button_goahead.style.color="white";
	}
}
function goAhead(){
	isBw=undefined;
}


function play(event){
	var x=Math.round((event.clientX-bbox.left-16)/30);
	var y=Math.round((event.clientY-bbox.top-16)/30);
	if((locs[x][y]&0x10000)==0){
		exe(bw,x,y);
	}
	else{alert("这里柚子了");}
	if(isBw!=undefined){
		bw=isBw;
	}
}
function drawPieces(bw,x,y){
	if(bw==0x30000){
		context.drawImage(img_b, x * 30+2, y * 30+2,29,29);
	}
	else if(bw==0x10000){
		context.drawImage(img_w, x * 30+2, y * 30+2,29,29);
	}
}
function repaint(){
	context.clearRect(0,0,572,572);
	for (var i = 16; i <= 556; i += 30) {//绘制棋盘的线
		context.beginPath();
		context.moveTo(16, i);
		context.lineTo(556, i);
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(i, 16);
		context.lineTo(i, 556);
		context.closePath();
		context.stroke(); 
	}
	for(var i=0; i<19; i++){
		for(var j=0; j<19; j++){
			if((locs[i][j]&0x30000)==0x30000){
				drawPieces(0x30000,i,j);
			}
			else if((locs[i][j]&0x30000)==0x10000){
				drawPieces(0x10000,i,j);
			}
		}
	}
}
/****************************************************************************************************************/

var visited = [0x400000,0x200000,0x100000,0x80000,0x780000,0x40000];
var baohu = 20000;

var count = 0;
var buzhou = {
		 cos : new Array(),
		length:0
	};
function add_locsToBuzhou(){
	var copy_locs = new Array(19);
	for(var i=0; i<19; i++){
		copy_locs[i]= new Array(19);
		for(var j=0; j<19; j++){
			copy_locs[i][j] = locs[i][j];
		}
	}
	buzhou.cos[buzhou.length++]=copy_locs;
}

function houtuiyibu(){
	locs=buzhou.cos[--buzhou.length];
	repaint();
}
var DFS_Liberty=0;
function exe(_bw,x,y){
	locs[x][y]|=_bw;
	var aroundse = new Array(4);
	aroundse = getArounds(x,y);
	DFS_Liberty=0;
	count = 0;
	var i =0;
	for(;i<4;i++){if(aroundse[i]!=undefined){
		if((aroundse[i]&visited[4])!=0)continue;
		if((aroundse[i]&0x10000)!=0 && (aroundse[i]&0x30000)!=_bw){
			var tmp = aroundse[i]&0xffff;
			if(DFS_forLiberty(parseInt(tmp/100),tmp%100,_bw==0x30000?0x10000:0x30000,visited[i])==0){break;}
		}
		count = 0;
		DFS_Liberty=0;
	}}
	if(i!=4){
		if(count==1){
			if((aroundse[i]&0xffff)==baohu){
				alert("jiezheng");
//后退工作
				locs=buzhou.cos[--buzhou.length];
				return;
			}
			else{
				baohu=x*100+y;
			}
		}
		var tmp = aroundse[i]&0xffff;
		DFS_forDelete(parseInt(tmp/100),tmp%100,_bw==0x30000?0x10000:0x30000,visited[5]);
		repaint();
		recovery();
		add_locsToBuzhou();
		bw=_bw==0x30000?0x10000:0x30000;
		return;
	}else{
		baohu=20000;
		DFS_Liberty=0;
		DFS_forLiberty(x,y,_bw,visited[5]);
		if(DFS_Liberty==0){
			alert("禁手");
//后退
			locs=buzhou.cos[--buzhou.length];
			return;
		}
	}
	recovery();
	add_locsToBuzhou();
	drawPieces(_bw,x,y);
	bw=_bw==0x30000?0x10000:0x30000;
}
function getArounds(x,y){
	 var right;
	 var left;
	 var above;
	 var below;
	 if(x==0){
			if(y==0){
				below=locs[x][y+1];
				right=locs[x+1][y];
			}
			else if(y==18){
				above=locs[x][y-1];
				right=locs[x=1][y];
			}
			else{
				right=locs[x+1][y];
				above=locs[x][y-1];
				below=locs[x][y+1];
			}
		}else if(x==18){
			if(y==0){
				left=locs[x-1][y];
				below=locs[x][y+1];
			}
			else if(y==18){
				left=locs[x-1][y];
				above=locs[x][y-1];
			}else{
				left=locs[x-1][y];
				above=locs[x][y-1];
				below=locs[x][y+1];
			}
		}else{
			if(y==0){
				left=locs[x-1][y];
				right=locs[x+1][y];
				below=locs[x][y+1];
			}
			else if(y==18){
				left=locs[x-1][y];
				right=locs[x+1][y];
				above=locs[x][y-1];
			}else{
				left=locs[x-1][y];
				right=locs[x+1][y];
				above=locs[x][y-1];
				below=locs[x][y+1];
			}
		}
	 return [above,right,below,left];
}
function recovery(){
	for(var i=0; i<19; i++){
		for(var j=0; j<19; j++){
			locs[i][j]&=0x3ffff;
		}
	}
}

function DFS_forLiberty(x,y,bw,visited){
	if(DFS_Liberty>1)return DFS_Liberty;
	locs[x][y]|=visited;
	count++;
	var aroundsl = new Array(4);
	aroundsl= getArounds(x,y);
	for(var i=0;i<4;i++){if(aroundsl[i]!=undefined){
		if((aroundsl[i]&0x10000)==0){DFS_Liberty++;}
		else if((aroundsl[i]&visited)==0&&(aroundsl[i]&0x30000)==bw){
			var tmp = aroundsl[i]&0xffff;
			DFS_forLiberty(parseInt(tmp/100),tmp%100,bw,visited);
		}
	}}
	return DFS_Liberty;
}

function DFS_forDelete(x,y,bw,visited){
	var aroundsd = new Array(4);
	aroundsd = getArounds(x,y);
	locs[x][y]|=visited;
	locs[x][y]&=0xffff;
	for(var i=0; i<4;i++){if(aroundsd[i]!=undefined){
		if((aroundsd[i]&0x10000)!=0 && (aroundsd[i]&0x30000)==bw 
				&& (aroundsd[i]&visited)==0){
			var tmp = aroundsd[i]&0xffff;
			DFS_forDelete(parseInt(tmp/100),tmp%100,bw,visited);
		}
	}}
}













