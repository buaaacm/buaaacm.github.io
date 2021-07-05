function getEChartOption(count) {
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

function renderTable(result) {
    let table = $('<table class="table table-bordered"></table>');
    let thead = $('<thead><colgroup><col width="12%"></col><col width="29%"></col><col width="15%"></col>' +
        '<col width="10%"></col><col width="10%"></col><col width="10%"></col><col width="14%"></col></colgroup>' +
        '<tr><th>日期</th><th>赛区</th><th>队伍</th><th colspan="3">成员</th><th>奖项</th></tr></thead>');
    table.append(thead);
    let tbody = $('<tbody></tbody>');
    for (let honor of result) {
        let tr = $('<tr></tr>');
        tr.append(`<td>${honor.date.replace(/-/g, '.')}</td>`);
        tr.append(`<td>${honor.contest}</td>`);
        tr.append(`<td>${honor.name || honor.english_name}</td>`);
        for (let i = 1; i <= 3; ++i) {
            name = honor[`member${i}`]
            tr.append(`<td>${name}</td>`);
        }
        tr.append(`<th>${honor.award}（金奖）</th>`);
        tbody.append(tr);
    }
    table.append(tbody);
    $('#trophy').append(table);
}

$(document).ready(function () {
    let myChart = echarts.init(document.getElementById('chart'));
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/honor/count/',
        data: { },
        type: 'GET',
        success: function(data){
            myChart.setOption(getEChartOption(data));
        }
    });

    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/honor/trophy/',
        data: { },
        type: 'GET',
        success: function(data){
            renderTable(data);
        }
    });
});
