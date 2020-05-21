/*function getData() {
    var min = 35;
    var max = 42;
    var random = Math.floor(Math.random() * (+max - +min)) + +min;
    return random;
}

Plotly.plot('chart', [{
    y: [getData()],
    type: 'line'

}]);
var cnt = 0;

setInterval(function () {
    Plotly.extendTraces('chart', {y: [[getData()]]}, [0]);
    cnt++;

    if (cnt > 20) {
        Plotly.relayout('chart', {
            xaxis: {
                range: [cnt - 10, cnt]
            }
        });
        Plotly.relayout('chart', {
            xaxis: {
                range: [cnt - 10, cnt]
            }
        });
    }

}, 1000);*/


//let barChart1 = document.getElementById('barChart1').getContext('2d');
//let pieChart1 = document.getElementById('pieChart1').getContext('2d');

//Chart.defaults.global.defaultFontFamily = 'Arial';
//Chart.defaults.global.defaultFontSize = 10;
//Chart.defaults.global.defaultFontColor = '#000';

/*let derece = new Chart(barChart1, {
    type: 'horizontalBar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data: {
        labels: ['Çocuk', 'Genc', 'OrtaYasli', 'Yasli'],
        datasets: [{
            label: 'Derece',
            data: [
                41,
                36.5,
                39,
                40,
                42,
                34


            ],
            backgroundColor: ['rgb(33, 150, 243)', 'rgba(105, 231, 129)', 'rgba(255, 178, 41)', 'rgba(255, 0, 0)']
        }]
    },
    options: {
        title: {
            display: true,
            text: 'Vücut Sıcaklıkları',
            fontSize: 15
        },
        legend: {
            display: false,
            position: 'right',
            labels: {
                fontColor: '#000'
            }
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
            }
        },
        tooltips: {
            enabled: false
        }
    }
});*/


new Chart(document.getElementById("line-chart"), {
  type: 'line',
  data: {
    labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    datasets: [{
        data: [86,114,149,72,221,97,133],
        label: "Dağıtımda katedilen toplam mesafe (Km)",
        borderColor: "#3e95cd",
        fill: false
      },
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Son Bir Hafta Hareket Verileri'
    }
  }
});
/*
new Chart(document.getElementById("lineChartArea"), {
  type: 'line',
  data: {
    labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    datasets: [{
        data: [86,114,149,72,109,97,133,221,74,157],
        label: "Kilometre",
        borderColor: "#f13636",
        fill: false
      },
    ]
  },
  options: {
    title: {
      display: true,
      text: 'İlçeye Giriş Çıkış Sıklığı'
    }
  }
});*/

