import chartComponent from 'ember-c3/components/c3-chart'

/**
 * Extended the c3-chart component so that we will have access to 
 * the chart and its internal API
 */
export default chartComponent.extend({
    init() {
        debugger;
        this._super(...arguments);
    },

    didReceiveAttrs() { 
        debugger;
        this._super(...arguments); 
    },

    didUpdateAttrs() { 
        debugger;
        this._super(...arguments); }
});
