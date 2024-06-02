import React from 'react';
import { MarkerF } from '@react-google-maps/api';
import { MarkerData } from '../../types/marker';

interface MarkerComponentProps {
  marker: MarkerData;
  onDragEnd: (event: google.maps.MapMouseEvent, marker: MarkerData) => void;
  onClick: (marker: MarkerData) => void;
}

const MarkerComponent: React.FC<MarkerComponentProps> = ({
  marker,
  onDragEnd,
  onClick,
}) => {
  return (
    <MarkerF
      key={marker.id}
      position={{ lat: marker.lat, lng: marker.lng }}
      label={marker.label}
      draggable
      onDragEnd={(event) => onDragEnd(event, marker)}
      onClick={() => onClick(marker)}
    />
  );
};

export default MarkerComponent;
