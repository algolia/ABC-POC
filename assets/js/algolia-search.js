/* global instantsearch autocomplete */

var appID = 'Y63Q32NVDL',
    apiKey = '45bce7c03e206c4f2618e69a9f6acfc1',
    indices = {
        news: newsSettings,
        iview: iviewSettings,
        radio: radioSettings,
        television: tvSettings
    },
    lang = 'en',
    currIndex = 'news';

app({
    appID,
    apiKey,
    lang,
    articlesIndexName: indices[currIndex].name,
    settings: indices[currIndex].settings

});

$("#language-select").change(function (e) {
    app({
        appID,
        apiKey,
        lang: e.target.value,
        articlesIndexName: indices[currIndex].name,
        settings: indices[currIndex].settings
    });
});

$("ul#indices-ul > li > a").click(function (e) {
    app({
        appID,
        apiKey,
        lang,
        articlesIndexName: indices[e.target.text].name,
        settings: indices[e.target.text].settings
    });
})

function app(opts) {
    var search;
    var searchOptions = {
        appId: opts.appID,
        apiKey: opts.apiKey,
        indexName: opts.articlesIndexName,
        urlSync: true,
        // searchParameters: {
        //     index: opts.articlesIndexName
        // },
        searchFunction: function (helper) {
            helper.setIndex(opts.articlesIndexName);
            helper.search();
        }
    }

    if (opts.articlesIndexName === 'ABC_TEST_coremedia_article') {
        search = instantsearch(Object.assign(searchOptions, {
            searchParameters: {
                filters: `lang:${opts.lang}`
            }
        })
        )
        console.log('new search started in articles', search);
    } else {
        search = instantsearch(searchOptions);
        console.log('new search started in other index', search);
    }

    if ($('.ais-search-box').length) {
        $('.ais-search-box').remove();
    }

    $('#genre-facet').empty();
    $('#keyword-facet').empty();
    $('#author-facet').empty();

    search.addWidget(
        instantsearch.widgets.searchBox({
            container: '#search-box',
            placeholder: opts.settings.searchPlaceholder
        })
    );

    search.addWidget(
        instantsearch.widgets.stats({
            container: '#search-stats',
        })
    );

    // try{
    //     console.log('search', search)
    //     search.addWidget(
    //         instantsearch.widgets.sortBySelector({
    //             container: '#sort-by-container',
    //             indices: opts.settings.sortByIndices
    //         })
    //     );
    // }
    // catch (err) {
    //     console.log(err);
    // }


    search.addWidget(
        instantsearch.widgets.currentRefinedValues({
            container: '#current-refined-values',
            clearAll: 'after',
            clearsQuery: true,
            attributes: opts.settings.clearRefinedAttributes,
            onlyListedAttributes: true,
        })
    );

    search.addWidget(
        instantsearch.widgets.hits({
            container: '#hits',
            templates: {
                item: getTemplate(opts.settings.templateName),
                empty: getTemplate('empty')
            }
        })
    );

    opts.settings.refinementLists.forEach(list => {
        search.addWidget(
            instantsearch.widgets.refinementList(list)
        )
    });

    search.addWidget(
        instantsearch.widgets.pagination({
            container: '#pagination-container',
            maxPages: 20,
            scrollTo: false,
            showFirstLast: false,
        })
    );



    search.addWidget(bestBetWidget);
    search.start();
}

function getTemplate(templateName) {
    return document.querySelector(`#${templateName}-template`).innerHTML;
}