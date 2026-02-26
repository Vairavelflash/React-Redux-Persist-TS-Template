
import { RootState } from "../store/store";
import { useDispatch, useSelector } from "react-redux";
import { setButtonState } from "../store/features/featureslice";

function Home() {
  const dispatch = useDispatch();
  const btnState = useSelector((state: RootState) => state.configuration.buttonState);
  return (
    <div className="card">
      <button onClick={() => dispatch(setButtonState(!btnState))}>
        Home - Button state is {btnState ? "True" : "False"}
      </button>
    </div>
  );
}

export default Home;
