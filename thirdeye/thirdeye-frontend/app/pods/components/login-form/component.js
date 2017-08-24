import Ember from 'ember';
import fetch from 'fetch';
import { checkStatus } from 'thirdeye-frontend/helpers/utils';

export default Ember.Component.extend({
  classNames: ['nacho-login-form'],
  username: '',
  password: '',
  actions: {
    onLogin() {

      const url = '/auth/authenticate';
      const data = {
        principal: this.get('username'),
        password: this.get('password')
      };

      const postProps = {
        method: 'post',
        body: JSON.stringify(data),
        headers: { 'content-type': 'Application/Json' }
      };
      return fetch(url, postProps)
        .then(() => {
          debugger;
        });
        // .then((res) => checkStatus(res, 'post'));
    }
  }
});
