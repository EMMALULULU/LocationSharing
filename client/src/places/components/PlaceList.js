import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../shared/context/auth-context';
import PlaceItem from './PlaceItem';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import './PlaceList.css';

export default function PlaceList({ items, onDelete }) {
  const auth = useContext(AuthContext);
  const { userId } = useParams();
  if (items.length === 0) {
    return (
      <div className="place-list center">
        <Card>
          <h2>No Places Found</h2>
          {userId === auth.userId && (
            <Button to="/places/new">Share Place </Button>
          )}
        </Card>
      </div>
    );
  }
  return (
    <ul className="place-list ">
      {items.map((place) => (
        <PlaceItem
          key={place.id}
          id={place.id}
          image={place.image}
          title={place.title}
          description={place.description}
          address={place.address}
          creatorId={place.creator}
          coordinates={place.location}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
