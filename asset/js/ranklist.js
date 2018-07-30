function getEChartOption(year) {
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
            data: trainingRanklist[year].map(x => x[0]),
        },
        yAxis: {
            name: 'Rating',
            nameLocation: 'middle',
            type: 'value',
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
        let status = {};
        status.name = name;
        status.type = 'line';
        status.data = [];
        option.series.push(status);
    }
    let ranklist = trainingRanklist[year];
    for (let teamId = 0 ; teamId < teams[year].length ; ++ teamId) {
        let l = [];
        console.log(teamId);
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
            option.series[teamId].data.push(sum);
        }
    }
    return option;
}

$(document).ready(function () {
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.clear();
    myChart.setOption(getEChartOption('2017'));
});
