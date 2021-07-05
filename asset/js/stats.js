function getEChartOption() {
    let count;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/honor/count/',
        data: { },
        type: 'GET',
        async: false,
        success: function(data){
            count = data;
        }
    });

    let years = Object.keys(count);
    years = years.map((year) => +year).sort()

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
    let color_map = new Map([
        ['金奖', '#ffd965'],
        ['银奖', '#d0cece'],
        ['铜奖', '#f4b083']
    ]);
    let awards = [...color_map.keys()];
    option.legend = {
        data: awards,
    };

    option.series = [];
    for (let award of awards){
        option.series.push({
            name: award,
            type: 'line',
            data: [],
            color: color_map.get(award),
        });
    }
    for (let year of years) {
        for (let i = 0; i < awards.length; ++ i){
            option.series[i].data.push(count[year][awards[i]] || 0);
        }
    }
    return option;
}

$(document).ready(function () {
    let myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption(getEChartOption());
});
