var feed = function(data) {
  data.mapTypeControl = false;
  data.streetViewControl = false;
  data.panControl = false;
  data.rotateControl = false;
  data.zoomControl = false;
  return data;
};

module.exports = feed;
