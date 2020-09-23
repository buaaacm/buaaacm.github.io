let scores = [];

function getLineEChart(year){
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
    return option;
}

function getBarEChart(nameData, scoreData){
    let option = {
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

function getSortedScoreAndPrettifiedName(teamScores, maxLength){
    const sortedTeamScores = teamScores.slice().sort(([_name1, score1], [_name2, score2]) => score2 - score1);
    const nameData = sortedTeamScores.map(([name]) => name.slice(0, maxLength) + (name.length > maxLength ? '...' : ''));
    const scoreData = sortedTeamScores.map(([_, score]) => score);
    return [nameData, scoreData];
}

function getEChartOption(year) {
    let option = getLineEChart(year);
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
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(teamScores, 6);
    return getBarEChart(nameData, scoreData);
}

function getTrainingOption(year) {
    let option = getLineEChart(year)
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

function getTotalRating(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/rating/',
        data: {
            'team': teams[year],
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getCodeforcesRatingOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/codeforces/rating/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getCodeforcesProblemOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/codeforces/problem/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getCodeforcesProblemRatingOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/codeforces/problem/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
            'count_rating': true,
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getAtCoderRatingOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/atcoder/rating/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getAtCoderProblemOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/atcoder/problem/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getAtCoderProblemRatingOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/atcoder/problem/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
            'count_points': true,
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getTopCoderRatingOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/topcoder/rating/',
        data: {
            'team': teams[year],
            'begin_time': '2020-07-10T00:00:00+08:00',
            'end_time': '2020-09-04T00:00:00+08:00',
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

function getTopCoderProblemRatingOption(year) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'http://api.buaaacm.com:8008/statistic/topcoder/problem/',
        data: {
            'team': teams[year],
        },
        type: 'GET',
        async: false,
        success: function(data){
            teamScores = data;
        }
    });
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(Object.entries(teamScores), 6);
    return getBarEChart(nameData, scoreData);
}

$(document).ready(function () {
    const year = '2020';
    $('#ratings').empty()
    let args = window.location.href.split('?')[1];
    argmap = {};
    args.split('#').forEach((test) => {
        argmap[test.split('=')[0]] = test.split('=')[1];
    });
    argmap.type = argmap.type || 'total';
    if (argmap.type === 'total'){
        $('#ratings').append(`<h2>总积分榜</h2>
        <div id="total_rating" style="height: 480px;"></div>`);
        let totalRating = echarts.init(document.getElementById('total_rating'));
        totalRating.setOption(getTotalRating(year));
    }
    else if (argmap.type === 'training'){
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

        $('#ratings').append(`<h2>Codeforces Solved Problem Ranklist (Weighted by problem rating)</h2>
        <div id="cf_problem_rating" style="height: 480px;"></div>`);
        let cfProblemRatingCount = echarts.init(document.getElementById('cf_problem_rating'));
        cfProblemRatingCount.setOption(getCodeforcesProblemRatingOption(year));

        $('#ratings').append(`<h2>Codeforces Solved Problem Ranklist</h2>
        <div id="cf_problem" style="height: 480px;"></div>`);
        let cfProblemCount = echarts.init(document.getElementById('cf_problem'));
        cfProblemCount.setOption(getCodeforcesProblemOption(year));
    }
    else if (argmap.type === 'atcoder'){
        $('#ratings').append(`<h2>AtCoder Rating Ranklist</h2>
        <div id="atcoder_rating" style="height: 480px;"></div>`);
        let atcoderRating = echarts.init(document.getElementById('atcoder_rating'));
        atcoderRating.setOption(getAtCoderRatingOption(year));

        $('#ratings').append(`<h2>AtCoder Solved Problem Ranklist (Weighted by problem rating)</h2>
        <div id="atcoder_problem_rating" style="height: 480px;"></div>`);
        let atcoderProblemRatingCount = echarts.init(document.getElementById('atcoder_problem_rating'));
        atcoderProblemRatingCount.setOption(getAtCoderProblemRatingOption(year));

        $('#ratings').append(`<h2>AtCoder Solved Problem Ranklist</h2>
        <div id="atcoder_problem" style="height: 480px;"></div>`);
        let atcoderProblemCount = echarts.init(document.getElementById('atcoder_problem'));
        atcoderProblemCount.setOption(getAtCoderProblemOption(year));
    }
    else if (argmap.type === 'topcoder'){
        $('#ratings').append(`<h2>TopCoder Rating Ranklist</h2>
        <div id="topcoder_rating" style="height: 480px;"></div>`);
        let topcoderRating = echarts.init(document.getElementById('topcoder_rating'));
        topcoderRating.setOption(getTopCoderRatingOption(year));

        $('#ratings').append(`<h2>TopCoder Solved Problem Ranklist (Weighted by problem rating)</h2>
        <div id="topcoder_problem_rating" style="height: 480px;"></div>`);
        let topcoderProblemRatingCount = echarts.init(document.getElementById('topcoder_problem_rating'));
        topcoderProblemRatingCount.setOption(getTopCoderProblemRatingOption(year));
    }
});
