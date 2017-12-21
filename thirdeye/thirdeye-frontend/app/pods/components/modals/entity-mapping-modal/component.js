import Component from '@ember/component';
import { get, set, getProperties, setProperties, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import fetch from 'fetch';
import { task, timeout } from 'ember-concurrency';
import { checkStatus } from 'thirdeye-frontend/helpers/utils';

// TODO: move this hard coded item to a server side config file
// and create an endpoint to fetch this
const MAPPING_TYPES = [
  'METRIC',
  'DIMENSION',
  'SERVICE',
  'DATASET',
  'LIXTAG',
  'CUSTOM'
];

export default Component.extend({
  session: service(),
  selectedMappingType: 'metric',
  selectedEntity: {},
  mappingTypes: MAPPING_TYPES.map(type => type.toLowerCase()),
  mostRecentSearch: null,
  relatedEntities: null,

  init() {
    this._super(...arguments);

    const currentUser = get(this, 'session.data.authenticated.name')
    get(this, 'relatedEntities').forEach((entity) => {
      const { createdBy = 'unkown' } = entity;
      entity.isDeletable = createdBy === currentUser;
    });
  },

  user: computed.reads('session.data.authenticated.name'),

  /**
   * Checks if the currently selected entity is already in the mapping
   */
  mappingExists : computed(
    'selectedEntity.label',
    'relatedEntities.@each.alias',
    'primaryMetric',
    function() {
      const {
        selectedEntity: entity,
        relatedEntities,
        primaryMetric
      } = getProperties(this, 'selectedEntity', 'relatedEntities', 'primaryMetric');

      return (primaryMetric === entity.alias) || relatedEntities.some(relatedEntity => relatedEntity.label === entity.alias);
    }
  ),

  entityColumns: [
    {
      propertyName: 'type',
      title: 'Types',
      filterWithSelect: true,
      className: 'te-modal__table-cell te-modal__table-cell--capitalized'
    },
    {
      template: 'custom/filterLabel',
      title: 'Filter value',
      className: 'te-modal__table-cell'
    },
    {
      propertyName: 'createdBy',
      title: 'Created by',
      className: 'te-modal__table-cell',
      disableFiltering: true
    },
    // Todo: Fix back end to send
    // dateCreated data
    // {
    //   propertyName: 'dateCreated',
    //   title: 'Date Created'
    // },
    {
      template: 'custom/tableDelete',
      title: '',
      className: 'te-modal__table-cell te-modal__table-cell--delete te-modal__table-cell--dark'
    }
  ],

  classes: Object.create({
    "theadCell": "te-modal__table-header"
  }),

  /**
   * Ember concurrency task that triggers the metric autocomplete
   */
  searchEntities: task(function* (searchText) {
    yield timeout(600);

    let url = `/data/autocomplete/metric?name=${searchText}`;

    /**
     * Necessary headers for fetch
     */
    const headers = {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cache': 'no-cache'
      },
      credentials: 'include'
    };

    return fetch(url, headers)
      .then(checkStatus);
  }),

  actions: {
    onModalSubmit() {
      console.log('submitted');
    },

    onDeleteEntity(entity) {
      if (entity.isDeletable) {
        console.log('delete');
      }
      // debugger;
      // const relatedEntities = get(this, 'model.relatedEntities');
      // relatedEntities.removeObject(entity);

      // if (entity.isNew) {
      // }
    },
    onAddFilter() {
      const {
        selectedEntity: entity,
        relatedEntities,
        user,
        mappingExists
      } = getProperties(
        this,
        'selectedEntity',
        'relatedEntities',
        'user',
        'mappingExists'
      );

      if (mappingExists) { return; }
      debugger;

      relatedEntities.unshiftObject({
        label: entity.alias,
        urn: `thirdeye:metric:${entity.id}`,
        type: 'metric',
        isNew: true,
        createdBy: user,
        isDeletable: true
      });
      // set(this, 'selectedEntity', {});
    },

    // /**
    //  * Action handler for metric search changes
    //  * @param {Object} metric
    //  */
    // onMetricChange(entity) {
    //   debugger;
    //   set(this, 'selectedEntity', entity);
    // },

    /**
     * Performs a search task while cancelling the previous one
     * @param {Array} metrics
     */
    onSearch(metrics) {
      const lastSearch = get(this, 'mostRecentSearch');
      if (lastSearch) {
        lastSearch.cancel();
      }
      const task = get(this, 'searchEntities');
      const taskInstance = task.perform(metrics);
      this.set('mostRecentSearch', taskInstance);
      return taskInstance;
    }
  }
});
