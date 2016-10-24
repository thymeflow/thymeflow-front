export default function() {
  this.transition(
    this.includingInitialRender(),
    this.hasClass('system-status-body'),
    this.use('crossFade', {duration: 200})
  );
  this.transition(
    this.includingInitialRender(),
    this.hasClass('system-history-body'),
    this.use('crossFade', {duration: 200})
  );
}
