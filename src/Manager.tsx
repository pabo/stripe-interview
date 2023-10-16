import { useState } from "react";
import "./App.css";

export const Header = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount((x) => x + 1);
  };

  return (
    <>
      <h1>Brett Schellenberg's Stripe Interview</h1>
      <p>
        scaffolded with{" "}
        <span className="inline-code">$ npm create vite@latest</span>
      </p>
      {count}
      <button onClick={handleClick}>Click</button>
    </>
  );
};
