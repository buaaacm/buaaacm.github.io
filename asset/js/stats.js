function getEChartOption() {

    let years = [], year = 2005;
    while (honor[year.toString()]) {
        years.push(year.toString());
        year++;
    }
    let option = {
        toolbox: {
            show: false,
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
            right: '10%',
        },
        xAxis: {
            data: years,
        },
        yAxis: {
            type: 'value',
        },
    };
    option.legend = {
        data: ['金奖', '银奖', '铜奖'],
    };

    option.series = [];
    option.series.push({
        name: '金奖',
        type: 'line',
        data: [],
        color: '#ffd965',
    });
    option.series.push({
        name: '银奖',
        type: 'line',
        data: [],
        color: '#d0cece',
    });
    option.series.push({
        name: '铜奖',
        type: 'line',
        data: [],
        color: '#f4b083',
    });
    for (let year of years) {
        let g = 0, s = 0, b = 0;
        for (let contest of honor[year]) {
            for (let team of contest.honor) {
                if (team[1] > 0) {
                    g += (team[1] <= 4);
                    s += (team[1] == 5);
                    b += (team[1] == 6);
                }
            }
        }
        option.series[0].data.push(g);
        option.series[1].data.push(s);
        option.series[2].data.push(b);
    }
    return option;
}

$(document).ready(function () {
    let myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption(getEChartOption());
});
