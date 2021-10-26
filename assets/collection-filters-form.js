function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
};
class CollectionFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.filterData = [];
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));
    window.addEventListener('popstate', this.onHistoryChange.bind(this));

    this.bindActiveFacetButtonEvents();
    
    let elem = document.querySelectorAll('.show-more--list_tags');
    if(elem) {
      elem.forEach( (button) => button.addEventListener('click', this.showMoreValue.bind(this)));
    }
  }

  showMoreValue(e) {
    e.target.closest('.list-tags').classList.add('full');

  }

  onSubmitHandler(event) {
    event.preventDefault();
    if (event.target.classList.contains('filter__price') || event.target.classList.contains('single-option-selector')) {
    } else {
      const formData = new FormData(event.target.closest('form'));
      const searchParams = new URLSearchParams(formData).toString();
      this.renderPage(searchParams, event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    this.toggleActiveFacets();
    this.renderPage(new URL(event.target.href).searchParams.toString());
  }

  onHistoryChange(event) {
    const searchParams = event.state?.searchParams || '';
    this.renderPage(searchParams, null, false);
  }

  toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  renderPage(searchParams, event, updateURLHash = true) {
    const sections = this.getSections();

    document.getElementById('CollectionProductGrid').querySelector('.product-collection').classList.add('loading');

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      // console.log(url);

      this.filterData.some(filterDataUrl) ?
        this.renderSectionFromCache(filterDataUrl, section, event) :
        this.renderSectionFromFetch(url, section, event);
    });

    if (updateURLHash) this.updateURLHash(searchParams);

  }

  renderSectionFromFetch(url, section, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        this.filterData = [...this.filterData, { html, url }];
        this.renderFilters(html, event);
        this.renderProductGrid(html);
        this.renderCountItem(html);
        this.renderRefined(html);
        this.renderShortby(html);
        let elem = document.querySelectorAll('.show-more--list_tags');
        if(elem) {
          elem.forEach( (button) => button.addEventListener('click', this.showMoreValue.bind(this)));
        }
      });
  }

  renderSectionFromCache(filterDataUrl, section, event) {
    const html = this.filterData.find(filterDataUrl).html;
    this.renderFilters(html, event);
    this.renderProductGrid(html);
    this.renderCountItem(html);
    this.renderRefined(html);
    this.renderShortby(html);
    let elem = document.querySelectorAll('.show-more--list_tags');
    if(elem) {
      elem.forEach( (button) => button.addEventListener('click', this.showMoreValue.bind(this)));
    }
  }

  renderShortby(html) {
    const elem = document.getElementById('shopify-section-collection-template-express-order');
    if (elem) return;
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('CollectionSort_by').innerHTML;

    document.getElementById('CollectionSort_by').innerHTML = innerHTML;

  }

  renderProductGrid(html) {
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('CollectionProductGrid').innerHTML;

    document.getElementById('CollectionProductGrid').innerHTML = innerHTML;
    // if (window.innerWidth > 1200 && document.querySelectorAll('.append--toolbar .toolbar').length > 0) {
    //   document.getElementById('CollectionProductGrid').querySelector('.toolbar').remove();
    // }

    if (window.show_multiple_currencies && Currency.currentCurrency != shopCurrency) {
        Currency.convertAll(window.shop_currency, $('#currencies .active').attr('data-currency'), 'span.money', 'money_format');
    }

    if (document.querySelectorAll('.shopify-product-reviews-badge').length && document.querySelectorAll('.spr-badge').length) {
      return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
    };
  }

  renderRefined(html) {
    const elem = document.getElementById('widget-content-no--filter');
    if (!elem) return;
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('widget-content-no--filter').innerHTML;

    document.getElementById('widget-content-no--filter').innerHTML = innerHTML;
    this.bindActiveFacetButtonEvents();
  }

  renderCountItem(html) {
    const elem = document.getElementById('page_size');
    if (!elem) return;
    const innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('page_size').innerHTML;

    document.getElementById('page_size').innerHTML = innerHTML;
  }

  renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElements =
      parsedHTML.querySelectorAll('#CollectionFiltersForm .js-filter');
    const matchesIndex = (element) => element.dataset.index === event?.target.closest('.js-filter')?.dataset.index
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;

    });

    if (countsToRender) this.renderCounts(countsToRender, event.target.closest('.js-filter'));
    
  }

  renderCounts(source, target) {
    const countElementSelectors = ['.count-bubble','.facets__selected'];
    countElementSelectors.forEach((selector) => {
      const targetElement = target.querySelector(selector);
      const sourceElement = source.querySelector(selector);
      if (sourceElement && targetElement) {
        target.querySelector(selector).outerHTML = source.querySelector(selector).outerHTML;
      }
    });
  }

  bindActiveFacetButtonEvents() {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.addEventListener('click', this.onActiveFilterClick, { once: true });
    });
  }

  updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  getSections() {
    return [
      {
        id: 'main-collection-product-grid',
        section: document.getElementById('main-collection-product-grid').dataset.id,
      }
    ]
  }
}

customElements.define('collection-filters-form', CollectionFiltersForm);

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.rangeSliderPrice();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }

  rangeSliderPrice(){
    var parent = document.querySelector(".price-slider");
    if(!parent) return;

    var
      rangeS = parent.querySelectorAll("input[type=range]"),
      numberS = parent.querySelectorAll("input[type=number]");

    rangeS.forEach(function(el) {
      el.oninput = function() {
        var slide1 = parseFloat(rangeS[0].value),
            slide2 = parseFloat(rangeS[1].value);

        if (slide1 > slide2) {
          [slide1, slide2] = [slide2, slide1];
        }

        numberS[0].value = slide1;
        numberS[1].value = slide2;
      }
    });

    numberS.forEach(function(el) {
      el.oninput = function() {
          var number1 = parseFloat(numberS[0].value),
          number2 = parseFloat(numberS[1].value);

        // if (number1 > number2) {
        //   var tmp = number1;
        //   numberS[0].value = number2;
        //   numberS[1].value = tmp;
        // }

        rangeS[0].value = number1;
        rangeS[1].value = number2;

      }
    });

  }
}

customElements.define('price-range', PriceRange);

