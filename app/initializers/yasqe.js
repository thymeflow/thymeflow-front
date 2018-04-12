import YASQE from 'yasqe';
import ENV from 'thymeflow-front/config/environment';

export function initialize() {
  YASQE.Autocompleters.prefixes.fetchFrom = `${ENV.rootURL}assets/sparql/prefixes.all.json`;
}

export default {
  name: 'yasqe',
  initialize: initialize
};