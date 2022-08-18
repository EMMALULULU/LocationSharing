import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import { AuthContext } from '../../shared/context/auth-context';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './PlaceForm.css';

export default function UpdatePlace() {
  const auth = useContext(AuthContext);
  let navigate = useNavigate();
  const { placeId } = useParams();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [identifiedPlace, setIdentifiedPlace] = useState();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: '',
        isValid: false,
      },
      description: {
        value: '',
        isValid: false,
      },
    },
    false
  );
  useEffect(() => {
    async function fetchPlace() {
      try {
        const response = await sendRequest({
          url: `http://localhost:4000/api/places/${placeId}`,
          method: 'GET',
        });
        setIdentifiedPlace(response.data.place);
        setFormData({
          title: {
            value: identifiedPlace.title,
            isValid: true,
          },
          description: {
            value: identifiedPlace.description,
            isValid: true,
          },
        });
      } catch (err) {}
    }
    fetchPlace();
  }, [sendRequest, placeId, setFormData, identifiedPlace]);

  const placeUpdateSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      var response = await sendRequest({
        url: `http://localhost:4000/api/places/${placeId}`,
        method: 'PATCH',
        data: {
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        },
        headers: { Authorization: 'Bearer ' + auth.token },
      });
    } catch (err) {}
    navigate(`/${response.data.place.creator}/places`, { replace: true });
  };
  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!identifiedPlace && !error) {
    return (
      <div className="center">
        <Card>
          <h2> Could not find place</h2>
        </Card>
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {identifiedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title"
            onInput={inputHandler}
            initialValue={identifiedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            type="text"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (at least five characters)."
            onInput={inputHandler}
            initialValue={identifiedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </>
  );
}
