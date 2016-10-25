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
  eventsQuery: function(eventIds) {
    return `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>

SELECT (?event AS ?id) ?name ?description ?startDate ?endDate ?location ?stay ?fromStay ?fromStayAndLocation ?fromStay2 ?fromLocation ?fromLocationType WHERE {
  VALUES ?event { ${eventIds.map(x => `<${x}>`).join(" ")} }
  
    GRAPH ?eventSource{ 
    ?event a schema:Event .
    OPTIONAL {
      ?event schema:startDate ?startDate .
    }
    OPTIONAL {
      ?event schema:endDate ?endDate .
    }
    OPTIONAL {
      ?event schema:name ?name .
    }
    OPTIONAL {
      ?event schema:description ?description .
    }
    OPTIONAL{
      ?event schema:location ?locationId .
      ?locationId a schema:Place .
      ?locationId schema:name ?location .
    }
  }
  ?event schema:location ?stay .
  ?stay a personal:Stay .
  
  OPTIONAL {
    GRAPH ?stay {
      ?event schema:location ?fromStayId .
    }
    ?fromStayId schema:name ?fromStay .
  }
  
  OPTIONAL {
    GRAPH ?stay {
      ?locationId personal:sameAs ?fromStayAndLocationId .
    }
    ?fromStayAndLocationId schema:name ?fromStayAndLocation .
  }
  
  OPTIONAL {
    GRAPH ?stay{
      ?locationId personal:sameAsTemp ?fromStayId2 .
    }
    ?fromStayId2 schema:name ?fromStay2 .
  }

  OPTIONAL {
    GRAPH ?stay{
      ?locationId ?fromLocationType ?fromLocationId .
    }
    ?fromLocationId schema:name ?fromLocation .
    FILTER (?fromLocationType  = personal:sameAsTempSingle || ?fromLocationType  = personal:sameAsTempAmbiguous)
  }
}`;
  },
  locationsQuery: function(from, to) {
    return `
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX schema: <http://schema.org/>
PREFIX personal: <http://thymeflow.com/personal#>
SELECT ?location ?time ?geo ?stay ?stayStartDate ?stayEndDate ?stayGeo (group_concat(DISTINCT ?event ; separator = "\t") as ?events) WHERE {
  ?location a personal:Location ;
            schema:geo ?geo ;
            personal:time ?time .
            
  OPTIONAL{
     ?location schema:item ?stay .
     ?stay a personal:Stay .
     OPTIONAL {
       ?event schema:location ?stay .
     }
     ?stay schema:startDate ?stayStartDate ;
           schema:endDate ?stayEndDate ;
           schema:geo ?stayGeo .
  }
  FILTER (?time >= "${from}"^^xsd:dateTime && ?time <= "${to}"^^xsd:dateTime)
} GROUP BY ?location ?time ?geo ?stay ?stayStartDate ?stayEndDate ?stayGeo ORDER BY ?time`;
  },
  queryParams: {
    date: {
      refreshModel: true
    },
    timeZone: {
      refreshModel: true
    }
  },
  model(params){
    const timeZone = params.timeZone;
    const parsedDateAtTimeZone = moment.tz(params.date, "YYYY-MM-DD", timeZone);
    if(parsedDateAtTimeZone.isValid()){
      const end = parsedDateAtTimeZone.endOf('day').toISOString();
      const start = parsedDateAtTimeZone.startOf('day').toISOString();
      const query = this.locationsQuery(start, end);
      const rawLocationsPromise = this.get('sparql').query(query).then(function(queryResult){
        return queryResult.result.results.bindings;
      });
      const staysPromise = rawLocationsPromise.then((locations) => {
        const stays = new Set();
        const orderedStays = [];
        const eventSet = new Set();
        locations.forEach(function(location){
          const stay = location.stay;
          if(stay != null){
            if(!stays.has(stay.value)){
              stays.add(stay.value);
              let events = [];
              if(location.events.value != null && location.events.value !== ""){
                events = location.events.value.split('\t');
                events.forEach(event => eventSet.add(event));
              }
              const geo = parseGeoUri(location.stayGeo.value);
              const longitude = geo.longitude;
              const latitude = geo.latitude;
              const point = new ol.geom.Point([longitude, latitude]);
              orderedStays.push({
                id: stay.value,
                from: moment(location.stayStartDate.value).tz(timeZone),
                to: moment(location.stayEndDate.value).tz(timeZone),
                longitude: longitude,
                latitude: latitude,
                events: events,
                point: point
              });
            }
          }
        });
        return this.get('sparql').query(this.eventsQuery(Array.from(eventSet))).then((events) => {
          const eventMap = new Map();
          events.result.results.bindings.forEach((event) => {
            let from = event.startDate;
            let to = event.endDate;
            let description = event.description;
            if(description != null){
              description = event.description.value;
            }
            let name = event.name;
            if(name != null){
              name = event.name.value;
            }
            let location = event.location;
          const eventStayMap = new Map();
          events.content.results.bindings.forEach((event) => {
            const getAttribute = (attributeName, transform) => {
              const result = event[attributeName];
              if( result != null){
                if(transform != null){
                  return transform(result.value);
                }else{
                  return result.value;
                }
              }else{
                return result;
              }
            };
            const eventId = getAttribute("id");
            const from = getAttribute("startDate", (x) => moment(x).tz(timeZone));
            const to = getAttribute("endDate", (x) => moment(x).tz(timeZone));
            const description = getAttribute("description");
            const name = getAttribute("name");
            const location = getAttribute("location");
            const stay = getAttribute("stay");
            const fromStayBase = getAttribute("fromStay");
            const fromStayAndLocation = getAttribute("fromStayAndLocation");
            const fromStay = (fromStayBase == null) ? getAttribute("fromStay2") : fromStayBase;
            const fromLocation = getAttribute("fromLocation");
            const fromLocationType = getAttribute("fromLocationType");
            const interesting = (location != null);
            const components = [];
            if(location != null){
              components.push({name: "calLocation", value: location});
            }
            if(fromStayAndLocation != null){
              components.push({name: "fromStayAndCalLocation", value: fromStayAndLocation});
            }
            if(fromStay != null){
              components.push({name: "fromStay", value: fromStay});
            }
            if(fromLocation != null){
              const type = (fromLocationType === "http://thymeflow.com/personal#sameAsTempSingle")? "" : "AMBIGUOUS";
              components.push({name: `fromCalLocation${type}`, value: fromLocation});
            }

            eventStayMap.set(JSON.stringify([eventId, stay]),{
              from: from,
              to: to,
              description: description,
              name: name,
              interestingPlace: interesting,
              placeComponents: components
            });
          });
          orderedStays.forEach((stay) =>{
            stay.events = stay.events.map((stayEvent) => {
              const stayEventKey = JSON.stringify([stayEvent, stay.id]);
              return eventStayMap.get(stayEventKey);
            }).filter(x => x != null);
          });
          return orderedStays;
        });
      });
      const locationsPromise = rawLocationsPromise.then(function(rawLocations){
        return rawLocations.map((location) => {
          if(location.time != null){
            const geo = parseGeoUri(location.geo.value);
            const longitude = geo.longitude;
            const latitude = geo.latitude;
            const point = new ol.geom.Point([longitude, latitude]);
            return {
              longitude: longitude,
              latitude: latitude,
              point: point,
              time: moment(location.time.value).tz(timeZone),
              accuracy: geo.uncertainty
            };
          }else{
            return null;
          }
        }).filter(x => x != null);
      });
      return Ember.RSVP.hash({
        date: parsedDateAtTimeZone,
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
