import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dimension-heatmap', 'Integration | Component | dimension heatmap', {
  integration: true
});

test('it renders', function(assert) {

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{dimension-heatmap}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#dimension-heatmap}}
      template block text
    {{/dimension-heatmap}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
