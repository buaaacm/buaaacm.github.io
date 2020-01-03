$('body').scrollspy({
    target: '.bs-docs-sidebar',
    offset: 40
});
$("#sidebar").affix({
    offset: {
        top: 60
    }
});

function awardString(x) {
    if (x == 1) return "金奖 (冠军)";
    if (x == 2) return "金奖 (亚军)";
    if (x == 3) return "金奖 (季军)";
    if (x == 4) return "金奖";
    if (x == 5) return "银奖";
    if (x == 6) return "铜奖";
    if (x == 7) return "优胜奖";
    return `第${-x}名`;
}

function renderTable(result) {
    let table = $('<table class="table table-bordered"></table>');
    let thead = $('<thead><colgroup><col width="25%"></col><col width="20%"></col><col width="20%"></col><col width="20%"></col>' +
        '<col width="15%"></col></colgroup><tr><th>队伍</th><th colspan="3">成员</th><th>奖项</th></tr></thead>');
    table.append(thead);
    let tbody = $('<tbody></tbody>');
    for (let team of result.honor) {
        let id = team[0];
        let tr = $('<tr></tr>');
        tr.append(`<td>${teams[id].cn || teams[id].en}</td>`);
        for (let i = 0; i < 3; ++i) {
            let member = teams[id].members[i];
            tr.append(`<td>${members[member].name}</td>`);
        }
        tr.append(`<th>${awardString(team[1])}</th>`);
        tbody.append(tr);
    }
    table.append(tbody);
    return table;
}


$(document).ready(function () {
    let years = [];
    for (let year in honor) {
        years.push(year);
    }
    years = years.sort().reverse();

    for (let year of years) {
        const detail = honor[year];

        let yearName = `${year}~${parseInt(year) + 1}`;
        let section = $(`<section id="${year}"><h2>${yearName}</h2></section>`);
        let navi = $(`<li><a href="#${year}">${yearName}</a></li>`);
        let subnavi = $('<ul class="nav nav-stacked"></ul>');

        if (detail.some((contest) => contest.type == 0)) {
            let WF = $(`<div id="${year + "_WF"}"><h3>ICPC World Finals</h3></div>`);
            let result = detail.find((contest) => contest.type == 0);
            WF.append(`<h4>${result.region}</h4>`)
            WF.append(renderTable(result));
            section.append(WF);
            subnavi.append($(`<li><a href="#${year + "_WF"}">ICPC World Finals</a></li>`));
        }
        if (detail.some((contest) => contest.type == 1)) {
            let icpc = $(`<div id="${year + "_icpc"}"><h3>ICPC Regional</h3></div>`);
            let results = detail.filter((contest) => contest.type == 1);
            for (let result of results) {
                let contest = $(`<div><h4>${result.region}</h4></div>`);
                contest.append(renderTable(result));
                icpc.append(contest);
            }
            section.append(icpc);
            subnavi.append($(`<li><a href="#${year + "_icpc"}">ICPC Regional</a></li>`));
        }
        if (detail.some((contest) => contest.type == 2)) {
            let ccpc = $(`<div id="${year + "_ccpc"}"><h3>CCPC</h3></div>`);
            let results = detail.filter((contest) => contest.type == 2);
            for (let result of results) {
                let contest = $(`<div><h4>${result.region}</h4></div>`);
                contest.append(renderTable(result));
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

