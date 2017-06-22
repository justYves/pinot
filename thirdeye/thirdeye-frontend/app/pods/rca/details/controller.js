import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const MAX_NUM_FILTERS = 25;
const MAX_TOTAL_FILTERS = 100;

const buildFilterOptions = (filters) => { 
  return Object.keys(filters).map((filterName) => {

    const filterOptions = filters[filterName]
      .filter(value => !!value)
      .map((value) => {
        return {
          name: value,
          id: `${filterName}::${value}`
        }
      })

    const options = filterOptions;

    return {
      groupName: `${filterName} (${options.length})`,
      options
    }
  })
};

const convertHashToFilters = (filters) => {
  const filterArray = [];

  Object.keys(filters).forEach((filterGroup) => {
    const options = filters[filterGroup].map((option) => {
      return {
        name: option,
        id: `${filterGroup}::${option}`
      }
    })
    filterArray.push(...options);
  })

  return filterArray;
};



export default Ember.Controller.extend({
  // queryParams: ['granularity', 'filters'],
  queryParams: ['granularity', 'filter'],
  granularities: Ember.computed.reads('model.granularities'),
  // granularity: Ember.computed.reads('granularities.firstObject'),
  noMatchesMessage: '',
  filters: {},

  // init() {
  //   this._super();
  //   this.set('selectedFilter', this.get('paramFilters'));
  // },

  /**
   * Takes the filters and massage them for the power-select grouping api
   * Currently not showing the whole list because of performance issues
   */
  filterOptions: Ember.computed('model.metricfilters', function() {
    const filters = this.get('model.metricfilters') || {};
    return buildFilterOptions(filters);
  }),

  // selectedFilters: [],

  selectedFilters: Ember.computed('filters', {
    get() {
      const filters = JSON.parse(this.get('filters'));
      // return [];
      debugger;
      return convertHashToFilters(filters);
    },
    set(key, value) {
      const filters = this.parseSelectedFilters(value);
      this.set('filters', filters);
      return value;
    }
  }),

  // filters to HASH
  parseSelectedFilters(selectedFilters) {
    // selectedFilters.forEach((filter) => {
    //   const [ filterGroup, filterName ] = filter.id.split('::');
    //   filters[filterGroup] = filters[filterGroup] || [];
    //   filters[filterGroup].push(filterName);
    // })
    // return filters;
    const filters = selectedFilters.reduce((filterHash, filter) => {
      const [ filterGroup, filterName ] = filter.id.split('::');
      filterHash[filterGroup] = filterHash[filterGroup] || [];
      filterHash[filterGroup].push(filterName);

      return filterHash;
    }, {})
    
    return JSON.stringify(filters);
  },

  // HASH to filter

  viewFilterOptions: Ember.computed('filterOptions.@each', function() {
    return [...this.get('filterOptions')].map((filter, index) => {
      const viewFilter = Object.assign({}, filter);
      if (viewFilter.options.length > MAX_NUM_FILTERS) {
        viewFilter.options = viewFilter.options[0];
      }
      return viewFilter;
    });
  }),

  // Todo: clean up function
  searchByFilterName: task(function* (filter) { 
    yield timeout(600);

    const filterOptions = [...this.get('filterOptions')];
    const foundFilters = [];
    let count = 0;

    filterOptions.forEach((filterOption) => {
      let options = filterOption.options.filter((el) => {
        return el.id.toLowerCase().includes(filter.toLowerCase());
      })

      if (options.length) {
        count += options.length;
        foundFilters.push({
          groupName: `${filterOption.groupName}`,
          options: options
        });
      }
    })

    if (!count) {
      this.set('noMatchesMessage', 'No Results Found.');
      return [];
    } else if (count > MAX_TOTAL_FILTERS) {
      this.set('noMatchesMessage', `Too Many results found. (${count})`);
      return [];
    } else {
      return foundFilters;
    }
  }),

  actions: {
    onGranularityChange(granularity) {
      this.set('granularity', granularity);
    },
    onFilterChange(filters) {
      this.set('selectedFilters', filters);
    },  
  }
});
