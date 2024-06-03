import React, { useCallback, useEffect, useState } from 'react';
import { useLoadScript, Libraries } from '@react-google-maps/api';
import { DataSnapshot, onValue, ref, remove, set } from 'firebase/database';
import { db } from '../../firebase/firebaseConfig';
import { MarkerData } from '../../types/marker';
import { Map } from '../../components/Map';

const mapContainerStyle = {
  marginTop: 20,
  width: '80vw',
  height: '80vh',
};
const center = {
  lat: 49.811947,
  lng: 24.0187099,
};

const staticLibraries = ['places'] as Libraries;

export const HomePage = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBbPgt5B3BfouJCrwT_80fVlPr0jnoKz2Y',
    libraries: staticLibraries,
  });

  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selected, setSelected] = useState<MarkerData | null>(null);

  useEffect(() => {
    const markersRef = ref(db, 'quests');
    const handleData = (snapshot: DataSnapshot) => {
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
    };
    const unsubscribe = onValue(markersRef, handleData);

    return () => unsubscribe();
  }, []);

  const saveMarkerToFirebase = useCallback(
    (marker: MarkerData) => {
      const newQuestRef = ref(db, `quests/Quest ${marker.id}`);
      set(newQuestRef, {
        location: {
          lat: marker.lat,
          lng: marker.lng,
        },
        timestamp: new Date().toISOString(),
        next: marker.id === markers.length + 1 ? `Quest ${marker.id + 1}` : '',
      });
    },
    [markers.length]
  );

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
    [markers, saveMarkerToFirebase]
  );

  const onMarkerClick = useCallback((marker: MarkerData) => {
    setSelected(marker);
  }, []);

  const updateMarkerInFirebase = useCallback((marker: MarkerData) => {
    const markerRef = ref(db, `quests/Quest ${marker.id}`);
    set(markerRef, {
      location: {
        lat: marker.lat,
        lng: marker.lng,
      },
      timestamp: new Date().toISOString(),
    });
  }, []);

  const onMarkerDragEnd = useCallback(
    (event: google.maps.MapMouseEvent, marker: MarkerData) => {
      const updatedMarker = {
        ...marker,
        lat: event.latLng!.lat(),
        lng: event.latLng!.lng(),
      };
      setMarkers((current) =>
        current.map((m) => (m.id === marker.id ? updatedMarker : m))
      );
      updateMarkerInFirebase(updatedMarker);
    },
    [updateMarkerInFirebase]
  );

  const deleteMarker = useCallback(
    (id: number) => {
      setMarkers((current) => current.filter((marker) => marker.id !== id));
      const markerRef = ref(db, `quests/Quest ${id}`);
      remove(markerRef);
      if (selected?.id === id) {
        setSelected(null);
      }
    },
    [selected]
  );

  const clearMarkers = useCallback(() => {
    setMarkers([]);
    const questsRef = ref(db, 'quests');
    remove(questsRef);
    setSelected(null);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <Map
      markers={markers}
      selected={selected}
      setSelected={setSelected}
      onMapClick={onMapClick}
      onMarkerClick={onMarkerClick}
      onMarkerDragEnd={onMarkerDragEnd}
      deleteMarker={deleteMarker}
      clearMarkers={clearMarkers}
      center={center}
      mapContainerStyle={mapContainerStyle}
    />
  );
};
