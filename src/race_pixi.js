/**
 * Created by Марина on 30.07.2017.
 */

GameEvent = {};
GameEvent.AssetsLoaded = 'AssetsLoaded';
GameEvent.GameOver = 'GameOver';

class App extends PIXI.utils.EventEmitter {
    constructor() {
        super();

        this.app = new PIXI.Application(window.innerWidth - 50, window.innerHeight - 50, {backgroundColor: 0xFFFFFF});
        document.body.appendChild(this.app.view);

        this.app.gameLayer = new PIXI.Container();
        this.app.bump = new Bump(PIXI);
    }

    get stage() {
        return this.app.stage;
    }

    get gameLayer() {
        return this.app.gameLayer;
    }

    get bump() {
        return this.app.bump;
    }
}

let app = new App();
const textures = {};
const autoTextures = [];

app.on(GameEvent.AssetsLoaded, run);

const loader = new PIXI.loaders.Loader();
loader.add('start', 'images/button_start.png');
loader.add('road', 'images/road.jpg');
loader.add('auto', 'images/auto.gif');

loader.add('auto2', 'images/auto2.gif');
loader.add('auto3', 'images/auto3.png');
loader.add('auto4', 'images/auto4.png');
loader.add('auto5', 'images/auto5.png');
loader.add('auto6', 'images/auto6.png');
loader.add('auto7', 'images/auto7.png');
loader.add('auto8', 'images/auto8.png');

loader.add('saveButton', 'images/SaveButton.png');
loader.add('cancelButton', 'images/cancel_button2.png');
loader.add('gameOver', 'images/game_over.png');

loader.load((loader, resources) => {
    textures.start = resources.start.texture;
    textures.road = resources.road.texture;
    textures.auto = resources.auto.texture;
    textures.gameOver = resources.gameOver.texture;
    textures.saveButton = resources.saveButton.texture;
    textures.cancelButton = resources.cancelButton.texture;
    for (let i = 2; i < 9; i++) {
        autoTextures.push(resources['auto' + i].texture);
    }
});

loader.onComplete.add(() => app.emit(GameEvent.AssetsLoaded));

let mainAuto;
let enemyAuto;
let play;
let startButtonContainer;
let scoreText;
let score = 0;
let time = 3500;
let resultWindowContainer;
let leaderboardContainer;
let nameInput;
let name = '';
let resultArr = [0];
// let rectangle;
// let saveButton;
let leaderboardBackground;
// let resultName;
// let resultScore;
// let nameLabel;
// let scoreLabel;
// let styleTextActiveAndResultWindow;
const CARS_COUNT = 7;

function run() {
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    app.gameLayer.pivot.set(0.5);
    app.gameLayer.x = WIDTH / 2;
    app.gameLayer.y = HEIGHT / 2;
    app.stage.addChild(app.gameLayer);
    //--------------------road------------------------
    let road = new PIXI.Sprite(textures.road);
    road = app.gameLayer.addChild(road);
    road.anchor.set(0.5);
    road.width = WIDTH;
    road.height = HEIGHT;
    startGame();
}

//------------------START-----------------------
function startGame() {
    app.on(GameEvent.GameOver, gameOver);

    startButtonContainer = new PIXI.Container();
    startButtonContainer.scale.set(0.5);
    startButtonContainer.buttonMode = true;
    startButtonContainer.interactive = true;

    startButtonContainer.mouseover = () => createjs.Tween.get(startButtonContainer, {override: true}).to({
        scaleX: 0.7,
        scaleY: 0.7
    }, 300, createjs.Ease.backInOut);
    startButtonContainer.mouseout = () => createjs.Tween.get(startButtonContainer, {override: true}).to({
        scaleX: 0.5,
        scaleY: 0.5
    }, 300, createjs.Ease.backInOut);

    let startButton = new PIXI.Sprite(textures.start);
    startButton.anchor.set(0.5);
    startButton.x = -5;
    startButton.y = -50;
    startButtonContainer.addChild(startButton);
//----------------------------------------------
    let startText = new PIXI.Text('START', {
        fill: '0xFFFF00',
        fontSize: 80,
        fontWeight: 'bold',
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowColor: 0x000000,
    });
    startText.anchor.set(0.5);

    startButtonContainer.addChild(startButton);
    startButtonContainer.addChild(startText);

    app.gameLayer.addChild(startButtonContainer);

    //TODO: fix play function
    play = () => {
        startButtonContainer.off('click', play);
        app.gameLayer.removeChild(startButtonContainer);
        startButtonContainer.destroy({children: true});
        startButtonContainer = null;
        startButton = null;
        startText = null;

        createScore();
        createMainAuto();
        createEnemyCars();
        collision();
    };
    startButtonContainer.on('click', play);

}

