Ext.Loader.setPath('Ext.ux', 'ux');
Ext.require([
  'Ext.grid.*',
  'Ext.data.*',
  'Ext.panel.*',
  'Ext.layout.container.Border',
  'Ext.ux.GMapPanel'
]);

Ext.onReady(function(){
  Ext.define('Notifications',{
    extend: 'Ext.data.Model',
    requires: [
      'Ext.data.field.Field'
    ],
   fields: [
      { name: 'deviceId'},
      { name: 'email' },
      { name: 'latitude'},
      { name: 'longitude'},
      { name: 'description'}
    ]
  });

  // create the Data Store
  var store = Ext.create('Ext.data.Store', {
    model: 'Notifications',
    proxy: {
      // load using HTTP
      type: 'ajax',
      url: 'http://localhost:9000/api/notification',
      reader: {
        type: 'json',
        root: 'hits.hits',
        record: '_source'
      }
    }
  });


  // create the grid
  var grid = Ext.create('Ext.grid.Panel', {
    bufferedRenderer: false,
    store: store,
    columns: [
      {text: "DeviceId", width: 120, dataIndex: 'deviceId', sortable: true},
      {text: "Email", flex: 1, dataIndex: 'email', sortable: true},
      {text: "Latitude", width: 125, dataIndex: 'latitude', sortable: true},
      {text: "Longitude", width: 125, dataIndex: 'longitude', sortable: true},
      {text: "Description", width: 125, dataIndex: 'description', sortable: true}
    ],
    forceFit: true,
    height:210,
    split: true,
    region: 'north',
    dockedItems: [{
      xtype: 'toolbar',
      dock: 'top',
      items: [{
        text: 'Refresh',
        handler: function() {
          grid.getStore().reload();
        }
      }]
    }]
  });



  Ext.create('Ext.Panel', {
    renderTo: 'notification',
    frame: true,
    title: 'Notifications',
    width: 700,
    height: 800,
    layout: 'border',
    items: [
      grid,
      {
        xtype: 'gmappanel',
        gmapType: 'map',
        id: 'mapPanel',
        region: 'center',
        height: 500,
        center: {
          lat: 51.9433333,
          lng: 4.1425
        },
        mapOptions : {
          mapTypeId: google.maps.MapTypeId.ROADMAP
        }
      }

     ]
  });



  // update google map on selection change
  grid.getSelectionModel().on('selectionchange', function(sm, selectedRecord) {
    if (selectedRecord.length) {
      var mapPanel = Ext.getCmp('mapPanel');
      var marker = {
        lat: selectedRecord[0].data.latitude,
        lng: selectedRecord[0].data.longitude,
        title: selectedRecord[0].data.email

      };
      mapPanel.deleteMarkers();
      mapPanel.addMarker(marker);
      mapPanel.setCenter(selectedRecord[0].data.latitude,selectedRecord[0].data.longitude);
      mapPanel.markers[0].addListener('click', function() {
        new google.maps.InfoWindow({
          content: (selectedRecord[0].data.description||"No description entered by user")}).open(mapPanel.gmap, mapPanel.markers[0]);
      });
    }
  });

  store.load();
});

