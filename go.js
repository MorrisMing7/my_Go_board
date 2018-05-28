var canvas;
var context;
var bbox;
var img_b = new Image();
var img_w = new Image();
img_b.src = "black.png";
img_w.src = "white.png";
var xy_zero=36

//argument use for function "go"
//
var current_no_step =1;
//use a same color piece when "is_studying" is true
var is_studying = false;
//which color is used now
var current_bw = 1;
// for checking 打劫
var tizi=new Array(411);
// to record info of the whole board every step
var steps = new Array(411);
for (var i = 0; i<=410; i+=1){
    steps[i]=new Array(19);
    for (var j=0; j<=18; j+=1){
        steps[i][j]=new Array(19);
        for (var k=0; k<=18; k+=1){
            // 0 means none piece, 1 means black, -1 means white
            steps[i][j][k]=0;
        }
    }
}


function prepare(){
    drawRect();
    document.getElementById("black").disabled = true;
    document.getElementById("white").disabled = true;
    document.getElementById("goahead").disabled = true;
}

//draw the board ,lines, points
function drawRect() {
	canvas = document.getElementById("GoBoard");
	context = canvas.getContext("2d");
    horizontal_char=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19];
    vertical_char=['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S'];
    //lines
    grid=30;
    for (var i = 0; i<=18; i +=1){
        context.beginPath();
        x=xy_zero+grid*i;
        context.moveTo(xy_zero,x);
        context.lineTo(xy_zero+18*grid,x);
        context.moveTo(x,xy_zero);
        context.lineTo(x,xy_zero+18*grid);
        context.closePath();
        context.stroke();
    }
    //axis
    for (var i = 0; i<=18; i +=1){
        context.font ="bold 13px Arial";
        context.fillText(horizontal_char[i],28+grid*i, 20);
        context.fillText(vertical_char[i], 10,38+grid*i);

    }
    //point
    for (var i=0; i<=2; i+=1){
        context.beginPath();
        x=xy_zero+3*grid+i*6*grid;
        for (var j=0; j<=2; j+=1){
            context.beginPath();
            y=xy_zero+3*grid+j*6*grid;
            context.arc(x,y,3.5,10,0,true);
            context.fill();
            context.closePath();
        }
    }
}

//draw a series of pieces
function drawPieces(no_step){
    context.clearRect(0,0,572,572);
    drawRect();
    for (var i=0; i<=18; i++){
        for (var j=0; j<=18; j++){
            if (steps[no_step][i][j]==0){
                continue;
            }
            else if (steps[no_step][i][j]==1){
                drawApiece(true,i,j);
            }else if (steps[no_step][i][j]==2){
                drawApiece(false,i,j);
            }
        }
    }
}
function drawApiece(black,x,y){
    if (black==true){context.drawImage(img_b, x*grid+xy_zero- 14, y*grid+xy_zero- 14,28,28);}
    else {context.drawImage(img_w, x*grid+xy_zero- 14, y*grid+xy_zero- 14,28,28);}
}

function showWhosTurn(){
    var whosTurn =document.getElementById("whosTurn");
    whosTurn.textContent=(current_bw==1? "black":"white") +"'s trun";
}

function changeColor(){
    current_bw=current_bw==1?2:1;
    var board=document.getElementById("GoBoard");
    board.style.cursor=current_bw==1?("url(\"cursor/black.png\") 15 15, crosshair"):("url(\"cursor/white.png\") 15 15, crosshair");
}
//process the logical step
function play(event){
	bbox =canvas.getBoundingClientRect();
	var x=Math.round((event.clientX-bbox.left-xy_zero)/30);
	var y=Math.round((event.clientY-bbox.top-xy_zero)/30);
	if(x>=0 && x<=18 && y>=0 && y<=18){
	    if (steps[current_no_step-1][x][y]!=0){
//	        alert('柚子');
            showWhosTurn();
	        return;
	    }
	    else{
	        var bow=current_bw
	        var state=go(bow,x,y);
	        if (state!=0){return;}
	    }
	}
	if(is_studying==false){
	    changeColor();
	}
	showWhosTurn();
}


function undo(){
    drawPieces(--current_no_step -1);
    changeColor();
    showWhosTurn();
}
function goAhead(){
    changeColor();
    showWhosTurn();
}
function study(){
    is_studying=!is_studying;
    document.getElementById("black").disabled = !is_studying;
    document.getElementById("white").disabled = !is_studying;
    document.getElementById("goahead").disabled = !is_studying;
    document.getElementById("study").value = is_studying?"退出研究":"研究";
    document.getElementById("undo").disabled = is_studying;
}
function set_Bw(bow){
    is_studying=true;
    current_bw=bow;
    var button_goahead =document.getElementById("goahead");
    showWhosTurn();
}
//aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
//fixed length array
function loc(xx,yy){
    this.x=xx;
    this.y=yy;
}

