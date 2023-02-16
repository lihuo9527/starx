import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
// utils
import axios from '../utils/axios';
import { isValidToken, setSession } from '../utils/jwt';
import * as api from '../services/api-client';

import defaultAvatar from '../assets/images/avatar.jpeg';
// ----------------------------------------------------------------------

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { user } = action.payload;
    return {
      ...state,
      isAuthenticated: Boolean(user && user.vip),
      isInitialized: true,
      user,
      isSub: !user || user.isSubAccount === 'TRUE',
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: Boolean(user?.vip),
      user,
      isSub: !user || user.isSubAccount === 'TRUE',
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
  // REGISTER: (state, action) => {
  //   const { user } = action.payload;

  //   return {
  //     ...state,
  //     isAuthenticated: Boolean(user?.vip),
  //     user,
  //   };
  // },
  // SETAUTH: (state, action) => ({
  //   ...state,
  //   isAuthenticated: action.payload,
  // }),
};

const reducer = (state, action) => (handlers[action.type] ? handlers[action.type](state, action) : state);

const AuthContext = createContext({
  ...initialState,
  method: 'jwt',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),

  getCurrentUser: () => Promise.resolve(),
});

// ----------------------------------------------------------------------

AuthProvider.propTypes = {
  children: PropTypes.node,
};

function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          const user = await getCurrentUser(false);

          dispatch({
            type: 'INITIALIZE',
            payload: {
              user,
            },
          });
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const getCurrentUser = async (login = true) => {
    const response = await api.getUserInfo();
    console.log(response)
    const user = response.userInfo;

    // 写入一个默认头像
    if (!user.iconUrl) user.iconUrl = defaultAvatar;

    if (!login) return user;

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });

    return user;
  }
  const login = async (values, isRemember = false) => {

    // 获取用户信息
    const user = await getCurrentUser(false);
    // setSession(accessToken);

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
    return user;
  };


  const logout = async () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'jwt',
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };
