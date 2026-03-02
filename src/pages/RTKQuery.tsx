import React, { useEffect, useState } from "react";

import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useGetFakedataByIdQuery,
  useUpdateTodoMutation,
} from "../services/fakeAPI";

function RTKQuery() {
  const [count, setCount] = useState(1);

  const increment = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <button onClick={increment}>Add 1</button>
      <p>Count: {count}</p>
      <GetChild count={count} />
      <PostChild />
      <UpdateChild />
      <DeleteChild />
    </div>
  );
}
function GetChild({ count }: { count: number }) {

  const {
    data: data1,
    error: error1,
    isLoading: isLoading1,
  } = useGetFakedataByIdQuery(
    { id: count.toString() },
    { refetchOnMountOrArgChange: true },
  );

  console.log("first", data1);
  return (
    <div className="App">
     
      {error1 ? (
        <>Oh no, there was an error</>
      ) : isLoading1 ? (
        <>Loading...</>
      ) : data1 ? (
        <>
         GET RTK:<h3>{data1.title}</h3>
        </>
      ) : null}
    </div>
  );
}

function PostChild() {
  const [data, setData] = useState(null);

  const [createTodo, { isLoading }] = useCreateTodoMutation();

  const handleCreate = async () => {
    try {
      const response = await createTodo({ title: "New Todo" }).unwrap();
      console.log("Success", response);
      setData(response);
    } catch (error) {
      console.log("error", error);
    }
  };
  return (
    <div>
      <button onClick={handleCreate}>POST</button>
      {isLoading ? <>..loading</> : JSON.stringify(data)}
    </div>
  );
}

function DeleteChild() {
  const [deleteTodo, { isLoading }] = useDeleteTodoMutation();

  const handleDelete = async () => {
    try {
      const response = await deleteTodo({ id: "201" }).unwrap();
      console.log("Success", response);
    } catch (error) {
      console.log("Error", error);
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>DELETE</button>
    </div>
  );
}

function UpdateChild() {
  const [updateTodo, { isLoading }] = useUpdateTodoMutation();

  const handleUpdate = async () => {
    try {
      const response = await updateTodo({
        id: "201",
        title: "Update Title",
      }).unwrap();
      console.log("Success", response);
    } catch (error) {
      console.log("Error", error);
    }
  };
  return (
    <div>
      <button onClick={handleUpdate}>PUT</button>
    </div>
  );
}
export default RTKQuery;
