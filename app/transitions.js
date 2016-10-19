export default function() {
  this.transition(
    this.includingInitialRender(),
    this.hasClass('system-status-body'),
    this.use('crossFade', {duration: 200})
  );
}