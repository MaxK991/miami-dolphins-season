/* Public, stable subscription URLs; no one-time calendar imports. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DolphinsCalendar = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function links(pageUrl) {
    const feed = new URL('calendar/dolphins.ics', pageUrl);
    if (feed.protocol !== 'https:') throw new Error('Das Kalenderabo benötigt die veröffentlichte HTTPS-Website.');
    return { https: feed.href, webcal: feed.href.replace(/^https:/, 'webcal:'), status: new URL('status.json', feed).href };
  }
  function validateStatus(data) {
    const updatedAt = Date.parse(data?.updatedAt);
    if (data?.schema !== 1 || data.automatic !== true || !Number.isFinite(updatedAt) || !Number.isInteger(data.eventCount) || data.eventCount < 0) {
      throw new Error('Automatische Kalenderbereitstellung noch nicht eingerichtet.');
    }
    return { updatedAt, eventCount: data.eventCount };
  }
  return { links, validateStatus };
});