new Chart(document.getElementById("radar-chart"), {
    type: 'radar',
    data: {
      labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
      datasets: [
        {
          label: "Olumlu",
          fill: true,
          backgroundColor: "rgba(86, 247, 114,0.2)",
          borderColor: "rgba(86, 247, 114,1)",
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgba(86, 247, 114,1)",
          data: [23,42,11,31,42,17,52]
        }, {
          label: "Olumsuz",
          fill: true,
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgba(255,99,132,1)",
          pointBorderColor: "#fff",
          data: [13,52,41,21,22,27,35]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'İlçe Haftalık Müşteri Yorum Dağılımı'
      }
    }
});

new Chart(document.getElementById("radarChart"), {
    type: 'radar',
    data: {
      labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
      datasets: [
        {
          label: "Olumlu",
          fill: true,
          backgroundColor: "rgba(86, 247, 114,0.2)",
          borderColor: "rgba(86, 247, 114,1)",
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgba(86, 247, 114,1)",
          data: [43,52,21,41,55,34,63]
        }, {
          label: "Olumsuz",
          fill: true,
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgba(255,99,132,1)",
          pointBorderColor: "#fff",
          data: [17,32,41,31,34,19,45]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Günlük Müşteri Yorum Dağılımı'
      }
    }
});

new Chart(document.getElementById("pie-chart"), {
    type: 'pie',
    data: {
      labels: ["Beyoğlu", "Beşiktaş", "Kağıthane", "Sarıyer", "Kadıköy"],
      datasets: [{
        label: "Saat",
        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
        data: [16,34,58,25,35]
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Son Bir Haftada En Çok Dağıtım Yapılan İlçeler'
      }
    }
});

new Chart(document.getElementById("pieChartArea"), {
    type: 'pie',
    data: {
      labels: ["Dikilitaş", "Gayrettepe", "Kuruçeşme", "Mecidiye", "Levazım"],
      datasets: [{
        label: "Hasta Sayısı",
        backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
        data: [36,31,23,17,9]
      }]
    },
    options: {
      title: {
        display: true,
        text: 'En Çok Kargo Dağıtılan Semtler'
      }
    }
});


new Chart(document.getElementById("bar-chart-grouped"), {
    type: 'bar',
    data: {
      labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
      datasets: [
        {
          label: "Ulaştırılamamış/Hatalı Dağıtım Adedi",
          backgroundColor: ["#ff0000","#f0ad4e","#f0ad4e","#ff0000","#f0ad4e","#f0ad4e","#ff0000"],
          data: [12,4,6,11,5,6,9,0]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Haftalık Operasyonel Olay Tablosu'
      }
    }
});

new Chart(document.getElementById("mixedChart"), {
    type: 'bar',
    data: {
      labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
      datasets: [
        {
          label: "Teslim Edilememiş",
          backgroundColor: ["#ff0000","#ff0000","#ff0000","#ff0000","#ff0000","#ff0000","#ff0000"],
          data: [12,8,7,5,11,8,9,5]
        }, {
          label: "Teslim Edilecek",
          backgroundColor: ["#f0ad4e","#f0ad4e","#f0ad4e","#f0ad4e","#f0ad4e","#f0ad4e","#f0ad4e"],
          data: [22,24,21,16,26,19,23]
        }, {
          label: "Teslim Edilmiş",
          backgroundColor: ["#5cb85c","#5cb85c","#5cb85c","#5cb85c","#5cb85c","#5cb85c","#5cb85c"],
          data: [37,34,39,32,38,36,39]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'İlçe Genel Durum'
      }
    }
});

new Chart(document.getElementById("someChartArea"), {
  type: 'line',
  data: {
    labels: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
    datasets: [{
        data: [156,187,221,165,177,210,197],
        label: "Dağıtımda katedilen toplam mesafe (KM)",
        borderColor: "#5cb85c",
        fill: false
      },
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Haftalık İlçe Hareket Verileri'
    }
  }
});


var derece2data = JSON.parse(Get('http://160.75.154.58:5000/generalinfo'));

let derece2 = new Chart(pieChart1,
    {

        type: 'doughnut',
        data: {
            labels: [
                'Teslim Edilmiş',
                'Teslim edilecek',
                'Teslim Edilememiş'
            ],
            datasets: [{
                data: [derece2data.current_healthy,
                    derece2data.current_risk,
                    derece2data.current_sick],
                backgroundColor: ['rgb(119,221,119)',
                    'rgb(255,210,97)',
                    'rgb(255,105,97)']
            }],

            // These labels appear in the legend and in the tooltips when hovering different arcs
        }
    });

function ikoncolor(data, id, divid, sit1, sit2) {
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

//line chart

function searchFunction(userno) {
    var ppid = document.getElementById("searchPerson").value;
    if (typeof userno !== 'undefined') {
        ppid = userno
    }
    ;
    var allUsersbutton = document.getElementById("allUsers");
    allUsersbutton.style.visibility = "visible";
    if (!(isNaN(parseInt(ppid)))) {
        filterForUser(parseInt(ppid));
    }


    var ud_url = '#' + ppid;
    var all_info = JSON.parse(Get(ud_url));

    ikoncolor(all_info.age, "totalCargo", "divtotalCargo", 30, 60);
    ikoncolor(all_info.fever_days, "totalTime", "divtotalTime", 5, 10);
    ikoncolor(all_info.is_sick, "totalRoad", "divtotalRoad", 0.5, 0.6);
    ikoncolor(all_info.last_fever_date, "precisionRange", "divprecisionRange", 3, 1);
    ikoncolor(all_info.last_temp, "successRate", "divsuccessRate", 37, 38.5);
    ikoncolor(all_info.movement, "deliveryType", "divdeliveryType", 150, 180);

    document.getElementById('personLastDataDate').innerHTML = 'Son veri: ' + all_info.last_date;

    var gi_url = '#' + ppid;
    var gen_info = JSON.parse(Get(gi_url));

    var user_url = '#' + ppid;
    var user_info = JSON.parse(Get(user_url));
    var lng = user_info[user_info.length - 1].Longitude;
    var lat = user_info[user_info.length - 1].Latitude;
    var xlabels = gen_info.labels

    if (typeof userno === 'undefined') {
        map.flyTo({
            center: [lng, lat],
            zoom: 17,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
        });
    }
    ;
    try {
        circlePeople(ppid);
    } catch (e) {
        console.log('error in circle people');
    }

    /*let lineChart1 = document.getElementById("predChart").getContext("2d");
    let predchart = new Chart(lineChart1, {

          type: 'line', // bar, horizontalBar, pie, line, doughnut, radar, polarArea

          data: {
              labels: gen_info.past[0].concat(gen_info.pred[0]),
              datasets: [{
                  // labels: gen_info.past[0],
                  label: 'Geçmiş',
                  data: gen_info.new1,
                  fill: false,
                  backgroundColor: 'rgba(236,104,51,1)',
                  borderColor: 'rgba(236,104,51,1)'
              }, {
                  // labels: gen_info.pred[0],
                  label: 'Tahmin',
                  fill: false,
                  data: gen_info.new2,
                  backgroundColor: 'rgba(0,106,73,1)',
                  borderColor: 'rgba(0,106,73,0.4)'
              }]
          },
          options: {
              responsive: true,
              title: {
                  display: true,
                  text: 'User ' + ppid + ' Grafiği'
              },

              scales: {
                  xAxes: [{
                      ticks: {
                          userCallback: function (item, index) {
                              if (index % 2) return "";
                              return xlabels[index];
                          },
                          autoSkip: false
                      },
                      display: true,
                      scaleLabel: {
                          display: true,
                          labelString: 'Zaman'


                      }
                  }],
                  yAxes: [{
                      display: true,

                      scaleLabel: {
                          display: true,
                          labelString: 'Derece (°C)'
                      }
                  }]
              }
          }
      });*/



    var predTrace1 = {
        line: {shape: 'spline'},
        x: gen_info.past[0],
        y: gen_info.past[1],
        type: 'scatter',
        name: "Geçmiş"
    };

    var predTrace2 = {
        line: {shape: 'spline'},
        x: gen_info.pred[0],
        y: gen_info.pred[1],
        type: 'scatter',
        name: "Tahmin"
    };
    var predLayout = {
        showlegend: true,
        legend: {"orientation": "h", x: 0, y: 1.3},
        plot_bgcolor: "rgba(0,0,0,0)",
        paper_bgcolor: "rgba(0,0,0,0)",
        yaxis: {range: [33, 41]},
        margin: {
            l: 25,
            r: 10,
            b: 40,
            t: 0,
            pad: 0
        }
    };

    var predData = [predTrace1, predTrace2];

    Plotly.newPlot('predDivPl', predData, predLayout, {displayModeBar: false});
//buraya if kutu açıksa gelecek
    Plotly.newPlot('predDivPlBig', predData, predLayout);

    var area_url = '#' + ppid;
    var area_info = JSON.parse(Get(area_url));
    radarData = [{
    type: 'scatterpolar',
    r: area_info.radarR,
    theta: area_info.radarTheta,
    fill: 'toself'
  }];

    radarLayout = {
        showlegend: false,
        plot_bgcolor: "rgba(0,0,0,0)",
        paper_bgcolor: "rgba(0,0,0,0)"
    };

    Plotly.newPlot("radarDiv", radarData, radarLayout);

    /*var pcnt = 0

    var interval = setInterval(function () {

        var gen_info = JSON.parse(Get(gi_url));

        var x1 = gen_info.past[0]
        var y1 = gen_info.past[1]

        var x2 = gen_info.pred[0]
        var y2 = gen_info.pred[1]

        var updateData = {
            x: [x1,x2],
            y: [y1,y2]
        }
        // var olderTime = time.setMinutes(time.getMinutes() - 1);
        // var futureTime = time.setMinutes(time.getMinutes() + 1);

        //var minuteView = {
          //    xaxis: {
            //    type: 'date',
              //  range: [olderTime,futureTime]
              //}
            //};

        // Plotly.relayout('myDiv', minuteView);
        Plotly.update('predDivPl', updateData,null,[0,1])

        if (++pcnt === 100) clearInterval(interval);
    }, 1000);*/

}

var healthyHistTrace = {
    x: [0, 12, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 37,
        39, 40, 46, 48, 62],
    y: [1, 0, 1, 0, 0, 2, 2, 2, 3, 0, 2, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1],
    type: "histogram",
    histfunc: "sum",
    opacity: 0.5,
    marker: {
        'color': "rgb(119, 221, 119)"
    },
};

var healthyHistData = [healthyHistTrace];
var healthyHistLayout = {
    title: 'Sağlıklı İnsanların Yaş Dağılımı',
    barmode: "overlay"
};


Plotly.newPlot('healthyHistDivPl', healthyHistData, healthyHistLayout, {displayModeBar: false});


var sickHistTrace = {
    x: [0, 12, 19, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 37,
        39, 40, 46, 48, 62],
    y: [1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0],
    type: "histogram",
    histfunc: "sum",
    opacity: 0.5,
    marker: {
        'color': "rgb(255, 53, 97)"
    },
};

var sickHistData = [sickHistTrace];
var sickHistLayout = {
    title: 'Hasta İnsanların Yaş Dağılımı',
    barmode: "overlay"
};


Plotly.newPlot('sickHistDivPl', sickHistData, sickHistLayout, {displayModeBar: false});
