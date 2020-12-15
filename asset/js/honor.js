$('body').scrollspy({
    target: '.bs-docs-sidebar',
    offset: 40
});
$("#sidebar").affix({
    offset: {
        top: 60
    }
});

function renderTable(result) {
    let table = $('<table class="table table-bordered"></table>');
    let thead = $('<thead><colgroup><col width="25%"></col><col width="20%"></col><col width="20%"></col><col width="20%"></col>' +
        '<col width="15%"></col></colgroup><tr><th>队伍</th><th colspan="3">成员</th><th>奖项</th></tr></thead>');
    table.append(thead);
    let tbody = $('<tbody></tbody>');
    for (let team of result) {
        let tr = $('<tr></tr>');
        tr.append(`<td>${team.name || team.english_name}</td>`);
        for (let i = 1; i <= 3; ++i) {
            name = team[`member${i}`]
            tr.append(`<td>${name}</td>`);
        }
        tr.append(`<th>${team.award}</th>`);
        tbody.append(tr);
    }
    table.append(tbody);
    return table;
}


$(document).ready(function () {
    let honor;
    $.ajax({
        dataType: 'json',
        url: 'https://api.buaaacm.com/honor/',
        data: { },
        type: 'GET',
        async: false,
        success: function(data){
            honor = data;
        }
    });

    let years = Object.keys(honor);
    years = years.sort().reverse();

    for (let year of years) {
        const detail = honor[year];

        let yearName = `${year}~${parseInt(year) + 1}`;
        let section = $(`<section id="${year}"><h2>${yearName}</h2></section>`);
        let navi = $(`<li><a href="#${year}">${yearName}</a></li>`);
        let subnavi = $('<ul class="nav nav-stacked"></ul>');

        if (detail.some((contest) => contest.info.type === 'World-Finals')) {
            let WF = $(`<div id="${year + "_WF"}"><h3>ICPC World Finals</h3></div>`);
            let result = detail.find((contest) => contest.info.type === 'World-Finals');
            WF.append(`<h4>${result.info.region}</h4>`)
            WF.append(renderTable(result.honors));
            section.append(WF);
            subnavi.append($(`<li><a href="#${year + "_WF"}">ICPC World Finals</a></li>`));
        }
        if (detail.some((contest) => contest.info.type === 'ICPC')) {
            let icpc = $(`<div id="${year + "_icpc"}"><h3>ICPC Regional</h3></div>`);
            let results = detail.filter((contest) => contest.info.type === 'ICPC');
            for (let result of results) {
                let contest = $(`<div><h4>${result.info.region}</h4></div>`);
                contest.append(renderTable(result.honors));
                icpc.append(contest);
            }
            section.append(icpc);
            subnavi.append($(`<li><a href="#${year + "_icpc"}">ICPC Regional</a></li>`));
        }
        if (detail.some((contest) => contest.info.type === 'CCPC')) {
            let ccpc = $(`<div id="${year + "_ccpc"}"><h3>CCPC</h3></div>`);
            let results = detail.filter((contest) => contest.info.type == 'CCPC');
            for (let result of results) {
                let contest = $(`<div><h4>${result.info.region}</h4></div>`);
                contest.append(renderTable(result.honors));
                ccpc.append(contest);
            }
            section.append(ccpc);
            subnavi.append($(`<li><a href="#${year + "_ccpc"}">CCPC</a></li>`));
        }
        navi.append(subnavi);
        section.append('<hr>');
        $('#sidebar').append(navi);
        $('#honor').append(section);
    }
});

