/**
 * Created by Марина on 05.07.2017.
 */

var border;
var auto;
var auto2;
//--------------------border and road----------------
function createBorder() {
    border = document.createElement('div');
    border.className = 'borderClass';
    border.setAttribute('style', "border: 2px solid #000000; width: 700px; height: 500px;");
    document.body.appendChild(border);
    border.style.position = 'absolute';
    border.style.left = '300px';

    var road = document.createElement('img');
    road.setAttribute('src', "images/road.jpg");
    road.setAttribute('style', "width: 700px; height: 500px;")
    border.appendChild(road);

   // border.style.top = '100px';
}
//---------------auto----------------
function createAuto() {
    auto = document.createElement('img');
    auto.setAttribute('src', "images/auto.gif");
    auto.setAttribute('style', "width: 280px; height: 200px");
    auto.style.position = "absolute";
    auto.style.left = '80px';
    auto.style.top = '250px';
    border.appendChild(auto);
}

//------------cars-----------------
function createAuto2() {
    auto2 = document.createElement('img');
    auto2.setAttribute('src', "images/cars.gif");
    auto2.setAttribute('style', "width: 80px; height: 55px");
    auto2.style.position = 'absolute';
    auto2.style.left = '340px';
    auto2.style.top = '200px';
    border.appendChild(auto2);
}

let scale = 1;
//--------------move cars-------------------
function moveAuto2() {
    var speed = 2;
    auto2.style.top = parseInt(auto2.style.top) + speed + 'px';
    scale += 0.1;
    if (parseInt(auto2.style.top) >= 400 ) {
        auto2.style.top = '200px';
    }
    auto2.style.transform = 'scale('+ scale +  ')';
    auto2.style.left = parseInt(auto2.style.left) + 3 +'px';
}


function timeAuto2() {
    setInterval(moveAuto2, 100);
}

//--------------move auto--------------------

function moveLeft() {
    if (parseInt(auto.style.left) <= 25){
        return;
    }
    auto.style.left = parseInt(auto.style.left) - 20 + 'px';
}

function moveRight() {
    if(parseInt(auto.style.left) >= 400) {
        return;
    }
    auto.style.left = parseInt(auto.style.left) + 20 + 'px';
}

function onKeyPress(event) {
    if (event.keyCode === 37) {
        moveLeft();
    } else if (event.keyCode === 39) {
        moveRight();
    }
}

window.onkeydown = function (event) {
    onKeyPress(event);
}

//---------по умолчанию при запуске страницы----------
window.onload = function () {
    createBorder();
    createAuto();
    createAuto2();
    timeAuto2();
}