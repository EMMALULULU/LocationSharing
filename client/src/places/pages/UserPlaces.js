import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

import { useHttpClient } from '../../shared/hooks/http-hook';
import PlaceList from '../components/PlaceList';

export default function UserPlaces() {
  const { userId } = useParams();
  const [loadedPlaces, setLoadedPlaces] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    async function fetchUserPlaces() {
      try {
        const response = await sendRequest({
          url: `http://localhost:4000/api/places/user/${userId}`,
          method: 'GET',
        });

        setLoadedPlaces(response.data.places);
      } catch (err) {}
    }
    fetchUserPlaces();
  }, [sendRequest, userId]);

  const deletePlaceHandler = (placeId) => {
    setLoadedPlaces((prev) => prev.filter((plc) => plc.id !== placeId));
  };
  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDelete={deletePlaceHandler} />
      )}
    </>
  );
}
