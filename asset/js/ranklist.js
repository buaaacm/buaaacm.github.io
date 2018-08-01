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
        xAxis:  {
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
    for (let teamId = 0 ; teamId < teams[year].length ; ++ teamId) {
        let l = [] , point = [];
        let count = 0;
        for (let training of ranklist) {
            let rank = training.indexOf(teamId + 1);
            l.push(score[rank]);
            l = l.sort(function(a, b) {
                return a - b;
            });
            count ++;
            let less = Math.min(Math.floor(count / 6) , 2);
            let sum = 0;
            for (let i = less ; i < l.length ; ++ i) {
                sum += l[i];
            }
            point.push(sum);
        }
        points.push(point);
    }

    for (let i = 0 ; i < ranklist.length ; ++ i) {

        for (let j = 0 ; j < teams[year].length ; ++ j) {
            let rank = 1;
            for (let k = 0 ; k < teams[year].length ; ++ k) {
                if (points[k][i] > points[j][i]) {
                    ++ rank;
                }
            }
            option.series[j].data.push(rank);
        }

    }

    return option;
}

$(document).ready(function () {
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.clear();
    myChart.setOption(getEChartOption('2017'));
});
