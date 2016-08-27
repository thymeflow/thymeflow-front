import Ember from 'ember';
import moment from 'moment';
import ol from 'ol';

const geoRegex = /^geo:(-?\d*\.?\d*),(-?\d*\.?\d*)[^;]*(?:;(?:u=([0-9.]*))?)?/;

function parseGeoUri(geoUri){
  const m = geoUri.match(geoRegex);
  let uncertainty = m[3];
  if(uncertainty != null){
    uncertainty = parseFloat(uncertainty);
  }
  return {
    latitude: parseFloat(m[1]),
    longitude: parseFloat(m[2]),
    uncertainty: uncertainty
  };
}

export default Ember.Route.extend({
  sparql: Ember.inject.service(),
  locationsQuery: function(from, to) {
    return `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>
SELECT ?location ?time ?geo ?stay ?stayStartDate ?stayEndDate ?stayGeo WHERE {
  ?location a personal:Location ;
            schema:geo ?geo ;
            personal:time ?time .
            
  OPTIONAL{
     ?location schema:item ?stay .
     ?stay a personal:Stay .
     
     ?stay schema:startDate ?stayStartDate ;
           schema:endDate ?stayEndDate ;
           schema:geo ?stayGeo .
  }
  FILTER (?time >= "${from}"^^xsd:dateTime && ?time <= "${to}"^^xsd:dateTime)
} ORDER BY ?time`;
  },
  queryParams: {
    date: {
      refreshModel: true
    }
  },
  model(params){
    var date = params.date;
    date = moment(date, "YYYY-MM-DD");
    if(date.isValid()){
      const end = date.endOf('day').toISOString();
      const start = date.startOf('day').toISOString();
      const query = this.locationsQuery(start, end);
      const rawLocationsPromise = this.get('sparql').query(query).then(function(queryResult){
        return queryResult.content.results.bindings;
      });
      const staysPromise = rawLocationsPromise.then(function(locations){
        const stays = new Set();
        const orderedStays = [];
        locations.forEach(function(location){
          const stay = location.stay;
          if(stay != null){
            if(!stays.has(stay.value)){
              stays.add(stay.value);
              const geo = parseGeoUri(location.stayGeo.value);
              const longitude = geo.longitude;
              const latitude = geo.latitude;
              const point = new ol.geom.Point([longitude, latitude]);
              orderedStays.push({
                id: stay,
                from: moment(location.stayStartDate.value),
                to: moment(location.stayEndDate.value),
                longitude: longitude,
                latitude: latitude,
                point: point
              });
            }
          }
        });
        return orderedStays;
      });
      const locationsPromise = rawLocationsPromise.then(function(rawLocations){
        return rawLocations.map((location) => {
          const geo = parseGeoUri(location.geo.value);
          const longitude = geo.longitude;
          const latitude = geo.latitude;
          const point = new ol.geom.Point([longitude, latitude]);
          return {
            longitude: longitude,
            latitude: latitude,
            point: point,
            time: moment(location.time.value),
            accuracy: geo.uncertainty
          };
        });
      });
      return Ember.RSVP.hash({
        date: date,
        locations: locationsPromise,
        stays: staysPromise
      });
    }else{
      return {date: null, locations: null, stays: null};
    }
  },
  actions: {
    loading(transition /*, originRoute*/) {
      let controller = this.controllerFor('timeline');
      controller.set('currentlyLoading', true);
      transition.promise.finally(function() {
        controller.set('currentlyLoading', false);
      });
    }
  }
});