var visited=new Array(19);
for (var i=0;i<=18; i++){
    visited[i]=new Array(19);
    for (var j=0;j<=18;j++){
        visited[i][j]=false;
    }
}
function recoverVisited(){
    for (var i=0;i<=18; i++){
        for (var j=0;j<=18;j++){
            visited[i][j]=false;
    }
}
}

function go(bow,x,y){
    for (var i=0; i<19;i++){for(var j=0;j<19;j++){
        steps[current_no_step][i][j]=steps[current_no_step-1][i][j];
    }}
    steps[current_no_step][x][y]=bow;
    recoverVisited();
    var around = lookAround(x,y);
    //check the other color piece that around this point to determine whether to remove
    var tbow=bow==1?2:1;
    var count_remove=0;
    for (var i=0; i<=3  ; i++){if(around[i]!=undefined){

        tx=around[i].x;
        ty=around[i].y;
        if(!visited[tx][ty] && steps[current_no_step][tx][ty]==tbow){
            if(DFS_for_liberty(tbow,tx,ty)==0){
                var remove_list =DFS_for_remove(tbow,tx,ty);
                for (var j=0;j<remove_list.count;j++){
                    var tx= remove_list.locs[j].x;
                    var ty= remove_list.locs[j].y;
                    steps[current_no_step][tx][ty]=0;
                    count_remove++;
                    is_removed=true;
                }
                drawPieces(current_no_step);
            }
        }
    }}
    //check whether is 打劫
    if(count_remove==1){
        tmp = remove_list.locs[0]
        if(tizi[current_no_step-1]!=undefined && tizi[current_no_step-1].x==tmp.x && tizi[current_no_step-1].y==tmp.y){
            alert('此处打劫');
            drawPieces(current_no_step-1);
            return 2;
        }else{
            tizi[current_no_step]=new loc(x,y);
        }
    }else{
        tizi[current_no_step]=new loc(-1,-1);
    }
    // determine whether it is illegal point
    if(count_remove==0){
        tizi=new loc(-1,-1);
        var liberty=DFS_for_liberty(bow,x,y);
        if(liberty==0){
            alert('禁手');
            return 1;
        }
    }

    drawApiece(bow,x,y);
    current_no_step++;
    return 0;
}

function DFS_for_liberty(bow,x,y){
    var count_liberty=0;
    var liberty_visited=new Array(19);
    for (var i=0;i<=18; i++){
        liberty_visited[i]=new Array(19);
        for (var j=0;j<=18;j++){
            liberty_visited[i][j]=false;
        }
    }
    var stack=new Array(180);
    var idx=0;
    stack[idx++] = new loc(x,y);

    while(idx!=0){
        tmp = stack[--idx];
        visited[tmp.x][tmp.y]=true;
        var around = lookAround(tmp.x,tmp.y);
        for (var i=0; i < 4 ; i++){
            if(around[i]!=undefined){
                tx=around[i].x;
                ty=around[i].y;
                if(!visited[tx][ty]){
                    if(steps[current_no_step][tx][ty]==bow){
                        visited[tx][ty]=true;
                        stack[idx++]=new loc(tx,ty);
                    }
                    else if(steps[current_no_step][tx][ty]==0){
                        if(!liberty_visited[tx][ty]){
                            count_liberty++;
                            liberty_visited[tx][ty]=true;
                        }
                    }
                }
            }


        }
    }
//    alert('liberty:'+count_liberty);
    return count_liberty;
}
function lookAround(x,y){
    var udlr=new Array(4);
        udlr[0]=new loc(x,y-1);
        udlr[1]=new loc(x,y+1);
        udlr[2]=new loc(x-1,y);
        udlr[3]=new loc(x+1,y);
    if (y==0){udlr[0]=undefined;}
    else if (y==18){udlr[1]=undefined;}
    if(x==0){udlr[2]=undefined;}
    else if (x==18){udlr[3]=undefined;}
    return udlr;
}
function DFS_for_remove(bow,x,y){
    var tvisit=new Array(19);
    for (var i=0;i<=18; i++){
        tvisit[i]=new Array(19);
        for (var j=0;j<=18;j++){
            tvisit[i][j]=false;
        }
    }
    var result = Object();
    result.count =0;
    result.locs =  new Array(180);

    var stack = new Array(180);
    var idx =0;
    stack[idx++] = new loc(x,y);
    tvisit[x][y]=true;
    while(idx!=0){
        tmp = stack[--idx];
        result.locs[result.count++]=tmp;
        var around = lookAround(tmp.x,tmp.y);
        for (var i=0; i < 4 ; i++){if(around[i]!=undefined){
            tx=around[i].x;
            ty=around[i].y;
            if(!tvisit[tx][ty] && steps[current_no_step][tx][ty]==bow){
                stack[idx++]=new loc(tx,ty);
                tvisit[tx][ty]=true;
            }
        }}
    }
    return result;
}





