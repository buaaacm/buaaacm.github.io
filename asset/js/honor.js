$('body').scrollspy({
    target: '.bs-docs-sidebar',
    offset: 40
});
$("#sidebar").affix({
    offset: {
      top: 60
    }
});

function render(result) {

}


$(document).ready(function () {
    let years = [];
    for (let year in honor) {
        years.push(year);
    }
    years = years.sort().reverse();

    for (let year of years) {
        const detail = honor[year];

        let section = $(`<section id="${year}"><h2>${year}</h2></section>`);

        if (detail.some((contest) => contest.type == 0)) {
            let WF = $(`<div id="${year + "_WF"}"><h3>World Finals</h3></div>`);
            let result = detail.find((contest) => contest.type == 0);
            //WF.append(render(result));
            section.append(WF);
        }

        $('#honor').append(section);
    }

});

