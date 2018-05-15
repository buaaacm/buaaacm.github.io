google.charts.load('current', {packages: ['corechart', 'line']});

function formatter(hour, minute) {
    var str = '';
    if (hour < 10) {
        str += '0';
    }
    str += String(hour);
    str += ':';
    if (minute < 10) {
        str += '0';
    }
    str += String(minute);
    return str;
}

function parse_detail(detail, first_blood) {
    var html = '';
    var first_solve = false;
    if (detail[1] !== -1) {
        var time = formatter(Math.floor(detail[1] / 60), detail[1] % 60);
        html += '<span class="accepted">';
        if (detail[1] === first_blood) {
            first_solve = true;
        }
        if (detail[2] === 0) {
            html += '+</span><br>' + time;
        } else {
            html += '+' + String(detail[2]) + '</span><br>' + time;
        }
    } else if (detail[2] > 0) {
        html += '<span class="failed">';
        html += String(-detail[2]) + '</span>';
    }
    if (first_solve) {
        html = '<td style="background:lightgreen">' + html + '</td>';
    } else {
        html = '<td>' + html + '</td>'
    }
    return html;
}

function parse_board(contest) {
    $('#title').text(contest.title);
    $('#date').text(contest.date);
    $('#board').empty();
    var problem_num = contest.num;
    var header = '<caption>Standings</caption><tbody><tr><th>#</th><th>Who</th><th>=</th><th>Penalty</th>';
    for (var i = 0 ; i < problem_num ; ++ i) {
        header += '<th>';
        header += String.fromCharCode('A'.charCodeAt(0) + i);
        header += '</th>';
    }
    header += '</tr>';
    $('#board').append(header);

    var ranklist = contest.ranklist;

    var first_blood = new Array(problem_num);
    for (var i = 0 ; i < problem_num ; ++ i) {
        first_blood[i] = Number.MAX_VALUE;
    }
    for (var i = 0 ; i < ranklist.length ; ++ i) {
        var team = ranklist[i];
        var status = contest.statuses[team];
        for (var j = 0 ; j < problem_num ; ++ j) {
            if (status[j][1] !== -1) {
                first_blood[j] = Math.min(first_blood[j], status[j][1]);
            }
        }
    }

    for (var i = 0 ; i < ranklist.length ; ++ i) {
        var team = ranklist[i];
        var status = contest.statuses[team];
        var row = '<tr><td>' + String(i + 1) + '</td><td>' + team + '</td>';

        var solved = 0, penalty = 0;
        for (var j = 0 ; j < problem_num ; ++ j) {
            if (status[j][1] !== -1) {
                solved ++;
                penalty += status[j][1] + status[j][2] * 20;
            }
        }
        row += '<td>' + String(solved) + '</td>';
        row += '<td>' + String(penalty) + '</td>';
        for (var j = 0 ; j < problem_num ; ++ j) {
            row += parse_detail(status[j] , first_blood[j]);
        }
        row += '</tr>';
        $('#board').append(row);
    }
}

