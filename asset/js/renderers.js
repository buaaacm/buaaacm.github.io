google.charts.load('current', { packages: ['corechart', 'line'] });

function formatter(hour, minute) {
    let str = '';
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

function parse_detail(detail, first_blood, currentTime) {
    let html = '';
    let first_solve = false;
    if (detail[1] !== -1 && detail[1] <= currentTime) {
        let time = formatter(Math.floor(detail[1] / 60), detail[1] % 60);
        html += '<span class="accepted">';
        if (detail[1] === first_blood) {
            first_solve = true;
        }
        if (detail[2] === 0) {
            html += '+</span><br>' + time;
        } else {
            html += `+${detail[2]}</span><br>` + time;
        }
    } else if (detail[2] > 0 && currentTime == Number.MAX_VALUE) {
        html += `<span class="failed">${String(-detail[2])}</span>`;
    } else if (detail[1] !== -1 && detail[1] > currentTime ||
        detail[2] > 0 && currentTime != Number.MAX_VALUE) {
        html += '<span class="unknown">?</span>';
    }
    if (first_solve) {
        html = '<td style="background:lightgreen">' + html + '</td>';
    } else {
        html = '<td>' + html + '</td>'
    }
    return html;
}

function parse_board(contest, currentTime = Number.MAX_VALUE) {
    $('#title').text(contest.title);
    $('#date').text(contest.date);
    $('#board').empty();
    let problem_num = contest.num;
    let header = '<caption>Standings</caption><tbody><tr><th>#</th><th>Who</th><th>=</th><th>Penalty</th>';
    for (let i = 0; i < problem_num; ++i) {
        header += `<th>${String.fromCharCode('A'.charCodeAt(0) + i)}</th>`;
    }
    header += '<th>Dirt</th></tr>';
    $('#board').append(header);

    let ranklist = contest.ranklist;

    let first_blood = new Array(problem_num);
    for (let i = 0; i < problem_num; ++i) {
        first_blood[i] = Number.MAX_VALUE;
    }
    for (let i = 0; i < ranklist.length; ++i) {
        let team = ranklist[i];
        let status = contest.statuses[team];
        for (let j = 0; j < problem_num; ++j) {
            if (status[j][1] !== -1) {
                first_blood[j] = Math.min(first_blood[j], status[j][1]);
            }
        }
    }

    let scores = [];
    for (let i = 0; i < ranklist.length; ++i) {
        let team = ranklist[i];
        let status = contest.statuses[team];

        let solved = 0, penalty = 0, last = 0;
        for (let j = 0; j < problem_num; ++j) {
            if (status[j][1] !== -1 && status[j][1] <= currentTime) {
                solved++;
                penalty += status[j][1] + status[j][2] * 20;
                last = Math.max(last, status[j][1]);
            }
        }
        scores.push([-solved, penalty, last, i]);
    }
    scores = scores.sort((a, b) => {
        for (let i = 0; i < 3; ++i) {
            if (a[i] != b[i]) {
                return a[i] - b[i];
            }
        }
        return 0;
    });

    let rank = 0;
    for (let k = 0; k < ranklist.length; ++k) {
        let i = scores[k][3];
        let team = ranklist[i];
        let status = contest.statuses[team];
        let star = false;
        if (team.startsWith('*')) {
            star = true;
            team = team.substring(1);
        } else {
            rank++;
        }
        let row = `<tr><td>${star ? "*" : rank}</td><td>${team}</td>`;

        let solved = 0, penalty = 0;
        let wrong_tries = 0, total_tries = 0;
        for (let j = 0; j < problem_num; ++j) {
            if (status[j][1] !== -1 && status[j][1] <= currentTime) {
                solved++;
                penalty += status[j][1] + status[j][2] * 20;
                total_tries += 1 + status[j][2];
                wrong_tries += status[j][2];
            }
        }
        row += `<td>${solved}</td>`;
        row += `<td>${penalty}</td>`;
        for (let j = 0; j < problem_num; ++j) {
            row += parse_detail(status[j], first_blood[j], currentTime);
        }
        let dirt_rate = total_tries > 0 ? Math.round(wrong_tries * 100 / total_tries) : 0;
        row += `<td><span><b>${dirt_rate}%</b></span><br>${wrong_tries}/${total_tries}</td>`;
        row += '</tr>';
        $('#board').append(row);
    }
}

function drawChart(contest) {
    let ranklist = contest.ranklist;
    let problem_num = contest.num;
    let chart_data = new google.visualization.DataTable();
    let pass_time = [0, contest.time || 300];

    chart_data.addColumn('number', 'X');
    for (let i = 0; i < ranklist.length; ++i) {
        chart_data.addColumn('number', ranklist[i]);
        chart_data.addColumn({ type: 'string', role: 'annotation' });
        for (let j = 0; j < problem_num; ++j) {
            let t = contest.statuses[ranklist[i]][j][1];
            if (t >= 0) {
                pass_time.push(t);
            }
        }
    }
    pass_time = Array.from(new Set(pass_time)).sort(function (a, b) {
        return a - b;
    });
    for (let k = 0; k < pass_time.length; ++k) {
        let row = [pass_time[k]];
        let scores = [];
        for (let i = 0; i < ranklist.length; ++i) {
            let team = ranklist[i], solved = 0, penalty = 0;
            for (let j = 0; j < problem_num; ++j) {
                let t = contest.statuses[team][j][1];
                if (t >= 0 && t <= pass_time[k]) {
                    ++solved;
                    penalty += contest.statuses[team][j][1] + contest.statuses[team][j][2] * 20;
                }
            }
            scores.push([solved, penalty]);
        }

        for (let i = 0; i < ranklist.length; ++i) {
            let team = ranklist[i], rank = 1;
            for (let j = 0; j < ranklist.length; ++j) {
                if (scores[j][0] > scores[i][0]) {
                    ++rank;
                } else if (scores[j][0] === scores[i][0] && scores[j][1] < scores[i][1]) {
                    ++rank;
                }
            }
            row.push(-rank);

            let solved = '';
            for (let j = 0; j < problem_num; ++j) {
                let t = contest.statuses[team][j][1];
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

    let options = {
        hAxis: {
            title: 'Time',
        },
        vAxis: {
            title: 'Rank',
        },
        //width: 1140,//Math.max(800, window.innerWidth * 0.85),
        height: 720,
    };

    let chart = new google.visualization.LineChart(document.getElementById('chart'));
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
        xAxis: {
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
                    formatter: function (m) {
                        let time = m.value;
                        let str = formatter(Math.floor(time / 60), time % 60) + '\n';
                        for (let i = 0; i < ranklist.length; ++i) {
                            let team = ranklist[i];
                            for (let j = 0; j < problem_num; ++j) {
                                let t = contest.statuses[team][j][1];
                                if (t == time) {
                                    str += team + ' passed ' + String.fromCharCode('A'.charCodeAt(0) + j) + '; ';
                                }
                            }
                        }
                        return str;
                    },
                }
            }
        },
        yAxis: {
            name: 'Rank',
            nameLocation: 'middle',
            nameGap: 20,
            type: 'value',
            inverse: true,
            min: 0,
            max: contest.ranklist.length + 1,
        },
    };
    let ranklist = contest.ranklist;
    let problem_num = contest.num;
    if (!contest.time) {
        contest.time = 300;
    }
    let pass_time = [0, contest.time];

    if (contest.time >= 150) {
        pass_time.push(contest.time - 60);
    }

    option.legend = {
        orient: 'vertical',
        right: -160,
        top: 60,
        bottom: 60,
        data: [],
    };
    for (let i = 0; i < ranklist.length; ++i) {
        option.legend.data.push(ranklist[i]);
        for (let j = 0; j < problem_num; ++j) {
            let t = contest.statuses[ranklist[i]][j][1];
            if (t >= 0) {
                pass_time.push(t);
            }
        }
    }
    pass_time = Array.from(new Set(pass_time)).sort(function (a, b) {
        return a - b;
    });

    option.series = [];
    let points = [];
    for (let i = 0; i < ranklist.length; ++i) {
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

    for (let k = 0; k < pass_time.length; ++k) {
        let T = pass_time[k];
        let scores = [];
        for (let i = 0; i < ranklist.length; ++i) {
            let team = ranklist[i], solved = 0, penalty = 0, last = -1;
            for (let j = 0; j < problem_num; ++j) {
                let t = contest.statuses[team][j][1];
                if (0 <= t && t <= T) {
                    ++solved;
                    last = Math.max(last, t);
                    penalty += t + contest.statuses[team][j][2] * 20;
                }
            }
            scores.push([solved, penalty, last]);
        }

        for (let i = 0; i < ranklist.length; ++i) {
            let team = ranklist[i], rank = 1;
            for (let j = 0; j < ranklist.length; ++j) {
                if (scores[j][0] > scores[i][0]) {
                    ++rank;
                } else if (scores[j][0] === scores[i][0] && scores[j][1] < scores[i][1]) {
                    ++rank;
                } else if (scores[j][0] === scores[i][0] && scores[j][1] == scores[i][1] && scores[j][2] < scores[i][2]) {
                    ++rank;
                }
            }
            let pass = false;
            for (let j = 0; j < problem_num; ++j) {
                let t = contest.statuses[team][j][1];
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
    for (let i = 0; i < ranklist.length; ++i) {
        for (let k = 0; k < points[i].length; ++k) {
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

function parse(contest) {
    parse_board(contest);
    //google.charts.setOnLoadCallback(drawChart.bind(this, contest));
    let myChart = echarts.init(document.getElementById('chart'));
    myChart.clear();
    myChart.setOption(getEChartOption(contest));
    myChart.on('click', function (params) {
        if (params.componentType == "markPoint") {
            parse_board(contest, params.data.coord[0]);
        }
        if (params.componentType == "markArea") {
            parse_board(contest);
        }
    });
}

function selectTraining(year, key) {
    let data = training[year];
    parse(data[key]);
}

$(document).ready(function () {
    let args = window.location.href.split('?')[1];
    argmap = {};
    args.split('#').forEach((test) => {
        argmap[test.split('=')[0]] = test.split('=')[1];
    });
    argmap.year = argmap.year || '2020';

    $('#contest_list').empty();
    let data = training[argmap.year];

    contest_list = [];
    for (let p in data) {
        contest_list.push(p);
    }
    for (let p of contest_list.sort()) {
        let link = `<a class="list-group-item" data-toggle="tooltip" data-placement="right" title=
                    "${data[p].title}" onclick="selectTraining(\'${argmap.year}\', '${p}')" 
                    href=#id=${p}>${data[p].date.substring(5)}</a>`;
        $('#contest_list').append(link);
    }
    $('[data-toggle="tooltip"]').tooltip();

    let key = argmap.id || '01';
    parse(data[key]);
});

