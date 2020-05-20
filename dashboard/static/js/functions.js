function CardDivFunc() {
    alert("div'e tıkladınız!!");
}


window.onload = function () {
    openCity('content1');
    openRightMenu('content3');
};

function openCity(content) {
    var i;
    var x = document.getElementsByClassName("city");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(content).style.display = "block";
}

function openRightMenu(rightContent) {
    var i;
    var x = document.getElementsByClassName("rightSideBarContent");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    document.getElementById(rightContent).style.display = "block";
}


function Get(yourUrl) {
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET", yourUrl, false);
    Httpreq.send(null);
    return Httpreq.responseText;
}

function generalInfo() {
    var gi_url = 'http://160.75.154.58:5000/generalinfo';
    var gi_info = JSON.parse(Get(gi_url));

    iconcolor(gi_info.current_sick, "dailyTotalCargo", "divdailyTotalCargo", 50, 300);
    noticoncolor(gi_info.current_healthy, "totalSuccessRate", "divtotalSuccessRate", 30, 60);
    iconcolor(gi_info.current_risk, "mostCargo", "divmostCargo", 0.5, 0.6);
    iconcolor(6.3, "cargoAverange", "divcargoAverange", 3, 7);  // iconcolor(gi_info.risk_point,"riskPoint","divriskPoint",150,180);
    noticoncolor(gi_info.people_at_home, "branchSuccess", "divbranchSuccess", 150, 180);
    iconcolor(321, "activeTruck", "divactiveTruck", 150, 180);  // iconcolor(gi_info.risk_zone,"riskZone","divriskZone",150,180);

//    iconcolor(gi_info.active_user,"activeUser","divactiveUser",30,60);
//    iconcolor(gi_info.data_in_last_hour,"lastHourData","divlastHourData",37,38.5);
//    iconcolor(gi_info.total_user,"totalRisk","divtotalRisk",0.15,0.70);

}

generalInfo();

function townInfo(townName) {
    document.getElementById("townNameText").innerHTML = townName;
    var gi_url = 'http://160.75.154.58:5000/town_info?town='+townName;
    var gi_info = JSON.parse(Get(gi_url));

    iconcolor(gi_info.current_sick, "tcurrentSick", "tdivcurrentSick", 50, 300);
    noticoncolor(gi_info.current_healthy, "tcurrentHealthy", "tdivcurrentHealthy", 30, 60);
    iconcolor(gi_info.current_risk, "tcurrentRisk", "tdivcurrentRisk", 0.5, 0.6);
    iconcolor(6.3, "triskPoint", "tdivriskPoint", 3, 7);  // iconcolor(gi_info.risk_point,"riskPoint","divriskPoint",150,180);
    noticoncolor(gi_info.people_at_home, "tpeopleHome", "tdivpeopleHome", 150, 180);
    iconcolor(321, "triskZone", "tdivriskZone", 150, 180);  // iconcolor(gi_info.risk_zone,"riskZone","divriskZone",150,180);
    iconcolor(32, "ttotalAge", "tdivtotalAge", 30, 60);  // iconcolor(gi_info.tatal_age,"totalAge","divtotalAge",150,180);
    iconcolor(215, "ttotalMovement", "tdivtotalMovement", 150, 180);  // iconcolor(gi_info.total_movement,"totalMovement","divtotalMovement",150,180);

//    iconcolor(gi_info.active_user,"activeUser","divactiveUser",30,60);
//    iconcolor(gi_info.data_in_last_hour,"lastHourData","divlastHourData",37,38.5);
//    iconcolor(gi_info.total_user,"totalRisk","divtotalRisk",0.15,0.70);

}




function iconcolor(data, id, divid, sit1, sit2) {
    if (data < sit1) {
        if (data == null) {
            document.getElementById(id).innerHTML = "yok";
            document.getElementById(divid).style.borderColor = "rgba(105, 231, 129)";
            document.getElementById(divid).style.backgroundColor = "rgba(105, 231, 129,0.2)";
        } else {
            document.getElementById(id).innerHTML = data;
            document.getElementById(divid).style.borderColor = "rgba(105, 231, 129)";
            document.getElementById(divid).style.backgroundColor = "rgba(105, 231, 129,0.2)";
        }

    } else if (data < sit2) {
        document.getElementById(id).innerHTML = data;
        document.getElementById(divid).style.borderColor = "rgba(255, 178, 41)";
        document.getElementById(divid).style.backgroundColor = "rgba(255, 178, 41,0.2)";
    } else {
        document.getElementById(id).innerHTML = data;
        document.getElementById(divid).style.borderColor = "rgba(255, 0, 0)";
        document.getElementById(divid).style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    }
}

function noticoncolor(data, id, divid, sit1, sit2) {
    if (data > sit1) {
        if (data == null) {
            document.getElementById(id).innerHTML = "yok";
            document.getElementById(divid).style.borderColor = "rgba(255, 0, 0)";
            document.getElementById(divid).style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        } else {
            document.getElementById(id).innerHTML = data;
            document.getElementById(divid).style.borderColor = "rgba(105, 231, 129)";
            document.getElementById(divid).style.backgroundColor = "rgba(105, 231, 129,0.2)";
        }

    } else if (data > sit2) {
        document.getElementById(id).innerHTML = data;
        document.getElementById(divid).style.borderColor = "rgba(255, 178, 41)";
        document.getElementById(divid).style.backgroundColor = "rgba(255, 178, 41,0.2)";
    } else {
        document.getElementById(id).innerHTML = data;
        document.getElementById(divid).style.borderColor = "rgba(105, 231, 129)";
        document.getElementById(divid).style.backgroundColor = "rgba(105, 231, 129,0.2)";
    }
}


function circlePeople(areaid) {

    openRightMenu('content4');

    var lo_url = 'http://160.75.154.58:5000/get_user_area?uid=' + areaid;
    var area_info = JSON.parse(Get(lo_url));

    iconcolor(area_info.peopleNear, "nearPeople", "divnearPeople", 10, 20);
    noticoncolor(area_info.nearestPersonId, "nearstPeople", "divnearstPeople", 100, 300);
    iconcolor(area_info.nearestSickPersonId, "dangerstPeople", "divdangerstPeople", 30, 100);
    iconcolor(area_info.nearestSickPersonId, "sickstPeople", "divsickstPeople", 40, 110);  // iconcolor(gi_info.risk_point,"riskPoint","divriskPoint",150,180);
    noticoncolor(area_info.totalSickPersonNear, "circleSickPeople", "divcircleSickPeople", 5, 15);
    iconcolor(area_info.totalRiskPersonNear, "circleRiskPeople", "divcircleRiskPeople", 7, 20);  // iconcolor(gi_info.risk_zone,"riskZone","divriskZone",150,180);

    var apiLength = area_info.nearPersons.length;
    var k = 0;

    while (k < apiLength) {
        document.getElementById(`person${k + 1}dis`).innerHTML = area_info.nearPersons[k].Distance + ' km';
        document.getElementById(`person${k + 1}id`).innerHTML = area_info.nearPersons[k].PersonId;
        document.getElementById(`person${k + 1}temp`).innerHTML = area_info.nearPersons[k].Temperature;
        k++;
    }
    while (apiLength - 1 < 5) {
        document.getElementById(`person${apiLength + 1}dis`).innerHTML = null;
        document.getElementById(`person${apiLength + 1}id`).innerHTML = null;
        document.getElementById(`person${apiLength + 1}temp`).innerHTML = null;
        apiLength++;
    }

}