//---------------------mainAuto--------------------------
function createMainAuto() {
    mainAuto = new PIXI.Sprite(textures.auto);
    mainAuto.anchor.set(0.5);
    mainAuto.scale.set(0.31);
    mainAuto.x = -300;
    mainAuto.y = 90;
    mainAuto = app.gameLayer.addChild(mainAuto);
}

//---------------------moveLeft--------------------------
function moveLeft() {
    let deltaXLeft = time < 3000 ? 35 : 25;
    let newXLeft = mainAuto.x - deltaXLeft <= -350 ? mainAuto.x : mainAuto.x - deltaXLeft;
    createjs.Tween.get(mainAuto).to({x: newXLeft}, 0.0005);
}

//---------------------moveRight--------------------------
function moveRight() {
    let deltaXRight = time < 3000 ? 35 : 25;
    let newXRight = mainAuto.x + deltaXRight <= 350 ? mainAuto.x + deltaXRight : mainAuto.x;
    createjs.Tween.get(mainAuto).to({x: newXRight}, 0.0005);
}

//---------------------moveAutoChief--------------------------
function onKeyPress(event) {
    switch (event.keyCode) {
        case 37:
            moveLeft();
            break;
        case 39:
            moveRight();
            break;
        case 13:
            play();
            break;
    }
}

//------------------WINDOW-------------------------------------
window.onkeydown = function (event) {
    onKeyPress(event);
};

//---------------------autoSecond--------------------------
function createEnemyCars() {
    let random = Math.floor(Math.random() * CARS_COUNT);
    enemyAuto = app.gameLayer.addChildAt(new PIXI.Sprite(autoTextures[random]), 1);
    enemyAuto.anchor.set(0.5);
    enemyAuto.scale.set(0);
    enemyAuto.x = 0;
    enemyAuto.y = -40;
    moveEnemyCars();
}

//---------------------createScore------------------------
function createScore() {
    let scoreBackground = new PIXI.Graphics();
    scoreBackground.beginFill(0xFFD033, 1);
    scoreBackground.drawRect(400, -335, 410, 120);
    scoreBackground.endFill();
    app.gameLayer.addChild(scoreBackground);

    let scoreLabel = new PIXI.Text('SCORE', {
        fill: "#FFFFFF",
        fontSize: 40,
        align: 'center',
    });
    scoreLabel.anchor.set(0.5);
    scoreLabel.x = 520;
    scoreLabel.y = -290;
    app.gameLayer.addChild(scoreLabel);

    scoreText = new PIXI.Text(score, {
        fill: "#FFFFFF",
        fontSize: 40,
        align: 'center',
    });
    scoreText.anchor.set(0.5);
    scoreText.x = 520;
    scoreText.y = -250;
    scoreText.text = score;
    app.gameLayer.addChild(scoreText);
}

//---------------------SCORE + 1 ------------------------
function increaseScore() {
    score++;
}
//-------------------changeSpeed------------------
function changeSpeed() {
    return score % 5 === 0 ? time -= 500 : time;
}

//---------------------moveEnemyCars-------------------------
function moveEnemyCars() {
    let toX = Math.random() <= 0.5 ? 240 : -240;
    createjs.Tween.get(enemyAuto)
        .to({
            x: toX,
            y: 45,
            scaleX: 0.9,
            scaleY: 0.9
        }, changeSpeed())
        .call(() => {
            createjs.Tween.get(enemyAuto)
                .to({
                    x: toX > 0 ? toX + 80 : toX - 80,
                    y: 60,
                    scaleX: 1.2,
                    scaleY: 1.2
                }, 1000)
                .to({alpha: 0}, 500)
                .call(() => increaseScore())
                .call(() => {
                    app.gameLayer.removeChild(enemyAuto);
                    createEnemyCars();
                    scoreText.text = score;
                })
                .on('change', () => collision());
        });
}

//---------------------collision----------------------------------
function hit(mainAuto, enemyAuto) {
    return app.bump.hit(mainAuto, enemyAuto);
}

//-----------condition collision-------------------------
function collision() {
    if (hit(mainAuto, enemyAuto)) {
        createjs.Tween.removeTweens(enemyAuto);
        collisionEffect();
        app.emit(GameEvent.GameOver);
    }
}

