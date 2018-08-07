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
            type: 'value',
            inverse: true,
        },
    };
    option.legend = {
        orient: 'vertical',
        right: 10,
        top: 60,
        bottom: 60,
        data: teams[year],
    };
    option.series = [];
    for (let name of teams[year]) {
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
            l = l.sort(function(a, b) {
                return a - b;
            });
            count++;
            let less = Math.min(Math.floor(count / 5), 2);
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
    option = {
        tooltip: {
            trigger: 'item'
        },
        toolbox: {
            show: false,
        },
        yAxis: [{
            inverse: true,
            type: 'category',
            data: teams[year]
        }],
        xAxis: [{
            type: 'value',
        }],
        series: [{
            type: 'bar',
            itemStyle: {
                normal: {
                    color: function(params) {
                        var colorList = [
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
            data: scores,
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
            type: 'value',
            inverse: true,
        },
    };
    option.legend = {
        orient: 'vertical',
        right: 10,
        top: 60,
        bottom: 60,
        data: teams[year],
    };
    option.series = [];
    for (let name of teams[year]) {
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

$(document).ready(function() {
    const year = '2018';
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption(getEChartOption(year));
    var myRank = echarts.init(document.getElementById('rating'));
    myRank.setOption(getRanklistOption(year));
    var myTraining = echarts.init(document.getElementById('training'));
    myTraining.setOption(getTrainingOption(year));
});
