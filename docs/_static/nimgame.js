function WrappingNimGame(){

    const _PLAYER_ONE = "player-1";
    const _PLAYER_TWO = "player-2";
    const playerTunrSwitcher = {
        "player-1" : _PLAYER_TWO,
        "player-2" : _PLAYER_ONE
    }
    const _MULTY_PLAYER = "multy-player";
    const _SINGLE_PLAYER = "single-player";
    const gameModeSwitcher = {
        "single-player" : _MULTY_PLAYER,
        "multy-player" : _SINGLE_PLAYER
    }

    var nimGameList = [];

    function NIMgame(opts){
        if(opts){
         this.init(opts);
        }
    }
    
    NIMgame.prototype.init =  function(opts){
        this.opts = opts;   
        this.data =  JSON.parse(popAttribute(opts,'data-nimgame'));
        this.canvas = opts.querySelector('canvas');
        this.canvasContext = this.canvas.getContext('2d');
        this.circles = [];
        this.msgDiv = opts.querySelector('.nim-game-game-msg');
        this.maxTakeAway = this.data['takeaway'];
        this.numOfCircles = Math.min(this.data['count'],15);
        this.circleRadius = document.documentElement.clientWidth < 900 ? 27 : 36;
        this.removedCircleIndex = 0;
        this.playersTurn = _PLAYER_ONE;
        this.controlsLabelPlayerOne = this.opts.querySelector('.p1-label')
        this.controlsLabelPlayerTwo = this.opts.querySelector('.p2-label')
        this.controlsDivPlayerOne = this.opts.querySelector('.nim-controls[data-player=controls-1] .turn')
        this.controlsDivPlayerTwo = this.opts.querySelector('.nim-controls[data-player=controls-2] .turn')
        this.canvasContext.canvas.width = Math.min(this.canvas.parentElement.clientWidth,702);
        this.canvasContext.canvas.height = 400;
        this.playerTwo = this.opts.querySelector('.player-two');
        this.sliderInput = this.opts.querySelector('input');
        this.gameVersion =  _SINGLE_PLAYER;
        this.gameOver = false;


        this.imageLoaded = false;
        this.coinImage = new Image();
        this.coinImage.onload = this.onImageLoad.bind(this);
        this.coinImage.src = eBookConfig.staticDir + 'img/green-coin.png';


        this.restartGameButtonSP = this.opts.querySelector(`[data-restart=sp]`)
        this.restartGameButtonMP = this.opts.querySelector(`[data-restart=mp]`)
        this.thinking = false;


        this.inputPlayerOne = this.opts.querySelector(`[data-input-id=player-1]`);
        this.inputPlayerTwo = this.opts.querySelector(`[data-input-id=player-2]`);


        this.fristMove = true;

        this.opts.querySelectorAll(".nim-take").forEach(function(button){
            button.addEventListener("click", function(){
                var buttonId = button.getAttribute('data-id');
                // bouth players can start
                if(this.fristMove){
                    if(this.gameVersion == _MULTY_PLAYER){
                        this.playersTurn= buttonId;
                        if(this.playersTurn == "player-1"){
                            this.controlsDivPlayerOne.classList.toggle("d-none")
                        }
                        else{
                            this.controlsDivPlayerTwo.classList.toggle("d-none")
                        }
                    }
                    this.fristMove = false;
                }
                // cant play 2 times in a row or while computer is thinking
                if(buttonId !== this.playersTurn || this.thinking || this.gameOver){
                    return
                }
                var value = Number.parseInt(button.getAttribute('data-take'));

                for(var i=0;i<value;i++){
                    if(this.removedCircleIndex + 1 > this.circles.length)
                        break;
                    if(this.playersTurn == _PLAYER_ONE)
                        this.circles[this.removedCircleIndex].color = "#9C18BC";
                    else
                    this.circles[this.removedCircleIndex].color = "#d62c1a"; 
                    this.removedCircleIndex++;
                }
                this.clearCanvas();
                this.drawAllElements();
                //end game
                if (this.removedCircleIndex + 1 > this.circles.length) {
                    if (!this.controlsDivPlayerOne.classList.contains("d-none"))
                        this.controlsDivPlayerOne.classList.add("d-none")
                    if (!this.controlsDivPlayerTwo.classList.contains("d-none"))
                        this.controlsDivPlayerTwo.classList.add("d-none")
                    this.displayMsg($.i18n("nimgame_winner", this.playersTurn[this.playersTurn.length-1]));
                    this.gameOver = true;
                    return
                }
                if(this.numOfCircles - this.removedCircleIndex > 0){
                    this.displayMsg(' На табли je ' + (this.numOfCircles - this.removedCircleIndex)+ ' жетона - побеђује ко узме последњи')
                }
                // switch turn
                if(this.gameVersion === _MULTY_PLAYER){
                    this.playersTurn = playerTunrSwitcher[this.playersTurn];
                    this.controlsDivPlayerOne.classList.toggle("d-none")
                    this.controlsDivPlayerTwo.classList.toggle("d-none")
                }
                //"computer playes"
                if(this.gameVersion === _SINGLE_PLAYER){
                    this.controlsDivPlayerOne.classList.toggle("d-none")
                    this.controlsDivPlayerTwo.classList.toggle("d-none")
                    this.thinking = true;
                    setTimeout(() => { 
                    var numberOfCircles = this.circles.reduce(function(n, circle) {
                        return n + (circle.color === "transparent");
                    }, 0)
                    var subract;
                    var currentState = numberOfCircles % (this.maxTakeAway + 1);
                    if(currentState === 0){
                        subract = randomIntFromInterval(1,this.maxTakeAway);
                    }
                    else{
                        subract =currentState;
                    }
                    for(var i=0;i<subract;i++){
                        if(this.removedCircleIndex + 1 > this.circles.length)
                            break;
                        this.circles[this.removedCircleIndex].color = "#d62c1a";
                        this.removedCircleIndex++;
                    } 
                    if(this.numOfCircles - this.removedCircleIndex > 0){
                        this.displayMsg(' На табли je ' + (this.numOfCircles - this.removedCircleIndex)+ ' жетона - побеђује ко узме последњи')
                    }
                    if(this.removedCircleIndex + 1 > this.circles.length){
                        this.displayMsg($.i18n("nimgame_alg_won"));
                        if (!this.controlsDivPlayerOne.classList.contains("d-none"))
                            this.controlsDivPlayerOne.classList.add("d-none")
                        if (!this.controlsDivPlayerTwo.classList.contains("d-none"))
                            this.controlsDivPlayerTwo.classList.add("d-none")
                        this.gameOver = true;
                    }
                    this.clearCanvas();
                    this.drawAllElements();
                    this.thinking = false;
                    if (!this.gameOver) {
                        this.controlsDivPlayerOne.classList.toggle("d-none")
                        this.controlsDivPlayerTwo.classList.toggle("d-none")
                    }
                },1000);
                }

            }.bind(this));
        }.bind(this)); 
        this.restartGameButtonSP.addEventListener("click",function(){
            this.displayMsg(' На табли je ' + this.numOfCircles + ' жетона - побеђује ко узме последњи');
            this.circles = this.circles.map(circle => {circle.color = "transparent";return circle});
            this.controlsLabelPlayerOne.innerText = "Tи";
            this.controlsLabelPlayerTwo.innerText  = "Рачунар";
            this.playersTurn = _PLAYER_ONE;
            this.removedCircleIndex = 0;    
            this.clearCanvas();
            this.drawAllElements();
            this.gameVersion =  _SINGLE_PLAYER;
            this.fristMove = true;
            this.gameOver = false;
            if(this.controlsDivPlayerOne.classList.contains("d-none"))
                this.controlsDivPlayerOne.classList.remove("d-none");
            this.controlsDivPlayerTwo.classList.add("d-none");
        }.bind(this));
        this.restartGameButtonMP.addEventListener("click",function(){
            this.controlsDivPlayerOne.classList.add("d-none");
            this.controlsDivPlayerTwo.classList.add("d-none");
            this.controlsLabelPlayerOne.innerText = "Играч 1";
            this.controlsLabelPlayerTwo.innerText = "Играч 2";
            this.displayMsg(' На табли je ' + this.numOfCircles + ' жетона - побеђује ко узме последњи');
            this.circles = this.circles.map(circle => {circle.color = "transparent";return circle});
            this.removedCircleIndex = 0;    
            this.clearCanvas();
            this.drawAllElements();
            this.gameVersion =  _MULTY_PLAYER;
            this.fristMove = true;
            this.gameOver = false;
        }.bind(this))
        this.initNIM();
        this.drawAllElements();
    }

    NIMgame.prototype.onImageLoad = function(){
        this.imageLoaded = true;
    }

    NIMgame.prototype.clearCanvas = function(){
        this.canvasContext.clearRect(0,0,this.canvasContext.canvas.width,this.canvasContext.canvas.height);
    }

    NIMgame.prototype.drawAllElements = function(){
        for(var i=0;i<this.numOfCircles;i++){
                this.draw(this.canvasContext,this.circles[i].x,this.circles[i].y,this.circles[i].color,this.circleRadius);
       }
    }


    NIMgame.prototype.initNIM = function(){
        this.circles.push({"x":this.canvasContext.canvas.width*0.5,"y":this.canvasContext.canvas.height*0.5,"color":"transparent"});
        for(var i=1;i<this.numOfCircles;i++){     
            // make sure new circle doesn't overlap any existing circles
            while(true){
                var x=Math.random()*this.canvasContext.canvas.width;
                var y=Math.random()*this.canvasContext.canvas.height;
                var hit=0;
                for(var j=0;j<this.circles.length;j++){
                    var circle=this.circles[j];
                    var dx=x-circle.x;
                    var dy=y-circle.y;
                    var rr=this.circleRadius*2;
                    if((dx*dx+dy*dy<rr*rr) ||
                    (x+this.circleRadius>this.canvasContext.canvas.width) || 
                    (y+this.circleRadius>this.canvasContext.canvas.height) || 
                    (x-this.circleRadius< 0) ||
                    (y-this.circleRadius<0)){
                         hit++; 
                         break;
                    }
                }
                // new circle doesn't overlap any other, so break
                if(hit==0){
                    this.circles.push({"x":x,"y":y,"color":"transparent"});
                    break;
                }
            }
        }    
    }

    NIMgame.prototype.displayMsg = function(msg){
        this.msgDiv.innerText = msg;
    }

    window.addEventListener("load", function(){
        nimGames = document.getElementsByClassName('nim-game');
        for (var i = 0; i < nimGames.length; i++) {
            nimGameList[nimGames[i].id] = new NIMgame(nimGames[i]);		
        }
    });

    NIMgame.prototype.draw = function(canvasContext,x,y,color,radius){
        if (!this.imageLoaded) {
            console.log('Delay until images are loaded...');
            setTimeout(this.draw.bind(this, canvasContext,x,y,color,radius), 100);
            return;
        }
        canvasContext.drawImage(this.coinImage, x-radius*2/Math.sqrt(2), y-radius*2/Math.sqrt(2),radius*4/Math.sqrt(2),(radius*4/Math.sqrt(2))*0.90);
        if  (color !== 'transparent'){
            canvasContext.strokeStyle = color;
            canvasContext.beginPath();
            canvasContext.lineWidth = 6;
            canvasContext.moveTo(x-radius/Math.sqrt(2), y+radius/Math.sqrt(2));
            canvasContext.lineTo(x+radius/Math.sqrt(2), y-radius/Math.sqrt(2));
            canvasContext.stroke(); 
        }

    }
    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    function popAttribute(element, atribute, fallback = ''){
        var atr = fallback;
        if (element.hasAttribute(atribute)){
            atr = element.getAttribute(atribute);
            element.removeAttribute(atribute);
        }
        return atr;
    }
};
WrappingNimGame();

