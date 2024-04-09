import React from "react";
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "../store/features/featureslice";

function Login() {
  const dispatch = useDispatch();
  const btnState = useSelector((state: RootState) => state.configuration.btn);
  return (
    <div className="card">
      <button onClick={() => dispatch(setState(!btnState))}>
        Login - Button state is {btnState ? "True" : "False"}
      </button>
    </div>
  );
}

export default Login;
