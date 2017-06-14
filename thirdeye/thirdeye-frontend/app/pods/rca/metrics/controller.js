import Ember from 'ember';

export default Ember.Controller.extend({
  splitView: false,
  queryParams: ['compareMode'],
  compareMode: null,

  compareModeOptions: ['WoW', 'Wo2W', 'Wo3W', 'Wo4W'],

  actions: {
    onSplitViewToggling() {
      this.toggleProperty('splitView');
    },
    onModeChange(compareMode){
      this.set('compareMode', compareMode);
    },
  }
});
