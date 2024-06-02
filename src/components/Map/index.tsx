import React from 'react';
import { GoogleMap, InfoWindowF } from '@react-google-maps/api';
import { Button, Flex } from 'antd';
import { MarkerData } from '../../types/marker';
import { MarkerComponent } from '../Marker';

interface MapProps {
  markers: MarkerData[];
  selected?: MarkerData | null;
  setSelected: (marker: MarkerData | null) => void;
  onMapClick: (event: google.maps.MapMouseEvent) => void;
  onMarkerClick: (marker: MarkerData) => void;
  onMarkerDragEnd: (
    event: google.maps.MapMouseEvent,
    marker: MarkerData
  ) => void;
  deleteMarker: (id: number) => void;
  clearMarkers: () => void;
  center: { lat: number; lng: number };
  mapContainerStyle: React.CSSProperties;
}

export const Map: React.FC<MapProps> = ({
  markers,
  selected,
  setSelected,
  onMapClick,
  onMarkerClick,
  onMarkerDragEnd,
  deleteMarker,
  clearMarkers,
  center,
  mapContainerStyle,
}) => {
  return (
    <div style={{ backgroundColor: '#221f1f', height: '100vh' }}>
      <div style={{ marginLeft: '10%' }}>
        <Button onClick={clearMarkers} type='primary' style={{ marginTop: 20 }}>
          Clear Markers
        </Button>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          onClick={onMapClick}
        >
          {markers.map((marker) => (
            <MarkerComponent
              key={marker.id}
              marker={marker}
              onDragEnd={onMarkerDragEnd}
              onClick={onMarkerClick}
            />
          ))}

          {selected && (
            <InfoWindowF
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => {
                setSelected(null);
              }}
            >
              <Flex vertical gap='small'>
                <div
                  style={{
                    fontWeight: 'bold',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  Quest {selected.id}
                </div>
                <div>
                  <div>lat: {selected.lat}</div>
                  <div>lng: {selected.lng}</div>
                </div>
                <div>Next {+selected.label + 1}</div>
                <Button
                  type='primary'
                  onClick={() => deleteMarker(selected.id)}
                >
                  Delete
                </Button>
              </Flex>
            </InfoWindowF>
          )}
        </GoogleMap>
      </div>
    </div>
  );
};
