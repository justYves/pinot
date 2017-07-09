import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('containers/events-table-container', 'Integration | Component | containers/events table container', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{containers/events-table-container}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#containers/events-table-container}}
      template block text
    {{/containers/events-table-container}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
