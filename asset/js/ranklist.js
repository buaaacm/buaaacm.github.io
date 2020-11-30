const score = [100000, 100, 75, 60, 45, 35, 25, 20, 15, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 0];

function getLineEChart(dates, teams){
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
            data: dates,
        },
        yAxis: {
            name: 'Rank',
            nameLocation: 'middle',
            nameGap: 25,
            type: 'value',
            inverse: true,
        },
    };
    const nameData = teams.map((name) => name.slice(0, 9) + (name.length > 9 ? '...' : ''));
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

function fetchBoard(url, param){
    let data;
    $.ajax({
        dataType: 'json',
        url: url,
        data: param,
        type: 'GET',
        async: false,
        success: function(result){
            data = result.map(item => JSON.parse(item.board));
        },
    });
    return data;
}

function parseTraining(url, param, teams, forbid){
    let boards = fetchBoard(url, param);
    dates = boards.map(board => board.date.substring(5));
    ranklists = boards.map(board => board.ranklist);

    let rankOption = getLineEChart(dates, teams)
    for (let teamId = 0; teamId < teams.length; ++teamId) {
        for (let training of ranklists) {
            let rank = training.indexOf(teams[teamId]);
            rank = rank === -1 ? teams.length : rank + 1;
            rankOption.series[teamId].data.push(rank);
        }
    }

    let scoreRankOption = getLineEChart(dates, teams);
    let points = [], scores = [];
    for (let teamId = 0; teamId < teams.length; ++teamId) {
        let l = [], point = [];
        let count = 0, last = 0;
        for (let training of ranklists) {
            let rank = training.indexOf(teams[teamId]);
            rank = rank === -1 ? teams.length : rank + 1;
            l.push(score[rank]);
            l = l.sort(function (a, b) {
                return a - b;
            });
            count++;
            let less;
            if (forbid === 0){
                less = 0;
            }
            else{
                let block = ranklists.length / forbid;
                less = Math.min(Math.floor(count / block), forbid);
            }
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

    for (let i = 0; i < ranklists.length; ++i) {
        for (let j = 0; j < teams.length; ++j) {
            let rank = 1;
            for (let k = 0; k < teams.length; ++k) {
                if (points[k][i] > points[j][i]) {
                    ++rank;
                }
            }
            scoreRankOption.series[j].data.push(rank);
        }
    }

    const teamScores = teams.map((teamName, index) => [teamName, scores[index]]);
    [nameData, scoreData] = getSortedScoreAndPrettifiedName(teamScores, 6);
    let scoreOption = getBarEChart(nameData, scoreData);

    return [rankOption, scoreRankOption, scoreOption];
}

function getTotalRating(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/rating/',
        data: {
            'team': teams,
            'year': year,
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

function getCodeforcesRatingOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/codeforces/rating/',
        data: {
            'team': teams,
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

function getCodeforcesProblemOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/codeforces/problem/',
        data: {
            'team': teams,
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

function getCodeforcesProblemRatingOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/codeforces/problem/',
        data: {
            'team': teams,
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

function getAtCoderRatingOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/atcoder/rating/',
        data: {
            'team': teams,
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

function getAtCoderProblemOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/atcoder/problem/',
        data: {
            'team': teams,
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

function getAtCoderProblemRatingOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/atcoder/problem/',
        data: {
            'team': teams,
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

function getTopCoderRatingOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/topcoder/rating/',
        data: {
            'team': teams,
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

function getTopCoderProblemRatingOption(year, teams) {
    let teamScores;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/statistic/topcoder/problem/',
        data: {
            'team': teams,
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

    let teams;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/team/get_team/',
        data: {
            'year': year,
        },
        type: 'GET',
        async: false,
        success: function(data){
            teams = data.map(team => team.name);
        }
    });
    if (argmap.type === 'total'){
        $('#ratings').append(`<h2>总积分榜</h2>
        <div id="total_rating" style="height: 480px;"></div>`);
        let totalRating = echarts.init(document.getElementById('total_rating'));
        totalRating.setOption(getTotalRating(year, teams));
    }
    else if (argmap.type === 'onsite'){
        $('#ratings').append(`<h2>积分榜</h2>
        <div id="rating" style="height: 480px;"></div>`);
        $('#ratings').append(`<h2>积分排名</h2>
        <div id="chart" style="height: 480px;"></div>`);
        $('#ratings').append(`<h2>训练排名</h2>
        <div id="training" style="height: 480px;"></div>`);

        let [rankOption, scoreRankOption, scoreOption] = parseTraining(
            'https://api.buaaacm.com/training/contest/get_contest/',
            {'year': year, 'type': 'onsite'}, teams, 0);
        let myRank = echarts.init(document.getElementById('rating'));
        myRank.setOption(scoreOption);
        let myChart = echarts.init(document.getElementById('chart'));
        myChart.setOption(scoreRankOption);
        let myTraining = echarts.init(document.getElementById('training'));
        myTraining.setOption(rankOption);
    }
    else if (argmap.type === 'online'){
        $('#ratings').append(`<h2>积分榜</h2>
        <div id="rating" style="height: 480px;"></div>`);
        $('#ratings').append(`<h2>积分排名</h2>
        <div id="chart" style="height: 480px;"></div>`);
        $('#ratings').append(`<h2>训练排名</h2>
        <div id="training" style="height: 480px;"></div>`);

        let [rankOption, scoreRankOption, scoreOption] = parseTraining(
            'https://api.buaaacm.com/training/contest/get_contest/',
            {'year': year, 'type': 'online'}, teams, 3);
        let myRank = echarts.init(document.getElementById('rating'));
        myRank.setOption(scoreOption);
        let myChart = echarts.init(document.getElementById('chart'));
        myChart.setOption(scoreRankOption);
        let myTraining = echarts.init(document.getElementById('training'));
        myTraining.setOption(rankOption);
    }
    else if (argmap.type === 'codeforces'){
        $('#ratings').append(`<h2>Codeforces Rating Ranklist</h2>
        <div id="cf_rating" style="height: 480px;"></div>`);
        let cfRating = echarts.init(document.getElementById('cf_rating'));
        cfRating.setOption(getCodeforcesRatingOption(year, teams));

        $('#ratings').append(`<h2>Codeforces Solved Problem Ranklist (Weighted by problem rating)</h2>
        <div id="cf_problem_rating" style="height: 480px;"></div>`);
        let cfProblemRatingCount = echarts.init(document.getElementById('cf_problem_rating'));
        cfProblemRatingCount.setOption(getCodeforcesProblemRatingOption(year, teams));

        $('#ratings').append(`<h2>Codeforces Solved Problem Ranklist</h2>
        <div id="cf_problem" style="height: 480px;"></div>`);
        let cfProblemCount = echarts.init(document.getElementById('cf_problem'));
        cfProblemCount.setOption(getCodeforcesProblemOption(year, teams));
    }
    else if (argmap.type === 'atcoder'){
        $('#ratings').append(`<h2>AtCoder Rating Ranklist</h2>
        <div id="atcoder_rating" style="height: 480px;"></div>`);
        let atcoderRating = echarts.init(document.getElementById('atcoder_rating'));
        atcoderRating.setOption(getAtCoderRatingOption(year, teams));

        $('#ratings').append(`<h2>AtCoder Solved Problem Ranklist (Weighted by problem rating)</h2>
        <div id="atcoder_problem_rating" style="height: 480px;"></div>`);
        let atcoderProblemRatingCount = echarts.init(document.getElementById('atcoder_problem_rating'));
        atcoderProblemRatingCount.setOption(getAtCoderProblemRatingOption(year, teams));

        $('#ratings').append(`<h2>AtCoder Solved Problem Ranklist</h2>
        <div id="atcoder_problem" style="height: 480px;"></div>`);
        let atcoderProblemCount = echarts.init(document.getElementById('atcoder_problem'));
        atcoderProblemCount.setOption(getAtCoderProblemOption(year, teams));
    }
    else if (argmap.type === 'topcoder'){
        $('#ratings').append(`<h2>TopCoder Rating Ranklist</h2>
        <div id="topcoder_rating" style="height: 480px;"></div>`);
        let topcoderRating = echarts.init(document.getElementById('topcoder_rating'));
        topcoderRating.setOption(getTopCoderRatingOption(year, teams));

        $('#ratings').append(`<h2>TopCoder Solved Problem Ranklist (Weighted by problem rating)</h2>
        <div id="topcoder_problem_rating" style="height: 480px;"></div>`);
        let topcoderProblemRatingCount = echarts.init(document.getElementById('topcoder_problem_rating'));
        topcoderProblemRatingCount.setOption(getTopCoderProblemRatingOption(year, teams));
    }
});
