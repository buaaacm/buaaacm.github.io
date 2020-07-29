let scores = [];

function getEChartOption(year) {
    let option = {
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
            data: trainingRanklist[year].map(x => x[0]),
        },
        yAxis: {
            name: 'Rank',
            nameLocation: 'middle',
            nameGap: 25,
            type: 'value',
            inverse: true,
        },
    };
    const nameData = teams[year].map((name) => name.slice(0, 9) + (name.length > 9 ? '...' : ''));
    option.legend = {
        orient: 'vertical',
        right: 30,
        top: 30,
        bottom: 30,
        data: nameData,
    };
    option.series = [];
    for (let name of nameData) {
        let status = {
            name: name,
            type: 'line',
            data: [],
        };
        option.series.push(status);
    }
    let ranklist = trainingRanklist[year];
    let points = [];
    scores = [];
    for (let teamId = 0; teamId < teams[year].length; ++teamId) {
        let l = [], point = [];
        let count = 0, last = 0;
        for (let training of ranklist) {
            let rank = training.indexOf(teamId + 1);
            l.push(score[rank]);
            l = l.sort(function (a, b) {
                return a - b;
            });
            count++;
            let less = Math.min(Math.floor(count / 4), 3);
            let sum = 0;
            for (let i = less; i < l.length; ++i) {
                sum += l[i];
            }
            point.push(sum);
            last = sum;
        }
        scores.push(last);
        points.push(point);
    }

    for (let i = 0; i < ranklist.length; ++i) {
        for (let j = 0; j < teams[year].length; ++j) {
            let rank = 1;
            for (let k = 0; k < teams[year].length; ++k) {
                if (points[k][i] > points[j][i]) {
                    ++rank;
                }
            }
            option.series[j].data.push(rank);
        }

    }
    return option;
}

function getRanklistOption(year) {
    const teamScores = teams[year].reduce((list, teamName, index) => {
        return [...list, [teamName, scores[index]]]
    }, []);
    const sortedTeamScores = teamScores.slice().sort(([_name1, score1], [_name2, score2]) => score2 - score1);
    const nameData = sortedTeamScores.map(([name]) => name.slice(0, 6) + (name.length > 6 ? '...' : ''));
    const scoreData = sortedTeamScores.map(([_, score]) => score);
    option = {
        tooltip: {
            trigger: 'item',
        },
        toolbox: {
            show: false,
        },
        yAxis: [{
            inverse: true,
            type: 'category',
            data: nameData,
        }],
        xAxis: [{
            type: 'value',
        }],
        series: [{
            type: 'bar',
            itemStyle: {
                normal: {
                    color: function (params) {
                        let colorList = [
                            '#c23531', '#2f4554', '#61a0a8', '#d48265',
                            '#91c7ae', '#749f83', '#ca8622', '#bda29a',
                            '#6e7074', '#546570', '#c4ccd3'
                        ];
                        return colorList[params.dataIndex % colorList.length];
                    },
                    label: {
                        show: true,
                    }
                }
            },
            data: scoreData,
        }]
    };
    return option;
}

function getTrainingOption(year) {
    let option = {
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
            data: trainingRanklist[year].map(x => x[0]),
        },
        yAxis: {
            name: 'Rank',
            nameLocation: 'middle',
            nameGap: 25,
            type: 'value',
            inverse: true,
        },
    };
    const nameData = teams[year].map((name) => name.slice(0, 9) + (name.length > 9 ? '...' : ''));
    option.legend = {
        orient: 'vertical',
        right: 30,
        top: 30,
        bottom: 30,
        data: nameData,
    };
    option.series = [];
    for (let name of nameData) {
        let status = {
            name: name,
            type: 'line',
            data: [],
        };
        option.series.push(status);
    }
    let ranklist = trainingRanklist[year];
    for (let teamId = 0; teamId < teams[year].length; ++teamId) {
        for (let training of ranklist) {
            let rank = training.indexOf(teamId + 1);
            option.series[teamId].data.push(rank);
        }
    }
    return option;
}

function getCodeforcesRatingOption(year) {
    const handles = teams[year].map((team) => cf_handles[team].join(';')).join(';')
    let userInfo;
    $.ajax({
        dataType: 'json',
        url: 'http://codeforces.com/api/user.info?handles=' + handles,
        type: 'GET',
        async: false,
        success: function(data){
            userInfo = data['result'];
        }
    });
    const userRating = new Map(userInfo.map((user) => [user['handle'], user['rating']]));
    let teamScores = [];
    for (let team of teams[year]){
        let totalCFRating = 0;
        for (let handle of cf_handles[team]){
            totalCFRating += userRating.get(handle) || 0;
        }
        teamScores.push([team, Math.floor(totalCFRating / 3.0)]);
    }
    const sortedTeamScores = teamScores.slice().sort(([_name1, score1], [_name2, score2]) => score2 - score1);
    const nameData = sortedTeamScores.map(([name]) => name.slice(0, 6) + (name.length > 6 ? '...' : ''));
    const scoreData = sortedTeamScores.map(([_, score]) => score);
    option = {
        tooltip: {
            trigger: 'item',
        },
        toolbox: {
            show: false,
        },
        yAxis: [{
            inverse: true,
            type: 'category',
            data: nameData,
        }],
        xAxis: [{
            type: 'value',
        }],
        series: [{
            type: 'bar',
            itemStyle: {
                normal: {
                    color: function (params) {
                        let colorList = [
                            '#c23531', '#2f4554', '#61a0a8', '#d48265',
                            '#91c7ae', '#749f83', '#ca8622', '#bda29a',
                            '#6e7074', '#546570', '#c4ccd3'
                        ];
                        return colorList[params.dataIndex % colorList.length];
                    },
                    label: {
                        show: true,
                    }
                }
            },
            data: scoreData,
        }]
    };
    return option;
}

$(document).ready(function () {
    const year = '2020';
    $('#ratings').empty()
    let args = window.location.href.split('?')[1];
    argmap = {};
    args.split('#').forEach((test) => {
        argmap[test.split('=')[0]] = test.split('=')[1];
    });
    argmap.type = argmap.type || 'training';
    if (argmap.type === 'training'){
        $('#ratings').append(`<h2>积分榜</h2>
        <div id="rating" style="height: 480px;"></div>`);
        $('#ratings').append(`<h2>积分排名</h2>
        <div id="chart" style="height: 480px;"></div>`);
        $('#ratings').append(`<h2>训练排名</h2>
        <div id="training" style="height: 480px;"></div>`);

        let myChart = echarts.init(document.getElementById('chart'));
        myChart.setOption(getEChartOption(year));
        let myRank = echarts.init(document.getElementById('rating'));
        myRank.setOption(getRanklistOption(year));
        let myTraining = echarts.init(document.getElementById('training'));
        myTraining.setOption(getTrainingOption(year));
    }
    else if (argmap.type === 'codeforces'){
        $('#ratings').append(`<h2>Codeforces Rating Ranklist</h2>
        <div id="cf_rating" style="height: 480px;"></div>`);
        let cfRating = echarts.init(document.getElementById('cf_rating'));
        cfRating.setOption(getCodeforcesRatingOption(year));
    }
});
