import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
// import { act } from 'react-dom/test-utils';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from '../../shared/util/validators';

import './PlaceForm.css';

export default function NewPlace() {
  const auth = useContext(AuthContext);
  const [finishCreation, setFinishCreation] = useState(false);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false,
      },
      description: {
        value: '',
        isValid: false,
      },
      address: {
        value: '',
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    }.false
  );

  const placeSubmitHandler = (e) => {
    e.preventDefault();
    async function createPlace() {
      try {
        const formData = new FormData();
        formData.append('title', formState.inputs.title.value);
        formData.append('description', formState.inputs.description.value);
        formData.append('address', formState.inputs.address.value);
        formData.append('creator', auth.userId);
        formData.append('image', formState.inputs.image.value);

        await sendRequest({
          url: 'http://localhost:4000/api/places',
          method: 'POST',
          data: formData,
          headers: { Authorization: 'Bearer ' + auth.token },
        });

        // redirect to my places page
        setFinishCreation(true);
      } catch (error) {
        console.log(error);
      }
    }
    createPlace();
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {finishCreation && <Navigate replace to={`/${auth.userId}/places`} />}
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner />}

        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title"
          onInput={inputHandler}
        />
        <Input
          id="address"
          element="input"
          type="text"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid address "
          onInput={inputHandler}
        />
        <ImageUpload
          id="image"
          onInput={inputHandler}
          errorText="Please provide a photo"
        />
        <Input
          id="description"
          element="textarea"
          type="text"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least five characters)."
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </>
  );
}
