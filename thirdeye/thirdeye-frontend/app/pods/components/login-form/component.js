import Ember from 'ember';
import fetch from 'fetch';

export default Ember.Component.extend({
  classNames: ['nacho-login-form'],
  username: '',
  password: '',
  actions: {
    onLogin() {
      console.log(this.get('userName') + " " + this.get('password'));
    }
  }
});
