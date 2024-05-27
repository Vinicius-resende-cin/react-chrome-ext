import React from "react";
import { createRoot } from "react-dom/client";
import DependencyView from "../components/DependencyView";

const rootElement = document.querySelector("#dependencies-content-root");
if (rootElement === null) throw new Error("Root not found");

const owner = "";
const repository = "";
const pull_number = 0;

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <DependencyView owner={owner} repository={repository} pull_number={pull_number} />
  </React.StrictMode>
);