function drawChart(contest) {
    var ranklist = contest.ranklist;
    var problem_num = contest.num;
    var chart_data = new google.visualization.DataTable();
    var pass_time = [0, contest.time || 300];

    chart_data.addColumn('number', 'X');
    for (var i = 0 ; i < ranklist.length ; ++ i) {
        chart_data.addColumn('number',  ranklist[i]);
        chart_data.addColumn({type:'string', role:'annotation'});
        for (var j = 0 ; j < problem_num ; ++ j) {
            var t = contest.statuses[ranklist[i]][j][1];
            if (t >= 0) {
                pass_time.push(t);
            }
        }
    }
    pass_time = Array.from(new Set(pass_time)).sort(function(a, b) {
        return a - b;
    });
    for (var k = 0 ; k < pass_time.length ; ++ k) {
        var row = [pass_time[k]];
        var scores = [];
        for (var i = 0 ; i < ranklist.length ; ++ i) {
            var team = ranklist[i], solved = 0, penalty = 0;
            for (var j = 0 ; j < problem_num ; ++ j) {
                var t = contest.statuses[team][j][1];
                if (t >= 0 && t <= pass_time[k]) {
                    ++ solved;
                    penalty += contest.statuses[team][j][1] + contest.statuses[team][j][2] * 20;
                }
            }
            scores.push([solved, penalty]);
        }

        for (var i = 0 ; i < ranklist.length ; ++ i) {
            var team = ranklist[i], rank = 1;
            for (var j = 0 ; j < ranklist.length ; ++ j) {
                if (scores[j][0] > scores[i][0]) {
                    ++ rank;
                } else if (scores[j][0] === scores[i][0] && scores[j][1] < scores[i][1]) {
                    ++ rank;
                }
            }
            row.push(-rank);

            var solved = '';
            for (var j = 0 ; j < problem_num ; ++ j) {
                var t = contest.statuses[team][j][1];
                if (t === pass_time[k]) {
                    solved += String.fromCharCode('A'.charCodeAt(0) + j);
                }
            }
            if (solved.length > 0) {
                row.push(solved);
            } else {
                row.push(null);
            }
        }
        chart_data.addRow(row);
    }

    var options = {
        hAxis: {
            title: 'Time',
        },
        vAxis: {
            title: 'Rank',
        },
        //width: 1140,//Math.max(800, window.innerWidth * 0.85),
        height: 720,
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart'));
    chart.draw(chart_data, options);
}

function getEChartOption(contest) {
    let option = {
        height: 480,
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                restore: {},
            }
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            right: '15%',
        },
        xAxis:  {
            name: 'Time',
            nameLocation: 'middle',
            type: 'value',
            minInterval: 1,
            interval: 60,
            min: 0,
            max: contest.time || 300,
            axisPointer: {
                label: {
                    precision: 0,
                    formatter: function(m) {
                        return Math.floor(m.value / 60) + ' h ' + (m.value % 60) + ' m';
                    },
                }
            }
        },
        yAxis: {
            name: 'Rank',
            nameLocation: 'middle',
            type: 'value',
            inverse: true,
            min: 0,
            max: 15,
        },
    };
    var ranklist = contest.ranklist;
    var problem_num = contest.num;
    if (!contest.time) {
        contest.time = 300;
    }
    var pass_time = [0, contest.time];

    if (contest.time > 120) {
        pass_time.push(contest.time - 60);
    }

    option.legend = {
        orient: 'vertical',
        right: 10,
        top: 60,
        bottom: 60,
        data: [],
    };
    for (var i = 0 ; i < ranklist.length ; ++ i) {
        option.legend.data.push(ranklist[i]);
        for (var j = 0 ; j < problem_num ; ++ j) {
            var t = contest.statuses[ranklist[i]][j][1];
            if (t >= 0) {
                pass_time.push(t);
            }
        }
    }
    pass_time = Array.from(new Set(pass_time)).sort(function(a, b) {
        return a - b;
    });

    option.series = [];
    let points = [];
    for (var i = 0 ; i < ranklist.length ; ++ i) {
        let status = {};
        status.name = ranklist[i];
        status.type = 'line';
        status.data = [];
        status.markPoint = {
            symbol: 'pin',
            symbolSize: 25,
            data: [],
        };
        option.series.push(status);
        points.push([]);
    }
    option.series.push({
        type: 'line',
        markArea: {
            itemStyle: {
               color: 'rgba(237, 237, 237, 0.6)',
            },
            data: [[{
                    name: 'Last hour',
                    xAxis: contest.time - 60
                }, {
                    xAxis: contest.time
                }]],
        }
    });

    for (var k = 0 ; k < pass_time.length ; ++ k) {
        var T = pass_time[k];
        var scores = [];
        for (var i = 0 ; i < ranklist.length ; ++ i) {
            var team = ranklist[i], solved = 0, penalty = 0;
            for (var j = 0 ; j < problem_num ; ++ j) {
                var t = contest.statuses[team][j][1];
                if (0 <= t && t <= T) {
                    ++ solved;
                    penalty += contest.statuses[team][j][1] + contest.statuses[team][j][2] * 20;
                }
            }
            scores.push([solved, penalty]);
        }

        for (var i = 0 ; i < ranklist.length ; ++ i) {
            var team = ranklist[i], rank = 1;
            for (var j = 0 ; j < ranklist.length ; ++ j) {
                if (scores[j][0] > scores[i][0]) {
                    ++ rank;
                } else if (scores[j][0] === scores[i][0] && scores[j][1] < scores[i][1]) {
                    ++ rank;
                }
            }
            let pass = false;
            for (var j = 0 ; j < problem_num ; ++ j) {
                var t = contest.statuses[team][j][1];
                if (t === pass_time[k]) {
                    option.series[i].markPoint.data.push({
                        name: String.fromCharCode('A'.charCodeAt(0) + j) + ' passed',
                        value: String.fromCharCode('A'.charCodeAt(0) + j),
                        coord: [T, rank],
                    });
                    pass = true;
                }
            }
            points[i].push([T, rank, pass]);
        }
    }
    for (var i = 0 ; i < ranklist.length ; ++ i) {
        for (var k = 1 ; k + 1 < points[i].length ; ++ k) {
            if (!points[i][k][2] && points[i][k][1] == points[i][k - 1][1] &&
                                    points[i][k][1] == points[i][k + 1][1]) {
                //points[i][k][0] = -1;
            }
        }
        for (var k = 0 ; k < points[i].length ; ++ k) {
            if (points[i][k][0] >= 0) {
                option.series[i].data.push({
                    symbol: 'none',
                    value: [points[i][k][0], points[i][k][1]],
                });
            }
        }
    }
    return option;
}

function selectTraining(key) {
    let data = training["2017"];
    parse(data[key]);
}

function parse(contest) {
    parse_board(contest);
    //google.charts.setOnLoadCallback(drawChart.bind(this, contest));
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.clear();
    myChart.setOption(getEChartOption(contest));
}


$(document).ready(function () {
    $('#contest_list').empty();
    let data = training["2017"];
    contest_list = [];
    for (var p in data) {
        contest_list.push(p);
    }
    for (var p of contest_list.sort()) {
        var link = '<a class="list-group-item" data-toggle="tooltip" data-placement="right" title="' + 
                   data[p].title + '" onclick="selectTraining(' + "'" + p + "'" + ')" href=#' + p + '>' + 
                   data[p].date.substring(5) + '</a>';
        $('#contest_list').append(link);
    }
    $('[data-toggle="tooltip"]').tooltip();
    
    var arg_list = window.location.href.split('#');
    var key = arg_list.length < 2 ? '01' : arg_list[1];
    parse(data[key]);
});

