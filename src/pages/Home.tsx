import React from "react";
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { setBtnState } from "../store/features/featureslice";

function Home() {
  const dispatch = useDispatch();
  const btnState = useSelector((state: RootState) => state.configuration.btnState);
  return (
    <div className="card">
      <button onClick={() => dispatch(setBtnState(!btnState))}>
        Home - Button state is {btnState ? "True" : "False"}
      </button>
    </div>
  );
}

export default Home;
