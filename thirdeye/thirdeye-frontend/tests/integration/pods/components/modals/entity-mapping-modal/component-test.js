import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('modals/entity-mapping-modal', 'Integration | Component | modals/entity mapping modal', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{modals/entity-mapping-modal}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#modals/entity-mapping-modal}}
      template block text
    {{/modals/entity-mapping-modal}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