//---------------Blinking auto after collision---------------
function collisionEffect() {
    createjs.Tween.get(enemyAuto)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .call(() => app.gameLayer.removeChild(enemyAuto));
    createjs.Tween.get(mainAuto)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .to({alpha: 0}, 60)
        .to({alpha: 1}, 60)
        .call(() => app.gameLayer.removeChild(mainAuto));
}

//--------------GameOver-------------------------
function gameOver() {
    app.off(GameEvent.GameOver, gameOver);

    let gameOverSprite = new PIXI.Sprite(textures.gameOver);
    gameOverSprite.anchor.set(0.5);
    gameOverSprite.y = -50;
    gameOverSprite.scale.set = 0.9;
    gameOverSprite.buttonMode = true;
    gameOverSprite.interactive = true;
    gameOverSprite = app.gameLayer.addChild(gameOverSprite);

    gameOverSprite.mouseover = () => {
        createjs.Tween.get(gameOverSprite, {override: true}).to({
            scaleX: 1.1,
            scaleY: 1.1
        }, 300, createjs.Ease.backInOut);
    };
    gameOverSprite.mouseout = () => createjs.Tween.get(gameOverSprite, {override: true}).to({
        scaleX: 0.9,
        scaleY: 0.9
    }, 300, createjs.Ease.backInOut);

    gameOverSprite.on('click', () => {
            app.gameLayer.removeChild(gameOverSprite);
            enemyAuto && createjs.Tween.removeTweens(enemyAuto);
            enemyAuto && app.gameLayer.removeChild(enemyAuto);
            enemyAuto = null;

            app.gameLayer.removeChild(scoreText);

            createResultWindow();
            time = 3500;
        }
    )
}

//--------------Active window-----------------
function createResultWindow() {
    resultWindowContainer = new PIXI.Container();
    app.gameLayer.addChild(resultWindowContainer);

    let resultWindowBackground = new PIXI.Graphics();
    resultWindowBackground.lineStyle(2, 0xFFFFFF, 1);
    resultWindowBackground.beginFill(0xFFD033, 1);
    resultWindowBackground.drawRoundedRect(-200, -200, 400, 400, 25);
    resultWindowBackground.endFill();
    resultWindowContainer.addChild(resultWindowBackground);

    createResultWindowText();
    createInputName();
    createSaveButton();
    createCancelLeaderboardBtn();
}

//--------------text active window---------------
function createResultWindowText() {
    let style = {
        fill: 0xFFFFFF,
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowColor: 0x000000,
        fontSize: 50,
        outline: 50
    };

    let winText = new PIXI.Text('You win', style);
    winText.x = -90;
    winText.y = -170;
    resultWindowContainer.addChild(winText);

    let playerScoreText = new PIXI.Text(`Got ${score} score`, style);
    playerScoreText.x = -130;
    playerScoreText.y = -100;
    resultWindowContainer.addChild(playerScoreText);

    let saveResultText = new PIXI.Text('Save the result', style);
    saveResultText.x = -165;
    saveResultText.y = -30;
    resultWindowContainer.addChild(saveResultText);

    let nameText = new PIXI.Text('Name:', {
        fill: 0xFFFFFF,
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowColor: 0x000000,
        fontSize: 30,
        outline: 50
    });
    nameText.x = -150;
    nameText.y = 50;
    resultWindowContainer.addChild(nameText);

    let scoreTextWindow = new PIXI.Text(`Score:\n${score}`, {
        fill: 0xFFFFFF,
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowColor: 0x000000,
        fontSize: 30,
        align: 'center',
        outline: 50
    });
    scoreTextWindow.x = 50;
    scoreTextWindow.y = 50;
    resultWindowContainer.addChild(scoreTextWindow);
}

function createInputName() {
    nameInput = new PixiTextInput('', {fontSize: 30});
    nameInput.x = -150;
    nameInput.y = 80;
    resultWindowContainer.addChild(nameInput);
}

