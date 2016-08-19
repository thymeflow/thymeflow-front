import Ember from 'ember';

export default Ember.Component.extend({
  tagName: "",
  unit: 'day',
  format: 'HH:mm',
  item: null,
  relativeTo: null,

  formatted: (function() {
    const relativeTo = this.get('relativeTo');
    const item = this.get('item');
    if(item != null && relativeTo != null){
      const format = this.get('format');
      const unit = this.get('unit');
      const from = item.get("from");
      const to = item.get("to");
      const relativeToStartOfDay = relativeTo.clone().startOf(unit);
      const fromDiff = from.clone().startOf(unit).diff(relativeToStartOfDay,unit);
      if(fromDiff > 0){
        return `${from.format(format)} (+${fromDiff})`;
      }else {
        const toDiff = to.clone().startOf(unit).diff(relativeToStartOfDay,unit);
        if(toDiff < 0){
          return `${to.format(format)} (${fromDiff})`;
        }else{
          return `${from.format(format)}${fromDiff < 0 ? ` (${fromDiff})` : ""} - ${to.format(format)}${toDiff > 0 ? ` (+${toDiff})` : ""}`;
        }
      }
    }else{
      return "";
    }
  }).property('item', 'unit', 'format', 'relativeTo')
});

