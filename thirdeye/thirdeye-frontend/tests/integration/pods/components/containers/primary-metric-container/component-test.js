import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('containers/primary-metric-container', 'Integration | Component | containers/primary metric container', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{containers/primary-metric-container}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#containers/primary-metric-container}}
      template block text
    {{/containers/primary-metric-container}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