//-------------------leaderboardWindow---list of players  and cancel button result window----------------
function createLeaderboardWindow() {
    leaderboardContainer = new PIXI.Container();
    app.gameLayer.addChild(leaderboardContainer);

    leaderboardBackground = new PIXI.Graphics();
    leaderboardBackground.lineStyle(2, 0xFFFFFF, 1);
    leaderboardBackground.beginFill(0xFFD033, 1);
    leaderboardBackground.drawRoundedRect(-250, -250, 500, 500, 25);
    leaderboardBackground.endFill();
    leaderboardContainer.addChild(leaderboardBackground);

    let nameLabel = new PIXI.Text('Name', {
        fill: 0xFFFFFF,
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowColor: 0x000000,
        fontSize: 40,
        align: 'center',
        outline: 50
    });
    nameLabel.x = -200;
    nameLabel.y = -210;
    leaderboardContainer.addChild(nameLabel);

    let scoreLabel = new PIXI.Text('Score', {
        fill: 0xFFFFFF,
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowColor: 0x000000,
        fontSize: 40,
        align: 'center',
        outline: 50
    });
    scoreLabel.x = 80;
    scoreLabel.y = -210;
    leaderboardContainer.addChild(scoreLabel);

    resultArr.sort(sortResult);

    for (let i = 0; i < resultArr.length; i++) {
        let resultName = new PIXI.Text(`${resultArr[i].name}`, {fill: 0xFFFFFF});
        resultName.x = -200;
        resultName.y = -160 + 50 * i;
        leaderboardContainer.addChild(resultName);

        let resultScore = new PIXI.Text(`${resultArr[i].score}`, {fill: 0xFFFFFF, align: 'center', outline: 50});
        resultScore.x = 115;
        resultScore.y = -160 + 50 * i;
        leaderboardContainer.addChild(resultScore);
    }
    createCancelLeaderboardBtn();
    cancelButtonResultWindow();
}

//------------------cancel button-------------------------
function createCancelButton() {
    let cancelButton = new PIXI.Sprite(textures.cancelButton);
    cancelButton.anchor.set(0.5);
    cancelButton.scale.set(0.6);
    cancelButton.buttonMode = true;
    cancelButton.interactive = true;
    return cancelButton;
}

function createCancelLeaderboardBtn() {
    let cancelButton = createCancelButton();
    cancelButton = resultWindowContainer.addChild(cancelButton);
    cancelButton.x = 180;
    cancelButton.y = -180;
    cancelButton.on('click', () => {
        resultWindowContainer.destroy({children: true});
        score = 0;
        startGame();
    });
}

//------------------button save player`s result and cancel button -------------------
function createSaveButton() {
    let saveButton = new PIXI.Sprite(textures.saveButton);
    saveButton.anchor.set(0.5);
    saveButton.scale.set(0.2);
    saveButton.y = 155;
    saveButton.buttonMode = true;
    saveButton.interactive = true;
    saveButton = resultWindowContainer.addChild(saveButton);

    saveButton.on('click', () => {
            if (nameInput.text.length > 2) {
                createjs.Tween.get(saveButton)
                    .to({
                        scaleX: 0.15,
                        scaleY: 0.15
                    }, 50)
                    .wait(50)
                    .to({
                        scaleX: 0.2,
                        scaleY: 0.2
                    }, 100)
                    .wait(100)
                    .call(() => {
                            resultArr = JSON.parse(localStorage.getItem('resultArr')) || [];
                            resultArr.sort(sortResult);
                            name = nameInput.text;
                            if (resultArr.length >= CARS_COUNT) {
                                if (score > resultArr[resultArr.length - 1].score) {
                                    resultArr.pop();
                                    resultArr.push({name: name, score: score});
                                    resultArr.length = 7;//huj//huj//huj//huj//huj VERY BIG HUUUUUUUUJ
                                }
                            } else {
                                resultArr.push({name: name, score: score});
                            }
                            resultWindowContainer.destroy({children: true});
                            saveData();
                            createLeaderboardWindow();
                        }
                    )
            } else {
                let inputErrorText = new PIXI.Text('More than 2 symbols', {
                    fill: 0xFF0000,
                    fontSize: 15
                });
                inputErrorText.x = -150;
                inputErrorText.y = 120;
                resultWindowContainer.addChild(inputErrorText);
            }
        }
    )
}

//------------------cancel button ResultWindow--------------------
function cancelButtonResultWindow() {
    let cancelButton = createCancelButton();
    cancelButton.x = 230;
    cancelButton.y = -230;
    cancelButton.on('click', () => {
        leaderboardContainer.destroy({children: true});
        score = 0;
        startGame();
    });
    leaderboardContainer.addChild(cancelButton);
}

function saveData() {
    localStorage.setItem('resultArr', JSON.stringify(resultArr));
}

Object.defineProperties(PIXI.DisplayObject.prototype, {
    scaleX: {
        get() {
            return this.scale.x;
        },
        set(v) {
            this.scale.x = v;
        }
    },
    scaleY: {
        get() {
            return this.scale.y;
        },
        set(v) {
            this.scale.y = v;
        }
    }
});

function sortResult(a, b) {
    return a.score > b.score ? -1 : 1;
}
