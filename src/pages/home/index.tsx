import React, { useState, useCallback, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindowF,
  Libraries,
  MarkerClustererF,
} from '@react-google-maps/api';
import { db } from '../../firebaseConfig';
import { ref, set, remove, onValue } from 'firebase/database';
import { MarkerData } from '../../types/marker';
import { Button, Flex } from 'antd';

const libraries: Libraries = ['places'];
const mapContainerStyle = {
  width: '80vw',
  height: '80vh',
};
const center = {
  lat: 49.811947,
  lng: 24.0187099,
};

const staticLibraries = ['places'] as Libraries; // Avoid recreation of libraries array

export const HomePage = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBbPgt5B3BfouJCrwT_80fVlPr0jnoKz2Y',
    libraries: staticLibraries,
  });

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selected, setSelected] = useState<MarkerData | null>(null);

  useEffect(() => {
    const markersRef = ref(db, 'quests');
    onValue(markersRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const loadedMarkers = Object.keys(data).map((key) => ({
          id: parseInt(key.split(' ')[1], 10),
          lat: data[key].location.lat,
          lng: data[key].location.lng,
          label: key.split(' ')[1],
        }));
        setMarkers(loadedMarkers);
      }
    });
  }, []);

  const onMapClick = useCallback(
    (event: google.maps.MapMouseEvent) => {
      const newMarker = {
        id: markers.length + 1,
        lat: event.latLng!.lat(),
        lng: event.latLng!.lng(),
        label: `${markers.length + 1}`,
      };
      setMarkers((current) => [...current, newMarker]);
      saveMarkerToFirebase(newMarker);
    },
    [markers]
  );

  const saveMarkerToFirebase = (marker: MarkerData) => {
    const newQuestRef = ref(db, `quests/Quest ${marker.id}`);
    set(newQuestRef, {
      location: {
        lat: marker.lat,
        lng: marker.lng,
      },
      timestamp: new Date().toISOString(),
      next: marker.id === markers.length + 1 ? `Quest ${marker.id + 1}` : '',
    });
  };

  const onMarkerClick = (marker: MarkerData) => {
    setSelected(marker);
  };

  const updateMarkerInFirebase = (marker: MarkerData) => {
    const markerRef = ref(db, `quests/Quest ${marker.id}`);
    set(markerRef, {
      location: {
        lat: marker.lat,
        lng: marker.lng,
      },
      timestamp: new Date().toISOString(),
    });
  };

  const deleteMarker = (id: number) => {
    setMarkers((current) => current.filter((marker) => marker.id !== id));
    const markerRef = ref(db, `quests/Quest ${id}`);
    remove(markerRef);
    if (selected?.id === id) {
      setSelected(null);
    }
  };

  const clearMarkers = () => {
    setMarkers([]);
    const questsRef = ref(db, 'quests');
    remove(questsRef);
    setSelected(null);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <div style={{ backgroundColor: '#221f1f', height: '100vh' }}>
      <div
        style={{
          display: 'table-row',
        }}
      >
        <Button onClick={clearMarkers} type='primary'>
          Clear Markers
        </Button>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={12}
          center={center}
          onClick={onMapClick}
        >
          {markers.map((marker) => (
            <MarkerF
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              label={marker.label}
              draggable
              onDragEnd={(event) => {
                const updatedMarker = {
                  ...marker,
                  lat: event.latLng!.lat(),
                  lng: event.latLng!.lng(),
                };
                setMarkers((current) =>
                  current.map((m) => (m.id === marker.id ? updatedMarker : m))
                );
                updateMarkerInFirebase(updatedMarker);
              }}
              onClick={() => onMarkerClick(marker)}
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