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
        first_blood[i] = 1 << 30;
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
    var pass_time = [0, contest.time ? contest.time : 300];

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
    pass_time = pass_time.sort(function (a , b) {
        return a - b;
    });
    for (var k = 0 ; k < pass_time.length ; ++ k) {
        if (k > 0 && pass_time[k] === pass_time[k - 1]) {
            continue;
        }
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
    console.log(key);
    parse(data[key]);
});

function selectTraining(key) {
    let data = training["2017"];
    parse(data[key]);
}

function parse(contest) {
    parse_board(contest);
    google.charts.setOnLoadCallback(drawChart.bind(this, contest));
}
