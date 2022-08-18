import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import Input from '../../shared/components/FormElements/Input';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from '../../shared/util/validators';

export default function Login() {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: '',
        isValid: false,
      },
      password: {
        value: '',
        isValid: false,
      },
    },
    false
  );
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const switchModeHandler = (e) => {
    e.preventDefault();
    if (!isLoginMode) {
      //当前是sign up mode 转换去login mode
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      //当前是login mode 转换去sign up mode
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: '',
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }

    setIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (e) => {
    e.preventDefault();

    if (isLoginMode) {
      try {
        const response = await sendRequest({
          url: 'http://localhost:4000/api/users/login',
          method: 'POST',
          data: {
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          },
        });

        auth.login(response.data.userId, response.data.token);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const formData = new FormData();
        formData.append('email', formState.inputs.email.value);
        formData.append('name', formState.inputs.name.value);
        formData.append('password', formState.inputs.password.value);
        formData.append('image', formState.inputs.image.value);
        const response = await sendRequest({
          url: 'http://localhost:4000/api/users/signup',
          method: 'POST',
          data: formData,
        });

        auth.login(response.data.userId, response.data.token);
      } catch (error) {}
    }
    // redirect to my places
  };
  const errorHandler = () => {
    clearError();
  };
  return (
    <>
      <ErrorModal error={error} onClear={errorHandler} />
      {/* {auth.userId && <Navigate replace to={`/${auth.userId}/places`} />} */}
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              id="name"
              label="Your Name"
              element="input"
              type="text"
              onInput={inputHandler}
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a names"
            />
          )}
          {!isLoginMode && (
            <ImageUpload
              id="image"
              center
              onInput={inputHandler}
              errorText="Please provide a photo"
            />
          )}

          <Input
            id="email"
            label="E-Mail"
            element="input"
            type="email"
            onInput={inputHandler}
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address"
          />
          <Input
            id="password"
            onInput={inputHandler}
            validators={[VALIDATOR_MINLENGTH(6)]}
            label="Password"
            element="input"
            type="password"
            errorText="Please enter a valid password at least 6 characters"
          />

          <Button type="submit " disabled={!formState.isValid}>
            {isLoginMode ? 'LOGIN' : 'SIGNUP'}
          </Button>
          <Button inverse onClick={switchModeHandler}>
            {isLoginMode ? 'Go To SIGNUP' : 'Go To LOGIN'}
          </Button>
        </form>
      </Card>
    </>
  );
}
